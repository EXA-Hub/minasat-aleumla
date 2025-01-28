import { logTransaction } from '../../../../utils/schemas/transactionLogger.js';
import User from '../../../../utils/schemas/mongoUserSchema.js';
import { DiscordAPI } from '../services/discordApi.js';
import discordApp from '../../../../apps/discord.js';
import { ws } from '../../../../utils/webhook.js';

export class CommandHandlers {
  #discordApi;

  constructor() {
    this.#discordApi = DiscordAPI.getInstance();
  }

  async handlePing({ discordUserData, interaction }) {
    const latency = Date.now() - interaction.id / 4194304 + 1420070400000;
    const showLatency = interaction.data.options?.[0]?.value;

    await this.#discordApi.sendFollowUpMessage(interaction, {
      content: `**بونج!** <@${discordUserData.id}>${
        showLatency
          ? `\n**تأخير:** ${latency} **مللي ثانية**`
          : `\n*||حساب التأخير غير متوفر||*`
      }\n\n🌟 **شكراً لك على التفاعل!** 🌟`,
    });
  }

  async handleWallet({
    discordUserData,
    interaction,
    user,
    EMOJIS,
    subscriptions,
  }) {
    const targetId = interaction.data.options?.[0]?.value;
    const target =
      targetId & (discordUserData.id !== targetId)
        ? await User.findOne({
            'apps.Discord': { $elemMatch: { id: targetId } },
          })
        : user;

    if (!target) {
      await this.#discordApi.sendFollowUpMessage(interaction, {
        content: `⚠️ **المستخدم غير موجود أو لم يتم ربط حساب ديسكورد.** ⚠️`,
      });
      return;
    }

    if (target.privacy.showWallet && target.privacy.showProfile) {
      await this.#discordApi.sendFollowUpMessage(interaction, {
        embeds: [
          {
            title: 'معلومات المستخدم',
            fields: [
              {
                name: 'اسم المستخدم',
                value: `\`@${target.username}\``,
                inline: true,
              },
              {
                name: 'الرصيد',
                value: `**${target.balance}${EMOJIS.icon}**`,
                inline: true,
              },
              {
                name: 'الرسوم',
                value: `*${subscriptions[target.tier].features.wallet.fee}%*`,
                inline: true,
              },
            ],
            color: 0x00ff00,
            footer: {
              text: `تم الطلب بواسطة ${discordUserData.username}`,
              icon_url: discordApp.image(
                user,
                discordUserData.id,
                'profilePicture'
              ),
            },
          },
        ],
      });
      return;
    }

    await this.#discordApi.sendFollowUpMessage(interaction, {
      content: `⚠️ **لا يمكن عرض رصيد** \`@${target.username}\``,
    });
  }

  async handleSendCoins({
    discordUserData,
    interaction,
    user,
    EMOJIS,
    subscriptions,
  }) {
    const { target, amount, payfee } = interaction.data.options?.reduce(
      (acc, option) => {
        acc[option.name] = option.value;
        return acc;
      },
      {}
    );

    const payFee = payfee || false;

    if (!target) {
      await this.#discordApi.sendFollowUpMessage(interaction, {
        content: `⚠️ **المستخدم غير موجود أو لم يتم ربط حساب ديسكورد.** ⚠️`,
      });
      return;
    }

    if (!amount) {
      await this.#discordApi.sendFollowUpMessage(interaction, {
        content: `⚠️ **المبلغ غير صحيح.**`,
      });
      return;
    }

    const { maxSend, fee } = subscriptions[user.tier].features.wallet;
    if (isNaN(amount) || amount <= 0 || !(maxSend > amount)) {
      await this.#discordApi.sendFollowUpMessage(interaction, {
        content: `⚠️ **المبلغ غير صحيح.**\n الحد الأعلى للإرسال هو ${maxSend}${EMOJIS.icon}`,
      });
      return;
    }

    const feeAmount = Math.ceil((amount * fee) / 100);
    let taking = payFee ? amount + feeAmount : amount;
    let giving = payFee ? amount : amount - feeAmount;

    if (user.balance < taking) {
      await this.#discordApi.sendFollowUpMessage(interaction, {
        content: `⚠️ **لا يوجد رصيد كافي في حسابك.**`,
      });
      return;
    }

    if (target === discordUserData.id) {
      await this.#discordApi.sendFollowUpMessage(interaction, {
        content: `🚫 **لا يمكنك إرسال رصيد لنفسك!** 😅`,
      });
      return;
    }

    const recipientUser = await User.findOne({
      'apps.Discord': { $elemMatch: { id: target } },
    });
    if (!recipientUser) {
      await this.#discordApi.sendFollowUpMessage(interaction, {
        content: `⚠️ **المستخدم غير موجود أو لم يتم ربط حساب ديسكورد.** ⚠️`,
      });
      return;
    }

    if (user._id.equals(recipientUser._id)) {
      await this.#discordApi.sendFollowUpMessage(interaction, {
        content: `🚫 **لا يمكنك إرسال رصيد لنفسك!** 😅`,
      });
      return;
    }

    await this.#discordApi.sendFollowUpMessage(interaction, {
      content: `✅ **تم تحويل** ${amount}${EMOJIS.icon} **إلى** \`@${recipientUser.username}\`! 🎉`,
    });

    // Update sender's balance
    user.balance -= taking;
    user.transactionStats.totalSpent += taking;
    user.transactionStats.totalTransactions += 1;
    if (user.referralId) user.tax += Math.floor(feeAmount / 2);
    await user.save();

    await this.#discordApi.sendDM(discordUserData.id, {
      content: `💸 **تم خصم** ${taking}${EMOJIS.icon} **من حسابك** \`@${user.username}\`\n🔄 **تم تحويل** ${giving}${EMOJIS.icon} **لحساب** \`@${recipientUser.username}\``,
    });

    // Update recipient's balance
    recipientUser.balance += giving; // Recipient gets the original amount
    recipientUser.transactionStats.totalReceived += giving;
    recipientUser.transactionStats.totalTransactions += 1;
    await recipientUser.save();

    await this.#discordApi.sendDM(target, {
      content: `✅ **تم إضافة** ${giving}${EMOJIS.icon} **لحسابك** \`@${recipientUser.username}\`\n🔄 **تم تحويل** ${taking}${EMOJIS.icon} **من حساب** \`@${user.username}\``,
    });

    // Log the transaction
    await logTransaction({
      sender: user,
      recipient: recipientUser,
      amount,
      description: 'تحويل من خلال ديسكورد',
      feeAmount,
      payerPaidFee: payFee,
    });

    await ws.wss.sendNotification(
      'تم إستلام تحويل ديسكورد 💸',
      Date.now(),
      recipientUser.username
    );
  }
}

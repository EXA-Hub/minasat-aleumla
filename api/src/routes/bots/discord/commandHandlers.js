import {
  InteractionType,
  MessageComponentTypes,
  ButtonStyleTypes,
} from 'discord-interactions';
import { logTransaction } from '../../../utils/schemas/transactionLogger.js';
import User from '../../../utils/schemas/mongoUserSchema.js';
import discordApp from '../../../apps/discord.js';
import { ws } from '../../../utils/webhook.js';

export class CommandHandlers {
  #discordApi;

  constructor(DiscordAPI, CONFIG, config) {
    this.#discordApi = DiscordAPI.getInstance();
    this._CONFIG = CONFIG;
    this._config = config;
    this.commandRegistry = new Map();
    // Register commands
    this.registerCommand('ping', this.handlePing);
    this.registerCommand('wallet', this.handleWallet);
    this.registerCommand('sendcoins', this.handleSendCoins);
    this.registerCommand('verify_button', this.handleVerify);
    this.registerCommand('add_balance', this.adjustBalance);
    this.registerCommand('remove_balance', this.adjustBalance);
    this.registerCommand(
      'view_bank_account_button',
      this.handleViewBankAccount
    );
  }

  registerCommand(commandName, handler) {
    this.commandRegistry.set(commandName, handler.bind(this));
  }

  async handleInteraction(
    interactionType,
    { discordUserData, interaction, user }
  ) {
    const handler = this.commandRegistry.get(
      interactionType === InteractionType.APPLICATION_COMMAND
        ? interaction.data?.name
        : interaction.data?.custom_id
    );

    if (!handler)
      return await this.#discordApi.sendFollowUpMessage(interaction, {
        content: 'أمر غير معروف :skull:',
      });

    try {
      return await handler({ discordUserData, interaction, user });
    } catch (error) {
      console.error(`Error handling interaction:`, error);
      return await this.#discordApi.sendFollowUpMessage(interaction, {
        content: this._CONFIG.DEFAULT_ERROR_MESSAGE,
      });
    }
  }

  async adjustBalance({ discordUserData, interaction, user }) {
    try {
      if (!interaction.member?.roles?.includes(this._CONFIG.DISCORD.ADMIN_ROLE))
        return await this.#discordApi.sendFollowUpMessage(interaction, {
          content: `> **⚠️ تحتاج إلى رتبة <@&${this._CONFIG.DISCORD.ADMIN_ROLE}>**`,
          allowed_mentions: { parse: [] },
        });
      const amount = parseInt(
        interaction.data.components
          .flatMap((c) => c.components)
          .find((comp) => comp.custom_id === 'amount')?.value,
        10
      );
      if (isNaN(amount) || amount < 1)
        return await this.#discordApi.sendFollowUpMessage(interaction, {
          content: `> **رقم غير صحيح *\`${amount}\`${this._CONFIG.EMOJIS.icon}***`,
          allowed_mentions: { parse: [] },
        });
      const targetId = interaction.data.components
        .flatMap((c) => c.components)
        .find((comp) => comp.custom_id === 'discord_id')?.value;
      const target =
        targetId && discordUserData.id !== targetId
          ? await User.findOne({
              'apps.Discord': { $elemMatch: { id: targetId } },
            })
          : user;
      if (!target)
        return await this.#discordApi.sendFollowUpMessage(interaction, {
          content: `> **⚠️ مستخدم غير موجود ${this._CONFIG.EMOJIS.icon}!**`,
          allowed_mentions: { parse: [] },
        });
      const password = interaction.data.components
        .flatMap((c) => c.components)
        .find((comp) => comp.custom_id === 'password')?.value;
      const bank = await User.findOne({
        username: 'bank',
        password: password,
      });
      if (!bank)
        return await this.#discordApi.sendFollowUpMessage(interaction, {
          content: `> **⚠️ كلمة السر غير صحيحة ${this._CONFIG.EMOJIS.icon}!**`,
          allowed_mentions: { parse: [] },
        });
      switch (interaction.data.custom_id) {
        case 'add_balance':
          if (bank.balance < amount)
            return await this.#discordApi.sendFollowUpMessage(interaction, {
              content: `> **⚠️ رصيد البنك غير كافي *\`${bank.balance}\`${this._CONFIG.EMOJIS.icon}*!**`,
              allowed_mentions: { parse: [] },
            });
          target.balance += amount;
          bank.balance -= amount;
          await bank.save();
          await target.save();
          await this.#discordApi.sendFollowUpMessage(interaction, {
            content: `> **تم إرسال *\`${amount}\`${this._CONFIG.EMOJIS.icon}* إلى <@!${targetId}>**`,
            allowed_mentions: { parse: [] },
          });
          await this.#discordApi.sendDM(targetId, {
            content: `> **تم إرسال *\`${amount}\`${this._CONFIG.EMOJIS.icon}* إليك**\n> رصيدك الحالي: **\`${target.balance}\`**${this._CONFIG.EMOJIS.icon}`,
          });
          break;
        case 'remove_balance':
          if (target.balance < amount)
            return await this.#discordApi.sendFollowUpMessage(interaction, {
              content: `> **⚠️ رصيد المستخدم غير كافي *\`${target.balance}\`${this._CONFIG.EMOJIS.icon}*!**`,
              allowed_mentions: { parse: [] },
            });
          target.balance -= amount;
          bank.balance += amount;
          await bank.save();
          await target.save();
          await this.#discordApi.sendFollowUpMessage(interaction, {
            content: `> **تم إرسال *\`${amount}\`${this._CONFIG.EMOJIS.icon}* إلى البنك**`,
            allowed_mentions: { parse: [] },
          });
          await this.#discordApi.sendDM(targetId, {
            content: `> **تم إرسال *\`${amount}\`${this._CONFIG.EMOJIS.icon}* إلى البنك**\n> رصيدك الحالي: **\`${target.balance}\`**${this._CONFIG.EMOJIS.icon}`,
          });
          break;
        default:
          await this.#discordApi.sendFollowUpMessage(interaction, {
            content: `> **⚠️ عملية غير موجودة \`${interaction.data.custom_id}\`!**`,
            allowed_mentions: { parse: [] },
          });
          break;
      }
    } catch (error) {
      console.error('❌ Error in adjustBalance:', error);
      return await this.#discordApi.sendFollowUpMessage(interaction, {
        content: this._CONFIG.DEFAULT_ERROR_MESSAGE,
        allowed_mentions: { parse: [] },
      });
    }
  }

  async handleViewBankAccount({ discordUserData, interaction, user }) {
    if (
      discordUserData.id === this._CONFIG.DISCORD.OWNER_ID &&
      user.username === discordUserData.username
    ) {
      const bankAccount = await User.findOne({
        username: 'bank',
      });
      if (!bankAccount) {
        if (
          interaction.message.components[0].components[0].label ===
          'إنشاء حساب بنك'
        ) {
          await User.create({
            username: 'bank',
            password: 'bank',
          });
          return await this.#discordApi.sendFollowUpMessage(interaction, {
            content: `> **تم انشاء حساب بنك. :white_check_mark: **`,
          });
        } else {
          return await this.#discordApi.sendFollowUpMessage(interaction, {
            content: `> **لا يوجد حساب بنك.**`,
            components: [
              {
                type: MessageComponentTypes.ACTION_ROW, // 1
                components: [
                  {
                    type: MessageComponentTypes.BUTTON, // 2
                    style: ButtonStyleTypes.SECONDARY, // 2
                    label: 'إنشاء حساب بنك',
                    custom_id: 'view_bank_account_button',
                  },
                ],
              },
            ],
          });
        }
      } else if (
        interaction.message.components[0].components[0].label ===
        'إضافة 100 عملة'
      ) {
        bankAccount.balance += 100;
        await bankAccount.save();
        return await this.#discordApi.sendFollowUpMessage(interaction, {
          content: `> **تم اضافة 100 عملة. :white_check_mark: **`,
        });
      } else {
        return await this.#discordApi.sendFollowUpMessage(interaction, {
          embeds: [
            {
              color: 0x2ecc71, // لون أخضر يشير إلى النجاح
              title: ':white_check_mark: تم استعادة حساب بنك بنجاح!',
              fields: [
                {
                  name: 'معلومات الحساب',
                  value: `
      • **اسم المستخدم:** \`${bankAccount.username}\`
      • **كلمة المرور:** ||\`${bankAccount.password}\`||
      • **رقم الحساب:** \`${bankAccount._id}\`
                `,
                  inline: false,
                },
                {
                  name: 'تفاصيل الحساب',
                  value: `
      • **رصيد الحساب:** ${bankAccount.balance} ${this._CONFIG.EMOJIS.icon}
                `,
                  inline: false,
                },
              ],
              footer: {
                text: '⚠️ يرجى الاحتفاظ بمعلومات الحساب في مكان آمن وعدم مشاركتها مع أي شخص.',
              },
            },
          ],
          components: [
            {
              type: MessageComponentTypes.ACTION_ROW, // نوع الصف (Action Row)
              components: [
                {
                  type: MessageComponentTypes.BUTTON, // نوع المكون (Button)
                  style: ButtonStyleTypes.SECONDARY, // نمط الزر (Secondary = رمادي)
                  label: 'إضافة 100 عملة', // نص الزر
                  emoji: {
                    name: this._CONFIG.EMOJIS.icon.match(
                      /<:(\w+):(\d{17,})>/
                    )[1],
                    id: this._CONFIG.EMOJIS.icon.match(/<:(\w+):(\d{17,})>/)[2],
                  },
                  custom_id: 'view_bank_account_button', // معرف الزر للاستجابة
                },
              ],
            },
          ],
        });
      }
    } else {
      return await this.#discordApi.sendFollowUpMessage(interaction, {
        content: `⚠️ **لا يمكنك استخدام هذا الامر.**`,
      });
    }
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

  async handleWallet({ discordUserData, interaction, user }) {
    const targetId = interaction.data.options?.[0]?.value;
    const target =
      targetId && discordUserData.id !== targetId
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
                value: `**${target.balance}${this._CONFIG.EMOJIS.icon}**`,
                inline: true,
              },
              {
                name: 'الرسوم',
                value: `*${
                  this._config.subscriptions[target.tier].features.wallet.fee
                }%*`,
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

  async handleSendCoins({ discordUserData, interaction, user }) {
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

    const { maxSend, fee } =
      this._config.subscriptions[user.tier].features.wallet;
    if (isNaN(amount) || amount <= 0 || !(maxSend > amount)) {
      await this.#discordApi.sendFollowUpMessage(interaction, {
        content: `⚠️ **المبلغ غير صحيح.**\n الحد الأعلى للإرسال هو ${maxSend}${this._CONFIG.EMOJIS.icon}`,
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
      content: `✅ **تم تحويل** ${amount}${this._CONFIG.EMOJIS.icon} **إلى** \`@${recipientUser.username}\`! 🎉`,
    });

    // Update sender's balance
    user.balance -= taking;
    user.transactionStats.totalSpent += taking;
    user.transactionStats.totalTransactions += 1;
    if (user.referralId) user.tax += Math.floor(feeAmount / 2);
    await user.save();

    await this.#discordApi.sendDM(discordUserData.id, {
      content: `💸 **تم خصم** ${taking}${this._CONFIG.EMOJIS.icon} **من حسابك** \`@${user.username}\`\n🔄 **تم تحويل** ${giving}${this._CONFIG.EMOJIS.icon} **لحساب** \`@${recipientUser.username}\``,
    });

    // Update recipient's balance
    recipientUser.balance += giving; // Recipient gets the original amount
    recipientUser.transactionStats.totalReceived += giving;
    recipientUser.transactionStats.totalTransactions += 1;
    await recipientUser.save();

    await this.#discordApi.sendDM(target, {
      content: `✅ **تم إضافة** ${giving}${this._CONFIG.EMOJIS.icon} **لحسابك** \`@${recipientUser.username}\`\n🔄 **تم تحويل** ${taking}${this._CONFIG.EMOJIS.icon} **من حساب** \`@${user.username}\``,
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

  async handleVerify({ discordUserData, interaction }) {
    if (this._CONFIG.DISCORD.VERIFICATION_CHANNEL !== interaction.channel_id) {
      await this.#discordApi.sendFollowUpMessage(interaction, {
        content: `⚠️ **لا يمكنك استخدام هذا الامر في هذه القناة.**`,
      });
      return;
    }
    await this.#discordApi.sendFollowUpMessage(interaction, {
      content: `✅ **تم التحقق من حسابك.**\n يمكنك الدخول للسيرفر.`,
    });
    return await this.#discordApi.addUserToRole(
      interaction.guild_id,
      this._CONFIG.DISCORD.VERIFICATION_ROLE,
      discordUserData.id
    );
  }
}

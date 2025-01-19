import User from '../../../../../utils/schemas/mongoUserSchema.js';
import discordApp from '../../../../../apps/discord.js';
import { DiscordAPI } from '../services/discordApi.js';

export class CommandHandlers {
  #discordApi;

  constructor() {
    this.#discordApi = DiscordAPI.getInstance();
  }

  async handlePing(interaction) {
    const latency = Date.now() - interaction.id / 4194304 + 1420070400000;
    const showLatency = interaction.data.options?.[0]?.value;

    await this.#discordApi.sendFollowUpMessage(interaction, {
      content: `بونج! <@${interaction.member.user.id}>${
        showLatency ? `\n${latency} مللي ثانية` : '\n||حساب التأخير غير متوفر||'
      }`,
    });
  }

  async handleWallet(interaction, user, emojis, subscriptions) {
    const targetId = interaction.data.options?.[0]?.value;
    const target = targetId
      ? await User.findOne({ 'apps.Discord': { $elemMatch: { id: targetId } } })
      : user;

    if (!target) {
      await this.#discordApi.sendFollowUpMessage(interaction, {
        content: 'المستخدم غير موجود أو لم يتم ربط حساب ديسكورد.',
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
                value: `**${target.balance}${emojis.icon}**`,
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
              text: `تم الطلب بواسطة ${interaction.member.user.username}`,
              icon_url: discordApp.image(
                user,
                interaction.member.user.id,
                'profilePicture'
              ),
            },
          },
        ],
      });
      return;
    }

    await this.#discordApi.sendFollowUpMessage(interaction, {
      content: `لا يمكن عرض رصيد ${target.username}`,
    });
  }
}

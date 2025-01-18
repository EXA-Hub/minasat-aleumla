import { readFile } from 'fs/promises';
import User from '../../../../../utils/schemas/mongoUserSchema.js';
import { sendFollowUpMessage } from './sendFollowUpMessage.js';
import discordApp from '../../../../../apps/discord.js';
import config from '../../../../../config.js';

const { subscriptions } = config;
const emojis = JSON.parse(
  await readFile(new URL('../assets/emojis.json', import.meta.url))
);

export const appCmds = async (interaction) => {
  const user = await User.findOne({
    'apps.Discord': {
      $elemMatch: { id: interaction.member.user.id },
    },
  });

  if (!user) {
    await sendFollowUpMessage(interaction, {
      content: `مرحبًا <@${interaction.member.user.id}>، يبدو أنك لم تقم بربط أي حساب من المنصة بعد ${emojis.icon}!`,
      allowed_mentions: { parse: [] },
    });
    return true;
  }

  switch (interaction.data.name) {
    case 'ping': {
      const latency = Date.now() - interaction.id / 4194304 + 1420070400000;
      await sendFollowUpMessage(interaction, {
        content: `بونج بونج <@${interaction.member.user.id}>!${
          interaction.data.options?.[0]?.value
            ? `\n${latency}ms (مللي ثانية)`
            : '\n|| في الواقع لا أعرف طريقة حساب التأخير||'
        }`,
      });
      break;
    }

    case 'wallet': {
      const target = interaction.data.options?.[0]?.value
        ? await User.findOne({
            'apps.Discord': {
              $elemMatch: { id: interaction.data.options[0].value },
            },
          })
        : user;

      if (!target) {
        await sendFollowUpMessage(interaction, {
          content: 'المستخدم غير موجود. أو لم يتم ربط حساب الديسكورد هذا.',
        });
        break;
      }

      if (target.privacy.showWallet && target.privacy.showProfile)
        await sendFollowUpMessage(interaction, {
          embeds: [
            {
              title: 'معلومات المستخدم', // Embed title
              fields: [
                {
                  name: 'إسم المستخدم', // Field name
                  value: `\`@${target.username}\``, // Field value
                  inline: true, // Display inline (side by side)
                },
                {
                  name: 'الرصيد', // Field name
                  value: `**${target.balance}${emojis.icon}**`, // Field value
                  inline: true, // Display inline (side by side)
                },
                {
                  name: 'الرسوم', // Field name
                  value: `*${subscriptions[target.tier].features.wallet.fee}%*`, // Field value
                  inline: true, // Display inline (side by side)
                },
              ],
              color: 0x00ff00, // Embed color (green in this case)
              footer: {
                text: 'طلب بواسطة ' + interaction.member.user.username, // Footer text
                icon_url: discordApp.image(
                  user,
                  interaction.member.user.id,
                  'profilePicture'
                ), // Footer icon (user avatar)
              },
            },
          ],
        });
      else
        await sendFollowUpMessage(interaction, {
          content: `> لا يمكن إظهار الرصيد لـ${target.username}`,
        });
      break;
    }

    default: {
      await sendFollowUpMessage(interaction, {
        content: 'كيف وصلت لهذا الأمر؟ لا أستطيع الرد عليك :skull:',
      });
    }
  }

  return true;
};

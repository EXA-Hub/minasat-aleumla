// api/src/routes/websockets/bots/discord/commands/interaction.js

// Suppress Ed25519 experimental warning
process.removeAllListeners('warning');

import { Router } from 'express';
import { readFile } from 'fs/promises';
import {
  InteractionType,
  InteractionResponseType,
  verifyKeyMiddleware,
} from 'discord-interactions';
import { sendFollowUpMessage } from '../functions/sendFollowUpMessage.js';
import User from '../../../../../utils/schemas/mongoUserSchema.js';
import discordApp from '../../../../../apps/discord.js';
import config from '../../../../../config.js';

const { subscriptions } = config;
const emojis = JSON.parse(
  await readFile(new URL('../assets/emojis.json', import.meta.url))
);

const router = Router();

// Discord Interactions Endpoint URL
router.post(
  '/interactions',
  verifyKeyMiddleware(process.env.DISCORD_PUBLIC_KEY),
  async (req, res) => {
    try {
      const { body: interaction } = req;

      if (interaction.type !== InteractionType.APPLICATION_COMMAND)
        return res.sendStatus(400);

      // First respond quickly to avoid timeout
      res.send({
        type: InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
      });

      const user = await User.findOne({
        'apps.Discord': {
          $elemMatch: { id: interaction.member.user.id },
        },
      });

      if (!user)
        return await sendFollowUpMessage(interaction, {
          content: `مرحبًا <@${interaction.member.user.id}>، يبدو أنك لم تقم بربط أي حساب من المنصة بعد ${emojis.icon}!`,
          allowed_mentions: { parse: [] },
        });

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

          if (!target)
            return await sendFollowUpMessage(interaction, {
              content: 'المستخدم غير موجود. أو لم يتم ربط حساب الديسكورد هذا.',
            });

          if (target.privacy.showWallet || target.privacy.showProfile)
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
                      value: `*${
                        subscriptions[target.tier].features.wallet.fee
                      }%*`, // Field value
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
    } catch (error) {
      console.error(error);
      if (!res.headersSent) res.sendStatus(500);
    }
  }
);

export default router;

// api/src/routes/websockets/bots/discord/commands/interaction.js
import { Router } from 'express';
import { waitUntil } from '@vercel/functions';
import {
  InteractionResponseType,
  verifyKeyMiddleware,
  InteractionType,
  MessageComponentTypes,
  InteractionResponseFlags,
} from 'discord-interactions';
import User from '../../../utils/schemas/mongoUserSchema.js';
import { CommandHandlers } from './commandHandlers.js';
import { DiscordAPI } from './discordApi.js';
import config from '../../../config.js';
import { CONFIG } from './config.js';

// process.removeAllListeners('warning');

const router = Router();
const commandHandlers = new CommandHandlers(DiscordAPI, CONFIG, config);

async function handleInteraction(interaction) {
  const discordUserData = interaction.member
    ? interaction.member.user
    : interaction.user;

  const user = await User.findOne({
    'apps.Discord': { $elemMatch: { id: discordUserData.id } },
  });

  if (!user)
    return await DiscordAPI.getInstance().sendFollowUpMessage(interaction, {
      content: `مرحباً <@${discordUserData.id}>، يبدو أنك لم تقم بربط أي حساب بعد ${CONFIG.EMOJIS.icon}!`,
      allowed_mentions: { parse: [] },
    });

  return commandHandlers.handleInteraction(interaction.type, {
    discordUserData,
    interaction,
    user,
  });
}

router.post(
  '/interactions',
  verifyKeyMiddleware(process.env.DISCORD_PUBLIC_KEY),
  async (req, res) => {
    if (
      req.body.type === InteractionType.MESSAGE_COMPONENT &&
      !res.headersSent &&
      ['add_balance_button', 'remove_balance_button'].includes(
        req.body.data.custom_id
      )
    ) {
      return res.send({
        type: InteractionResponseType.MODAL,
        data: {
          custom_id: req.body.data.custom_id.replace('_button', ''),
          title:
            req.body.data.custom_id === 'add_balance_button'
              ? 'إيداع رصيد'
              : 'سحب رصيد',
          components: [
            {
              type: MessageComponentTypes.ACTION_ROW,
              components: [
                {
                  type: MessageComponentTypes.INPUT_TEXT,
                  custom_id: 'discord_id',
                  label: 'أيدي الشخص',
                  style: 1, // SHORT
                  min_length: 17,
                  max_length: 20,
                  required: true,
                  placeholder: '123456789012345678',
                },
              ],
            },
            {
              type: MessageComponentTypes.ACTION_ROW,
              components: [
                {
                  type: MessageComponentTypes.INPUT_TEXT, // TEXT_INPUT
                  custom_id: 'amount',
                  label: 'المبلغ',
                  style: 1, // SHORT
                  min_length: 1,
                  max_length: 10,
                  required: true,
                  placeholder: '100',
                },
              ],
            },
            {
              type: MessageComponentTypes.ACTION_ROW,
              components: [
                {
                  type: MessageComponentTypes.INPUT_TEXT, // TEXT_INPUT
                  custom_id: 'password',
                  label: 'كلمة السر',
                  style: 1, // SHORT
                  min_length: 1,
                  max_length: 10,
                  required: true,
                  placeholder: '****',
                },
              ],
            },
          ],
        },
      });
    } else {
      try {
        res.send({
          type: InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
          ...(req.body.channel.id === CONFIG.DISCORD.VERIFICATION_CHANNEL && {
            data: {
              flags: InteractionResponseFlags.EPHEMERAL,
            },
          }),
        });
      } catch (error) {
        console.error(error);
        if (!res.headersSent) res.sendStatus(500);
      } finally {
        try {
          waitUntil(handleInteraction(req.body));
        } catch (error) {
          console.error(error);
        }
      }
    }
  }
);

export default router;

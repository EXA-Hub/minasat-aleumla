// api/src/routes/websockets/bots/discord/commands/interaction.js
import { Router } from 'express';
import {
  InteractionResponseType,
  verifyKeyMiddleware,
  InteractionType,
} from 'discord-interactions';
import { waitUntil } from '@vercel/functions';
import User from '../../../utils/schemas/mongoUserSchema.js';
import { CommandHandlers } from './commandHandlers.js';
import { DiscordAPI } from './discordApi.js';
import config from '../../../config.js';
import { CONFIG } from './config.js';

const { subscriptions } = config;

process.removeAllListeners('warning');

const router = Router();
const commandHandlers = new CommandHandlers();

async function handleInteraction(interaction) {
  const discordUserData = interaction.member
    ? interaction.member.user
    : interaction.user;

  const user = await User.findOne({
    'apps.Discord': { $elemMatch: { id: discordUserData.id } },
  });

  if (!user) {
    await DiscordAPI.getInstance().sendFollowUpMessage(interaction, {
      content: `مرحباً <@${discordUserData.id}>، يبدو أنك لم تقم بربط أي حساب بعد ${CONFIG.EMOJIS.icon}!`,
      allowed_mentions: { parse: [] },
    });
    return true;
  }

  try {
    switch (interaction.data.name || interaction.data.custom_id) {
      case CONFIG.COMMANDS.PING:
        await commandHandlers.handlePing({ discordUserData, interaction });
        break;
      case CONFIG.COMMANDS.WALLET:
        await commandHandlers.handleWallet({
          discordUserData,
          interaction,
          user,
          EMOJIS: CONFIG.EMOJIS,
          subscriptions,
        });
        break;
      case CONFIG.COMMANDS.SEND:
        await commandHandlers.handleSendCoins({
          discordUserData,
          interaction,
          user,
          EMOJIS: CONFIG.EMOJIS,
          subscriptions,
        });
        break;
      case CONFIG.COMMANDS.VERIFY:
        await commandHandlers.handleVerify({
          discordUserData,
          interaction,
        });
        break;
      default:
        await DiscordAPI.getInstance().sendFollowUpMessage(interaction, {
          content: 'أمر غير معروف :skull:',
        });
    }
  } catch (error) {
    console.error('خطأ في معالجة الأمر:', error);
    await DiscordAPI.getInstance().sendFollowUpMessage(interaction, {
      content: CONFIG.DEFAULT_ERROR_MESSAGE,
    });
  }

  return true;
}

router.post(
  '/interactions',
  verifyKeyMiddleware(process.env.DISCORD_PUBLIC_KEY),
  async (req, res) => {
    try {
      res.send({
        type: InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
        ...(req.body.type === InteractionType.MESSAGE_COMPONENT && {
          data: {
            flags: 64,
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
);

export default router;

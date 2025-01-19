// api/src/routes/websockets/bots/discord/commands/interaction.js
import { Router } from 'express';
import {
  InteractionType,
  InteractionResponseType,
  verifyKeyMiddleware,
} from 'discord-interactions';
import { waitUntil } from '@vercel/functions';
import User from '../../../../../utils/schemas/mongoUserSchema.js';
import { CommandHandlers } from '../handlers/commandHandlers.js';
import { DiscordAPI } from '../services/discordApi.js';
import config from '../../../../../config.js';
import { CONFIG } from '../config/config.js';

const { subscriptions } = config;

process.removeAllListeners('warning');

const router = Router();
const commandHandlers = new CommandHandlers();

async function handleInteraction(interaction) {
  const user = await User.findOne({
    'apps.Discord': { $elemMatch: { id: interaction.member.user.id } },
  });

  if (!user) {
    await DiscordAPI.getInstance().sendFollowUpMessage(interaction, {
      content: `مرحباً <@${interaction.member.user.id}>، يبدو أنك لم تقم بربط أي حساب بعد ${CONFIG.EMOJIS.icon}!`,
      allowed_mentions: { parse: [] },
    });
    return true;
  }

  try {
    switch (interaction.data.name) {
      case CONFIG.COMMANDS.PING:
        await commandHandlers.handlePing(interaction);
        break;
      case CONFIG.COMMANDS.WALLET:
        await commandHandlers.handleWallet(
          interaction,
          user,
          CONFIG.EMOJIS,
          subscriptions
        );
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
      const interaction = req.body;

      if (interaction.type !== InteractionType.APPLICATION_COMMAND)
        return res.sendStatus(400);

      process.nextTick(() => waitUntil(handleInteraction(interaction)));

      return res.send({
        type: InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
      });
    } catch (error) {
      console.error('خطأ في التفاعل:', error);
      if (!res.headersSent) res.sendStatus(500);
    }
  }
);

export default router;

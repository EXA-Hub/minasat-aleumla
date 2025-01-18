// api/src/routes/websockets/bots/discord/commands/interaction.js

// Suppress Ed25519 experimental warning
process.removeAllListeners('warning');

import { Router } from 'express';
import { waitUntil } from '@vercel/functions';
import {
  InteractionType,
  InteractionResponseType,
  verifyKeyMiddleware,
} from 'discord-interactions';
import { appCmds } from '../functions/appCmds.js';

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

      waitUntil(appCmds(interaction));

      // First respond quickly to avoid timeout
      return res.send({
        type: InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
      });
    } catch (error) {
      console.error(error);
      if (!res.headersSent) res.sendStatus(500);
    }
  }
);

export default router;

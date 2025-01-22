// api/src/routes/websockets/bots/telegram/index.js

import { Router } from 'express';
import { commands, generateHelpMessage } from './cmds.js';
import { sendMessage } from './funcs.js';

const router = Router();

router.post(
  '/endpoint',
  (req, res, next) => {
    if (
      req.headers['x-telegram-bot-api-secret-token'] !==
      process.env.TELEGRAM_SECRET_TOKEN
    )
      return res.sendStatus(401);
    next();
  },
  async (req, res, next) => {
    try {
      console.log(JSON.stringify(req.body, null, 2));
      const { message, my_chat_member } = req.body;
      if (my_chat_member) return res.sendStatus(200); // Stop further processing
      if (!message?.chat?.id) return res.status(200).send('OK'); // Stop further processing
      req.chat_id = message.chat.id;
      req.messageText = message.text || '';
      next();
    } catch (error) {
      console.error(error);
      next(error);
    }
  },
  async (req, res) => {
    try {
      const { chat_id, messageText } = req;
      const command = req.body.message?.entities?.find(
        (entity) => entity.type === 'bot_command'
      );
      if (!command) return res.status(200).send('OK');
      const commandRes = await commands
        .find((cmd) =>
          messageText
            .slice(command.offset, command.offset + command.length)
            .toLowerCase()
            .startsWith(cmd.command)
        )
        ?.handler({ chat_id, messageText, req, res });
      if (!res.headersSent)
        res.status(200).json(
          commandRes
            ? typeof commandRes === 'string'
              ? {
                  method: 'sendMessage',
                  chat_id,
                  text: commandRes,
                }
              : commandRes
            : {
                method: 'sendMessage',
                chat_id,
                text: generateHelpMessage(),
              }
        );
    } catch (error) {
      console.error('Error processing webhook:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

router.use((error, req, res, next) => {
  console.error('Telegram Bot Error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

export default router;

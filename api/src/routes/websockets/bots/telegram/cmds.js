import User from '../../../../utils/schemas/mongoUserSchema.js';
import { sendMessage } from './funcs.js';
import { CONFIG } from './config.js';

const CoinIcon = `<tg-emoji emoji-id="${CONFIG.EMOJIS_PACKS[0].stickers[0].custom_emoji_id}">${CONFIG.EMOJIS_PACKS[0].stickers[0].emoji}</tg-emoji>`;

// Command handlers
export const commands = [
  {
    command: '/start',
    description: 'بدء المحادثة',
    handler: async ({ chat_id }) => {
      return await sendMessage({
        chat_id,
        text: '!مرحباً بك! أنا الروبوت الخاص بك. استخدم أي أمر غير معروف لرؤية الأوامر المتاحة',
      });
    },
  },
  {
    command: '/ping',
    description: 'تحقق من سرعة الاتصال',
    handler: async ({ chat_id, req }) => {
      // Extract the message timestamp from Telegram's request
      const messageTimestamp = req.body.message.date * 1000; // Convert seconds to milliseconds
      const ping = Date.now() - messageTimestamp; // Calculate latency
      // Send the response message
      return await sendMessage({
        chat_id,
        text: `⚡ سرعة الإتصال والرد الصحيح: ${ping}ms ⏳📡`,
      });
    },
  },
  {
    command: '/wallet',
    description: 'عرض المحفظة',
    handler: async ({ chat_id, messageText, req }) => {
      const mention = req.body.message.entities.find(
        (entity) => entity.type === 'mention'
      );
      if (!mention)
        return await sendMessage({
          chat_id,
          text: 'يجب أن يكون هناك منشن 📝👤✨',
        });
      const target = await User.findOne({
        'apps.Telegram': {
          $elemMatch: {
            username: messageText.slice(
              mention.offset + 1,
              mention.offset + mention.length
            ),
          },
        },
      });
      if (target && target.privacy.showWallet)
        return await sendMessage({
          chat_id,
          text: `محفظة ${target.username}:\n${target.balance}${CoinIcon}`,
        });
      return await sendMessage({
        chat_id,
        text: `${CoinIcon} المحفظة فارغة 💸 أو لا يمكن عرضها ❌`,
      });
    },
  },
  {
    command: '/sendcoins',
    description: 'تحويل أموال لمحفظة شخص ما',
    handler: async ({ chat_id, messageText, req }) => {
      const mention = req.body.message.entities.find(
        (entity) => entity.type === 'mention'
      );
      if (!mention)
        return await sendMessage({
          chat_id,
          text: 'يجب أن يكون هناك منشن 📝👤✨',
        });
      const target = await User.findOne({
        'apps.Telegram': {
          $elemMatch: {
            username: messageText.slice(
              mention.offset + 1,
              mention.offset + mention.length
            ),
          },
        },
      });
      if (target) {
        const amount = messageText.split(' ')[1];
        if (amount)
          return await sendMessage({
            chat_id,
            text: `تم تحويل ${amount}${CoinIcon} لمحفظة ${target.username}\n(الأمر تجريبي فقط ولا يحصل تحويل.)`,
          });
      } else
        return await sendMessage({
          chat_id,
          text: 'المستخدم غير موجود 🚫 أو الحساب غير متصل بالمحفظة 🔒',
        });
    },
  },
  {
    command: '/test',
    description: 'تستخدم الروبوت',
    hidden: true,
    handler: async ({ chat_id }) => {
      await sendMessage({
        chat_id,
        text: 'Hello, world!',
      });

      const inlineKeyboard = {
        inline_keyboard: [
          [{ text: 'Button 1', callback_data: 'action1' }],
          [{ text: 'Button 2', callback_data: 'action2' }],
        ],
      };
      await sendMessage({
        chat_id,
        text: 'Choose an option:',
        reply_markup: inlineKeyboard,
      });

      const replyKeyboard = {
        keyboard: [
          ['Option 1', 'Option 2'],
          ['Option 3', 'Option 4'],
        ],
        resize_keyboard: true,
        one_time_keyboard: true,
      };
      await sendMessage({
        chat_id,
        text: 'Please select an option:',
        reply_markup: replyKeyboard,
      });

      await sendMessage({
        chat_id,
        text: 'Please type your response:',
        reply_markup: { force_reply: true },
      });

      await sendMessage({
        chat_id,
        text: `Your balance: 100 ${CoinIcon}`,
        parse_mode: 'HTML',
      });

      await sendMessage({
        chat_id,
        text: 'Check out this link: https://example.com',
        disable_web_page_preview: true,
      });

      await sendMessage({
        chat_id,
        text: 'This is a silent message.',
        disable_notification: true,
      });

      await sendMessage({
        chat_id,
        text: 'This message cannot be forwarded or saved.',
        protect_content: true,
      });

      await sendMessage({
        chat_id,
        text: 'This is a reply.',
        reply_to_message_id: 1, // ID of the message to reply to
      });

      const entities = [
        {
          type: 'bold',
          offset: 0,
          length: 5,
        },
        {
          type: 'italic',
          offset: 6,
          length: 6,
        },
      ];
      await sendMessage({
        chat_id,
        text: 'Hello, world!',
        entities,
      });

      return 1;
    },
  },
];

export const generateHelpMessage = () => {
  return `الأوامر المتاحة:\n${commands
    .filter((cmd) => !cmd.hidden)
    .map((cmd) => `${cmd.command} - ${cmd.description}`)
    .join('\n')}\n/help - عرض رسالة المساعدة`;
};

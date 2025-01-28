import config from '../../../config.js';
import User from '../../../utils/schemas/mongoUserSchema.js';
import { CONFIG } from './config.js';

const CoinIcon = `<tg-emoji emoji-id="${CONFIG.EMOJIS_PACKS[0].stickers[0].custom_emoji_id}">${CONFIG.EMOJIS_PACKS[0].stickers[0].emoji}</tg-emoji>`;

// Command handlers
export const commands = [
  {
    command: '/start',
    description: 'بدء المحادثة',
    handler: () => {
      return '!مرحباً بك! أنا الروبوت الخاص بك. استخدم أي أمر غير معروف لرؤية الأوامر المتاحة';
    },
  },
  {
    command: '/ping',
    description: 'تحقق من سرعة الاتصال',
    handler: ({ req }) => {
      return `⚡ سرعة الإتصال والرد الصحيح: ${
        Date.now() - req.body.message.date * 1000
      }ms ⏳📡`;
    },
  },
  {
    command: '/wallet',
    description: 'عرض المحفظة',
    handler: async ({ chat_id, messageText, req }) => {
      const mention = req.body.message.entities.find(
        (entity) => entity.type === 'mention'
      );
      if (!mention) return 'يجب أن يكون هناك منشن 📝👤✨';
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
      if (target && target.privacy?.showWallet)
        return {
          method: 'sendMessage',
          chat_id,
          text: `محفظة ${target.username}:\n${
            target.balance
          }${CoinIcon}\nالرسوم: ${
            config.subscriptions[target.tier].features.wallet.fee
          }%`,
          parse_mode: 'HTML',
        };
      return {
        method: 'sendMessage',
        chat_id,
        text: `${CoinIcon} المحفظة فارغة 💸 أو لا يمكن عرضها ❌`,
        parse_mode: 'HTML',
      };
    },
  },
  {
    command: '/sendcoins',
    description: 'تحويل أموال لمحفظة شخص ما',
    handler: async ({ chat_id, messageText, req }) => {
      return 'هذا الأمر معطل حاليا 🤖';
      const amount = parseInt(messageText.split(' ')[1]);
      if (!amount)
        return '⛔ يجب كتابة عدد العملات المراد تحويلها 🪙\nمثلاً: /sendcoins 1000 @username';
      const mention = req.body.message.entities.find(
        (entity) => entity.type === 'mention'
      );
      if (!mention) return 'يجب أن يكون هناك منشن 📝👤✨';
      const targetUsername = messageText.slice(
        mention.offset + 1,
        mention.offset + mention.length
      );
      if (req.body.from.username === targetUsername)
        return 'لا يمكن تحويل أموال لنفسك 🤦‍♂️';
      const [sender, target] = await Promise.all([
        User.findOne({ 'apps.Telegram.username': req.body.from.username }),
        User.findOne({ 'apps.Telegram.username': targetUsername }),
      ]);
      if (!sender) return 'ليس لديك محفظة 🔒';
      if (!target) return 'المستخدم غير موجود 🚫 أو الحساب غير متصل بمحفظة 🔒';
      if (sender._id.equals(target._id)) return 'لا يمكن تحويل أموال لنفسك 🤦‍♂️';
      const feeAmount = Math.ceil((amount * fee) / 100);
      let taking = payFee ? amount + feeAmount : amount;
      let giving = payFee ? amount : amount - feeAmount;
      if (sender.balance < taking) return `⚠️ لا يوجد رصيد كافي في حسابك.`;
      sender.balance -= taking;
      sender.transactionStats.totalSpent += taking;
      sender.transactionStats.totalTransactions += 1;
      if (sender.referralId) sender.tax += Math.floor(feeAmount / 2);
      target.balance += giving;
      target.transactionStats.totalReceived += giving;
      target.transactionStats.totalTransactions += 1;
      await Promise.all([sender.save(), target.save()]);
      return {
        method: 'sendMessage',
        chat_id,
        text: `تم تحويل ${amount}${CoinIcon} لمحفظة ${target.username}\n(الأمر تجريبي فقط ولا يحصل تحويل.)`,
        parse_mode: 'HTML',
      };
    },
  },
];

export const generateHelpMessage = () => {
  return `الأوامر المتاحة:\n${commands
    .filter((cmd) => !cmd.hidden)
    .map((cmd) => `${cmd.command} - ${cmd.description}`)
    .join('\n')}\n/help - عرض رسالة المساعدة`;
};

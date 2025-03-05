import { Client, GatewayIntentBits, AttachmentBuilder } from 'discord.js';
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';
import inquirer from 'inquirer';
import 'dotenv/config';

const TOKEN = process.env.DISCORD_BOT_TOKEN;

if (!TOKEN) {
  console.log('\x1b[31m❌ Missing DISCORD_BOT_TOKEN in .env file!\x1b[0m');
  process.exit(1);
}

// Ask for Channel ID
async function getChannelId(): Promise<string> {
  const { channelId } = await inquirer.prompt([
    {
      type: 'input',
      name: 'channelId',
      message: '\x1b[36m📢 Enter the Discord Channel ID:\x1b[0m',
      validate: (input) =>
        input.trim() ? true : 'Channel ID cannot be empty!',
    },
  ]);
  return channelId;
}

// Send Embed Message
async function sendEmbedMessage(channelId: string) {
  console.log('\x1b[33m🚀 Logging into Discord...\x1b[0m');

  const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
  });

  client.once('ready', async () => {
    console.log(`\x1b[32m✅ Logged in as ${client.user?.tag}\x1b[0m`);

    try {
      const channel = await client.channels.fetch(channelId);
      if (!channel || !channel.isTextBased())
        throw new Error('Invalid channel!');

      console.log('\x1b[34m📤 Sending embed message...\x1b[0m');

      // Load message JSON
      const jsonPath = resolve(__dirname, '../config/message.json');
      const jsonData = JSON.parse(readFileSync(jsonPath, 'utf-8'));

      // Load image
      const imagePath = resolve(
        __dirname,
        '../../app/public/minasat-aleumla-logo.png'
      );
      if (!existsSync(imagePath)) throw new Error('Image file not found!');

      const attachment = new AttachmentBuilder(imagePath);
      delete jsonData.files; // Remove file reference from JSON

      // Send message
      if (channel.isSendable())
        await channel.send({ ...jsonData, files: [attachment] });
      else throw new Error('Channel is not sendable!');
      console.log('\x1b[32m🎉 Embed sent successfully!\x1b[0m');
    } catch (error) {
      console.log(`\x1b[31m❌ Error: ${error}\x1b[0m`);
    } finally {
      client.destroy();
      console.log('\x1b[35m👋 Exiting...\x1b[0m');
      process.exit();
    }
  });

  client.login(TOKEN);
}

// Run the script
(async () => {
  const channelId = await getChannelId();
  await sendEmbedMessage(channelId);
})();

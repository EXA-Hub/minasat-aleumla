import { Client, GatewayIntentBits, AttachmentBuilder } from 'discord.js';
import { existsSync, readFileSync, readdirSync } from 'fs';
import { resolve, join } from 'path';
import inquirer from 'inquirer';
import 'dotenv/config';
import { json } from 'stream/consumers';

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

// Select JSON Message File
async function selectMessageFile(): Promise<string> {
  const messagesDir = resolve(__dirname, '../config/messages');
  const messageFiles = readdirSync(messagesDir).filter((file) =>
    file.endsWith('.json')
  );

  if (messageFiles.length === 0) {
    console.log('\x1b[31m❌ No JSON files found in messages directory!\x1b[0m');
    process.exit(1);
  }

  const { selectedFile } = await inquirer.prompt([
    {
      type: 'list',
      name: 'selectedFile',
      message: '\x1b[36m📄 Select a message JSON file:\x1b[0m',
      choices: messageFiles,
    },
  ]);

  return join(messagesDir, selectedFile);
}

// Send Embed Message
async function sendEmbedMessage(channelId: string, jsonPath: string) {
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

      // Load selected message JSON
      if (!existsSync(jsonPath)) throw new Error('JSON file not found!');
      const jsonData = JSON.parse(readFileSync(jsonPath, 'utf-8'));

      let attachments: AttachmentBuilder[] = [];

      if (jsonData.files)
        jsonData.files.forEach((file: string) => {
          const filePath = resolve(__dirname, '../config/messages', file);
          if (existsSync(filePath)) {
            const attachment = new AttachmentBuilder(filePath);
            attachments.push(attachment);
          }
        });

      jsonData.files = attachments;

      // Send message
      if (channel.isSendable()) await channel.send({ ...jsonData });
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
  const jsonPath = await selectMessageFile();
  await sendEmbedMessage(channelId, jsonPath);
})();

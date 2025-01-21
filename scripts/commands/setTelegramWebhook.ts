import 'dotenv/config';
import inquirer from 'inquirer';

const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;

// Ask the user for the webhook URL
inquirer
  .prompt([
    {
      type: 'input',
      name: 'webhookUrl',
      message: 'Enter the Telegram webhook URL:',
    },
  ])
  .then((answers) => {
    const webhookUrl = answers.webhookUrl;
    // check if the webhookUrl is valid

    if (!urlRegex.test(webhookUrl)) throw new Error('Invalid URL');

    if (!process.env.TELEGRAM_BOT_TOKEN)
      throw new Error('TELEGRAM_BOT_TOKEN is not set');

    // Set the webhook URL
    fetch(
      `https://api.telegram.org/bot${
        process.env.TELEGRAM_BOT_TOKEN
      }/setWebhook?url=${webhookUrl + '/webhooks/bots/telegram/endpoint'}`
    ).then(
      (response) => {
        console.log(response);
      },
      (error) => {
        console.error(JSON.stringify(error));
      }
    );
  });

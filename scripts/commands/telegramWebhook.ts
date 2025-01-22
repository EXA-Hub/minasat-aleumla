import 'dotenv/config';
import inquirer from 'inquirer';

interface WebhookResponse {
  ok: boolean;
  description?: string;
  result?: boolean | WebhookInfo;
}

interface WebhookInfo {
  url: string;
  has_custom_certificate: boolean;
  pending_update_count: number;
  ip_address?: string;
  last_error_date?: number;
  last_error_message?: string;
  max_connections?: number;
  allowed_updates?: string[];
}

interface SetWebhookOptions {
  url: string;
  certificate?: Buffer;
  ip_address?: string;
  max_connections?: number;
  allowed_updates?: string[];
  drop_pending_updates?: boolean;
  secret_token?: string;
}

const UPDATE_TYPES = [
  'message',
  'edited_message',
  'channel_post',
  'edited_channel_post',
  'business_connection',
  'business_message',
  'edited_business_message',
  'deleted_business_messages',
  'message_reaction',
  'message_reaction_count',
  'inline_query',
  'chosen_inline_result',
  'callback_query',
  'shipping_query',
  'pre_checkout_query',
  'purchased_paid_media',
  'poll',
  'poll_answer',
  'my_chat_member',
  'chat_member',
  'chat_join_request',
  'chat_boost',
  'removed_chat_boost',
] as const;

class TelegramWebhookManager {
  private readonly baseUrl: string;

  constructor(botToken: string) {
    if (!botToken) throw new Error('Bot token is required');
    this.baseUrl = `https://api.telegram.org/bot${botToken}`;
  }

  private async makeRequest<T>(
    method: string,
    params: Record<string, any> = {}
  ): Promise<T> {
    const url = new URL(`${this.baseUrl}/${method}`);
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        if (Array.isArray(value)) {
          searchParams.append(key, JSON.stringify(value));
        } else {
          searchParams.append(key, String(value));
        }
      }
    });

    const response = await fetch(
      `${url.toString()}?${searchParams.toString()}`
    );
    const data: WebhookResponse = await response.json();

    if (!data.ok) {
      throw new Error(data.description || `Failed to execute ${method}`);
    }

    return data.result as T;
  }

  async setWebhook(options: SetWebhookOptions): Promise<boolean> {
    return this.makeRequest<boolean>('setWebhook', options);
  }

  async setWebhookDefault(webhookUrl: string): Promise<boolean> {
    return this.setWebhook({
      url: webhookUrl + '/webhooks/bots/telegram/endpoint',
      allowed_updates: ['message'],
      max_connections: 1,
      secret_token: process.env.TELEGRAM_SECRET_TOKEN,
    });
  }

  async getWebhookInfo(): Promise<WebhookInfo> {
    return this.makeRequest<WebhookInfo>('getWebhookInfo');
  }

  async deleteWebhook(dropPending = false): Promise<boolean> {
    return this.makeRequest<boolean>('deleteWebhook', {
      drop_pending_updates: dropPending,
    });
  }
}

const validateUrl = (url: string): boolean => {
  const urlRegex =
    /^https:\/\/[\w.-]+(?:\.[\w.-]+)+[\w\-._~:/?#[\]@!$&'()*+,;=]+$/;
  return urlRegex.test(url);
};

const main = async (): Promise<void> => {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) throw new Error('TELEGRAM_BOT_TOKEN is not set');

    const webhook = new TelegramWebhookManager(botToken);

    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'Select webhook action:',
        choices: ['set default', 'set custom', 'get', 'delete'],
      },
    ]);

    switch (action) {
      case 'set default': {
        const { webhookUrl } = await inquirer.prompt([
          {
            type: 'input',
            name: 'webhookUrl',
            message: 'Enter the webhook URL:',
            validate: (input: string) =>
              validateUrl(input) || 'Please enter a valid HTTPS URL',
          },
        ]);

        const result = await webhook.setWebhookDefault(webhookUrl);
        console.log('Command webhook set:', result);
        break;
      }

      case 'set custom': {
        const { webhookUrl, selectedUpdates, maxConnections, dropPending } =
          await inquirer.prompt([
            {
              type: 'input',
              name: 'webhookUrl',
              message: 'Enter the webhook URL:',
              validate: (input: string) =>
                validateUrl(input) || 'Please enter a valid HTTPS URL',
            },
            {
              type: 'checkbox',
              name: 'selectedUpdates',
              message: 'Select update types:',
              choices: UPDATE_TYPES,
            },
            {
              type: 'number',
              name: 'maxConnections',
              message: 'Enter max connections (1-100):',
              default: 40,
              validate: (input) => {
                const number = Number(input);
                return number >= 1 && number <= 100;
              },
            },
            {
              type: 'confirm',
              name: 'dropPending',
              message: 'Drop pending updates?',
              default: false,
            },
          ]);

        const result = await webhook.setWebhook({
          url: webhookUrl + '/webhooks/bots/telegram/endpoint',
          allowed_updates: selectedUpdates,
          max_connections: maxConnections,
          drop_pending_updates: dropPending,
          secret_token: process.env.TELEGRAM_SECRET_TOKEN,
        });
        console.log('Webhook set:', result);
        break;
      }

      case 'get': {
        const info = await webhook.getWebhookInfo();
        console.log('Webhook info:', JSON.stringify(info, null, 2));
        break;
      }

      case 'delete': {
        const { dropPending } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'dropPending',
            message: 'Drop pending updates?',
            default: false,
          },
        ]);

        const result = await webhook.deleteWebhook(dropPending);
        console.log('Webhook deleted:', result);
        break;
      }
    }
  } catch (error) {
    console.error(
      'Error:',
      error instanceof Error ? error.message : 'Unknown error'
    );
    process.exit(1);
  }
};

main();

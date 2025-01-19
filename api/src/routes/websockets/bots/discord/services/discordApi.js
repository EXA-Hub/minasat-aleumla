import { CONFIG } from '../config/config.js';

export class DiscordAPI {
  static #instance;
  #baseUrl;
  #botToken;

  constructor() {
    this.#baseUrl = CONFIG.DISCORD_API_BASE_URL;
    this.#botToken = process.env.DISCORD_BOT_TOKEN;
  }

  static getInstance() {
    if (!this.#instance) this.#instance = new DiscordAPI();
    return this.#instance;
  }

  async sendFollowUpMessage(interaction, payload) {
    const url = `${this.#baseUrl}/${CONFIG.DISCORD_API_VERSION}/webhooks/${
      interaction.application_id
    }/${interaction.token}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bot ${this.#botToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(JSON.stringify(errorData));
      }

      return await response.json();
    } catch (error) {
      console.error(error);
    }
  }
}

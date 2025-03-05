// api/src/routes/websockets/bots/discord/services/discordApi.js
import { CONFIG } from './config.js';

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

  async createInvite(channelId) {
    const response = await fetch(
      `${this.#baseUrl}/${
        CONFIG.DISCORD_API_VERSION
      }/channels/${channelId}/invites`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bot ${this.#botToken}`,
        },
        body: JSON.stringify({
          max_age: 24 * 60 * 60, // 24 hours
          max_uses: 1, // One-time use
          temporary: false, // Not a temporary invite
          unique: true, // Generate a unique invite link
        }),
      }
    );

    if (!response.ok) throw new Error(await response.text());
    return response.json();
  }

  async getRoles(guildId) {
    const response = await fetch(
      `${this.#baseUrl}/${CONFIG.DISCORD_API_VERSION}/guilds/${guildId}/roles`,
      {
        headers: {
          Authorization: `Bot ${this.#botToken}`,
        },
      }
    );

    if (!response.ok) throw new Error(await response.text());
    return response.json();
  }

  async addUserToRole(guildId, roleId, userId) {
    const response = await fetch(
      `${this.#baseUrl}/${
        CONFIG.DISCORD_API_VERSION
      }/guilds/${guildId}/members/${userId}/roles/${roleId}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bot ${this.#botToken}`,
        },
      }
    );

    if (!response.ok) throw new Error(await response.text());
    return true;
  }

  async #createDmChannel(userId) {
    const response = await fetch(
      `${this.#baseUrl}/${CONFIG.DISCORD_API_VERSION}/users/@me/channels`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bot ${this.#botToken}`,
        },
        body: JSON.stringify({ recipient_id: userId }),
      }
    );

    if (!response.ok) throw new Error(await response.text());
    return response.json();
  }

  async sendDM(userId, content) {
    try {
      const channel = await this.#createDmChannel(userId);
      const response = await fetch(
        `${this.#baseUrl}/${CONFIG.DISCORD_API_VERSION}/channels/${
          channel.id
        }/messages`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bot ${this.#botToken}`,
          },
          body: JSON.stringify(content),
        }
      );

      if (!response.ok) throw new Error(await response.text());
      return response.json();
    } catch (error) {
      console.error('Failed to send DM:', error);
      throw error;
    }
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
        console.error(JSON.stringify(await response.json()));
        throw new Error();
      }

      return await response.json();
    } catch {
      await this.sendDM(interaction.member?.user.id || interaction.user.id, {
        ...payload,
        content: (
          payload.content +
          '\n||لم أستطع أن أستجيب لذلك، سأقوم بالإرسال في الخاص.||'
        )
          .valueOf()
          .replace('undefined', ''),
      });
    }
  }
}

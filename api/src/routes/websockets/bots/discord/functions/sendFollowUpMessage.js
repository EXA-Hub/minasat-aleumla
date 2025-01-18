// api/src/routes/websockets/bots/discord/functions/sendFollowUpMessage.js
export async function sendFollowUpMessage(interaction, payload) {
  const url = `https://discord.com/api/v10/webhooks/${interaction.application_id}/${interaction.token}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Discord API error: ${JSON.stringify(errorData)}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending follow-up message:', error.message);
    throw error;
  }
}

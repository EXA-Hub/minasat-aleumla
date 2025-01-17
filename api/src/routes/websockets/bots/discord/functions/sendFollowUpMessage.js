// api/src/routes/websockets/bots/discord/functions/sendFollowUpMessage.js
async function sendFollowUpMessage(interaction, body) {
  const url = `https://discord.com/api/v10/webhooks/${process.env.DISCORD_CLIENT_ID}/${interaction.token}`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
      },
      body,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Discord API error: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error sending follow-up message:', error.message);
    throw error;
  }
}

export default sendFollowUpMessage;

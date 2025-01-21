// api/src/routes/websockets/bots/telegram/funcs.js

export async function sendMessage({
  chat_id,
  text,
  parse_mode = 'HTML', // Default to HTML parsing
  reply_markup = null, // Default to no keyboard
  disable_web_page_preview = false, // Default to showing web page previews
  disable_notification = false, // Default to sending notifications
  protect_content = false, // Default to not protecting content
  reply_to_message_id = null, // Default to not replying to a specific message
  allow_sending_without_reply = false, // Default to requiring a reply
  entities = null, // Default to no custom entities
}) {
  try {
    // Prepare the request body
    const body = {
      chat_id,
      text,
      parse_mode,
      disable_web_page_preview,
      disable_notification,
      protect_content,
      reply_to_message_id,
      allow_sending_without_reply,
      entities,
    };

    // Add reply_markup only if it is a valid object
    if (reply_markup && typeof reply_markup === 'object')
      body.reply_markup = reply_markup;

    const response = await fetch(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Telegram API Error: ${JSON.stringify(error, null, 2)}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error sending message:', JSON.stringify(error, null, 2));
    throw error;
  }
}

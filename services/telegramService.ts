import { db } from "./mockDatabase";

export const telegramService = {
  sendAlert: async (message: string) => {
    const settings = await db.getSettings();
    
    if (!settings.telegramBotToken || !settings.telegramChatId) {
      console.warn("Telegram token or Chat ID not configured in settings.");
      return;
    }

    const url = `https://api.telegram.org/bot${settings.telegramBotToken}/sendMessage`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: settings.telegramChatId,
          text: `🚨 *SSK ZVEZDA ALERT*\n\n${message}`,
          parse_mode: 'Markdown'
        })
      });

      if (!response.ok) {
        console.error("Failed to send Telegram message", await response.text());
      } else {
        console.log("Telegram alert sent successfully.");
      }
    } catch (error) {
      console.error("Network error sending Telegram alert:", error);
    }
  }
};
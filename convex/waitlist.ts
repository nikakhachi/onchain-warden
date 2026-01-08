import { action } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { handleError } from "./errors/handleError";

export const joinWaitlist = action({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      const botToken = process.env.TELEGRAM_ASSISTANT_BOT_TOKEN;

      if (!botToken) throw new ConvexError("TELEGRAM_WAITLIST_BOT_TOKEN is not configured");

      const message = `🎉 New Waitlist Signup!\n\nEmail: ${args.email}`;

      const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: 2007149488,
          text: message,
          disable_web_page_preview: true,
        }),
      });

      const data = await response.json();
      if (data.ok !== true) {
        throw new Error(`Failed to send Telegram message: ${JSON.stringify(data)}`);
      }
    } catch (error) {
      await handleError({ where: "joinWaitlist", error });
    }
  },
});

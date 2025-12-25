import { NextRequest, NextResponse } from "next/server";

const sendMessage = async (chatId: number, text: string) => {
  const url = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;

  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text: text }),
  });
};

export async function POST(request: NextRequest) {
  try {
    const update = await request.json();

    if (update?.message?.text === "/chatid") {
      const chatId = update?.message?.chat?.id;
      const chatType = update?.message?.chat.type;

      if (chatType === "group" || chatType === "supergroup") {
        await sendMessage(chatId, `This group's ID is: ${chatId}`);
      } else {
        await sendMessage(
          chatId,
          `This chat's ID is: ${chatId}\nChat type: ${chatType}`
        );
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error processing update:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

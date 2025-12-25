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

    const text = update?.message?.text;

    if (text === "/chatid" || text === "/chatid@onchain_warden_bot") {
      const chatId = update?.message?.chat?.id;

      await sendMessage(chatId, chatId);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error processing update:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

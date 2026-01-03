import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // The actual authentication with Convex will be handled in the AuthContext
  // when it detects the session. This route just confirms the session is valid.
  return NextResponse.json({ success: true, email: session.user.email });
}

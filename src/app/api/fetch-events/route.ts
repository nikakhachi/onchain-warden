import { NextRequest, NextResponse } from "next/server";
import { isAddress } from "viem";

const ETHERSCAN_API_BASE = "https://api.etherscan.io/v2/api";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const address = searchParams.get("contract_address");
  const chain_id = searchParams.get("chain_id");

  if (!isAddress(address || "") && !chain_id) {
    return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
  }

  const response = await fetch(
    `${ETHERSCAN_API_BASE}?chainid=${chain_id}&module=contract&action=getabi&address=${address}&apikey=${process.env.ETHERSCAN_API_KEY}`
  );

  const data = await response.json();

  // Check if Etherscan returned an error
  if (data.status === "0") {
    return NextResponse.json(
      { error: "Etherscan API error", data },
      { status: 400 }
    );
  } else if (data.status === "1") {
    const abi = JSON.parse(data.result);
    const events = abi.filter((item: any) => item.type === "event");
    return NextResponse.json(events);
  }
}

import { NextRequest, NextResponse } from "next/server";
import { isAddress } from "viem";

interface EtherscanABIResponse {
  status: string;
  message: string;
  result: string;
}

interface EtherscanSourceResponse {
  status: string;
  message: string;
  result: Array<{
    Proxy: string;
    Implementation: string;
    ProxyType?: string;
  }>;
}

interface EventABI {
  type: string;
  name: string;
  inputs: any[];
  anonymous?: boolean;
  source?: "proxy" | "implementation";
  sourceAddress?: string;
}

async function fetchFromEtherscan(
  params: Record<string, string>
): Promise<any> {
  const url = new URL("https://api.etherscan.io/v2/api");
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });

  const response = await fetch(url.toString(), {
    next: {
      revalidate: 60 * 60 * 24, // 24 hours
    },
  });

  if (!response.ok) {
    throw new Error(`Etherscan API request failed: ${response.statusText}`);
  }

  return response.json();
}

async function getABI(address: string, chainId: string): Promise<any[] | null> {
  try {
    const data: EtherscanABIResponse = await fetchFromEtherscan({
      chainid: chainId,
      module: "contract",
      action: "getabi",
      address: address,
      apikey: process.env.ETHERSCAN_API_KEY!,
    });

    if (data.status === "1" && data.result) {
      return JSON.parse(data.result);
    }
  } catch (error) {
    console.error(`Failed to fetch ABI for ${address}:`, error);
  }

  return null;
}

async function detectProxy(
  address: string,
  chainId: string
): Promise<{ isProxy: boolean; implementation: string | null }> {
  try {
    const data: EtherscanSourceResponse = await fetchFromEtherscan({
      chainid: chainId,
      module: "contract",
      action: "getsourcecode",
      address: address,
      apikey: process.env.ETHERSCAN_API_KEY!,
    });

    if (
      data.status === "1" &&
      data.result &&
      data.result.length > 0 &&
      data.result[0].Proxy === "1"
    ) {
      return {
        isProxy: true,
        implementation: data.result[0].Implementation || null,
      };
    }
  } catch (error) {
    console.error("Proxy detection failed:", error);
  }

  return { isProxy: false, implementation: null };
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const address = searchParams.get("contract_address");
  const chainId = searchParams.get("chain_id");

  // Validate inputs
  if (!address || !chainId || !isAddress(address)) {
    return NextResponse.json(
      { error: "Invalid contract address or chain ID" },
      { status: 400 }
    );
  }

  try {
    const events: EventABI[] = [];

    // Detect if contract is a proxy
    const proxyInfo = await detectProxy(address, chainId);

    // Fetch ABI from proxy address
    const proxyABI = await getABI(address, chainId);

    if (proxyABI) {
      const proxyEvents = proxyABI.filter((item: any) => item.type === "event");
      events.push(
        ...proxyEvents.map((event: EventABI) => ({
          ...event,
          source: "proxy" as const,
          sourceAddress: address,
        }))
      );
    }

    // If proxy, fetch ABI from implementation
    if (proxyInfo.isProxy && proxyInfo.implementation) {
      const implABI = await getABI(proxyInfo.implementation, chainId);

      if (implABI) {
        const implEvents = implABI.filter((item: any) => item.type === "event");
        events.push(
          ...implEvents.map((event: EventABI) => ({
            ...event,
            source: "implementation" as const,
            sourceAddress: proxyInfo.implementation!,
          }))
        );
      }
    }

    // Remove duplicate events (same name and signature)
    const uniqueEvents = events.reduce((acc: EventABI[], event: EventABI) => {
      const signature = `${event.name}(${event.inputs?.map((i) => i.type).join(",")})`;
      const exists = acc.some((e) => {
        const existingSignature = `${e.name}(${e.inputs?.map((i) => i.type).join(",")})`;
        return existingSignature === signature;
      });

      if (!exists) acc.push(event);
      return acc;
    }, []);

    return NextResponse.json({
      events: uniqueEvents,
      isProxy: proxyInfo.isProxy,
      proxyAddress: address,
      implementationAddress: proxyInfo.implementation,
    });
  } catch (error) {
    console.error("Error fetching contract events:", error);
    return NextResponse.json(
      { error: "Failed to fetch contract events" },
      { status: 500 }
    );
  }
}

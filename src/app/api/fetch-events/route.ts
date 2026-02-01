import { NextRequest, NextResponse } from "next/server";
import { isAddress } from "viem";

interface EtherscanSourceResponse {
  status: string;
  message: string;
  result: Array<{
    SourceCode: string;
    ABI: string;
    ContractName: string;
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
  source?: "proxy" | "implementation" | "library";
  sourceAddress?: string;
}

async function fetchFromExplorer(params: Record<string, string>): Promise<any> {
  const chainId = params.chainid;

  const isAvalanche = chainId == "43114";
  const baseUrl = isAvalanche ? "https://api.snowtrace.io/api" : "https://api.etherscan.io/v2/api";

  const url = new URL(baseUrl);

  Object.entries(params).forEach(([key, value]) => {
    // Skip chainid for Snowtrace since it doesn't use it
    if (isAvalanche && key === "chainid") return;
    url.searchParams.append(key, value);
  });

  const response = await fetch(url.toString(), {
    next: {
      revalidate: 60 * 60 * 24, // 24 hours
    },
  });

  if (!response.ok) {
    throw new Error(`Explorer API request failed: ${response.statusText}`);
  }

  return response.json();
}

function extractLibraryEventsFromSource(sourceCode: string): EventABI[] {
  try {
    // Handle both single file and multi-file formats
    let sources: string = "";

    if (sourceCode.startsWith("{{")) {
      // Multi-file format: {{...}}
      const jsonStr = sourceCode.slice(1, -1);
      const parsed = JSON.parse(jsonStr);
      sources = JSON.stringify(parsed);
    } else if (sourceCode.startsWith("{")) {
      // JSON format
      sources = sourceCode;
    } else {
      // Single file
      sources = sourceCode;
    }

    // First, extract struct definitions from the source code
    const structMap = extractStructDefinitions(sources);

    // Regex to find event definitions in library code
    const eventRegex = /event\s+(\w+)\s*\(([\s\S]*?)\)\s*;/g;
    const events: EventABI[] = [];

    let match;
    while ((match = eventRegex.exec(sources)) !== null) {
      const eventName = match[1];
      // Clean ALL types of newlines and escaped sequences
      const paramsStr = match[2]
        .replace(/[\n\r\t]+/g, " ") // Remove actual newlines
        .replace(/\\n/g, "") // Remove literal "\n" strings
        .replace(/\\r/g, "") // Remove literal "\r" strings
        .replace(/\\t/g, "") // Remove literal "\t" strings
        .replace(/\s+/g, " ") // Collapse multiple spaces
        .trim();

      // Split by comma, but be careful with nested types (like tuples)
      const inputs = [];
      let depth = 0;
      let currentParam = "";

      for (let i = 0; i < paramsStr.length; i++) {
        const char = paramsStr[i];

        if (char === "(" || char === "[") {
          depth++;
          currentParam += char;
        } else if (char === ")" || char === "]") {
          depth--;
          currentParam += char;
        } else if (char === "," && depth === 0) {
          if (currentParam.trim()) {
            const parsed = parseEventParameter(currentParam.trim(), structMap);
            if (parsed) inputs.push(parsed);
          }
          currentParam = "";
        } else {
          currentParam += char;
        }
      }

      // Don't forget the last parameter
      if (currentParam.trim()) {
        const parsed = parseEventParameter(currentParam.trim(), structMap);
        if (parsed) inputs.push(parsed);
      }

      events.push({
        type: "event",
        name: eventName,
        inputs,
        anonymous: false,
      });
    }

    return events;
  } catch (error) {
    console.error("Failed to extract library events:", error);
    return [];
  }
}

function extractStructDefinitions(source: string): Map<string, any[]> {
  const structMap = new Map<string, any[]>();

  // Regex to find struct definitions
  const structRegex = /struct\s+(\w+)\s*\{([\s\S]*?)\}/g;

  let match;
  while ((match = structRegex.exec(source)) !== null) {
    const structName = match[1];
    const structBody = match[2]
      .replace(/[\n\r\t]+/g, " ")
      .replace(/\\n/g, "")
      .replace(/\\r/g, "")
      .replace(/\\t/g, "")
      .replace(/\s+/g, " ")
      .trim();

    // Parse struct fields
    const fields = structBody
      .split(";")
      .map((f) => f.trim())
      .filter((f) => f.length > 0)
      .map((field) => {
        const parts = field.split(/\s+/).filter((p) => p.length > 0);
        if (parts.length >= 2) {
          const type = parts[0];
          const name = parts[parts.length - 1];
          return {
            internalType: type,
            name: name,
            type: type,
          };
        }
        return null;
      })
      .filter(Boolean);

    if (fields.length > 0) {
      structMap.set(structName, fields);
    }
  }

  return structMap;
}

function parseEventParameter(param: string, structMap: Map<string, any[]> = new Map()): any {
  // Clean up the parameter string
  param = param
    .replace(/[\n\r\t]+/g, " ") // Remove actual newlines
    .replace(/\\n/g, "") // Remove literal "\n" strings
    .replace(/\\r/g, "") // Remove literal "\r" strings
    .replace(/\\t/g, "") // Remove literal "\t" strings
    .replace(/\s+/g, " ") // Collapse multiple spaces
    .trim();

  const parts = param.split(/\s+/);
  const isIndexed = parts.includes("indexed");

  // Remove keywords and empty strings
  const cleanParts = parts.filter((p) => !["indexed", "memory", "calldata", "storage"].includes(p) && p.length > 0);

  if (cleanParts.length < 2) {
    return null; // Invalid parameter
  }

  // The type is everything except the last part (which is the name)
  const name = cleanParts[cleanParts.length - 1];
  const type = cleanParts.slice(0, -1).join(" ");

  // Check if this type is a struct we've seen
  const structDef = structMap.get(type);

  if (structDef) {
    // This is a struct - convert to tuple format
    return {
      indexed: isIndexed,
      internalType: `struct ${type}`,
      name: name,
      type: "tuple",
      components: structDef,
    };
  }

  return {
    indexed: isIndexed,
    internalType: type,
    name: name,
    type: type,
  };
}

async function getContractData(
  address: string,
  chainId: string,
): Promise<{
  abi: any[] | null;
  sourceCode: string | null;
  isProxy: boolean;
  implementation: string | null;
}> {
  try {
    const data: EtherscanSourceResponse = await fetchFromExplorer({
      chainid: chainId,
      module: "contract",
      action: "getsourcecode",
      address: address,
      apikey: process.env.ETHERSCAN_API_KEY!,
    });

    if (data.status === "1" && data.result && data.result.length > 0) {
      const result = data.result[0];

      const abi = result.ABI && result.ABI !== "Contract source code not verified" ? JSON.parse(result.ABI) : null;

      const isProxy = result.Proxy === "1";
      const implementation = isProxy ? result.Implementation || null : null;
      const sourceCode = result.SourceCode || null;

      return { abi, sourceCode, isProxy, implementation };
    }
  } catch (error) {
    console.error(`Failed to fetch contract data for ${address}:`, error);
  }

  return { abi: null, sourceCode: null, isProxy: false, implementation: null };
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const address = searchParams.get("contract_address");
  const chainId = searchParams.get("chain_id");

  // Validate inputs
  if (!address || !chainId || !isAddress(address)) {
    return NextResponse.json({ error: "Invalid contract address or chain ID" }, { status: 400 });
  }

  try {
    const events: EventABI[] = [];

    // Fetch proxy contract data (single call)
    const proxyData = await getContractData(address, chainId);

    // Add events from proxy ABI
    if (proxyData.abi) {
      const proxyEvents = proxyData.abi.filter((item: any) => item.type === "event");
      events.push(
        ...proxyEvents.map((event: EventABI) => ({
          ...event,
          source: "proxy" as const,
          sourceAddress: address,
        })),
      );
    }

    // Extract library events from source code (for non-proxy contracts)
    if (!proxyData.isProxy && proxyData.sourceCode) {
      const libraryEvents = extractLibraryEventsFromSource(proxyData.sourceCode);
      events.push(
        ...libraryEvents.map((event: EventABI) => ({
          ...event,
          source: "library" as const,
          sourceAddress: address,
        })),
      );
    }

    // If proxy, fetch implementation data (single call)
    if (proxyData.isProxy && proxyData.implementation) {
      const implData = await getContractData(proxyData.implementation, chainId);

      // Add events from implementation ABI
      if (implData.abi) {
        const implEvents = implData.abi.filter((item: any) => item.type === "event");
        events.push(
          ...implEvents.map((event: EventABI) => ({
            ...event,
            source: "implementation" as const,
            sourceAddress: proxyData.implementation!,
          })),
        );
      }

      // Extract library events from implementation source code
      if (implData.sourceCode) {
        const libraryEvents = extractLibraryEventsFromSource(implData.sourceCode);
        events.push(
          ...libraryEvents.map((event: EventABI) => ({
            ...event,
            source: "library" as const,
            sourceAddress: proxyData.implementation!,
          })),
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
      isProxy: proxyData.isProxy,
      proxyAddress: address,
      implementationAddress: proxyData.implementation,
    });
  } catch (error) {
    console.error("Error fetching contract events:", error);
    return NextResponse.json({ error: "Failed to fetch contract events" }, { status: 500 });
  }
}

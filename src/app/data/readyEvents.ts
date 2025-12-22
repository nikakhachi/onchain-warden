export const READY_EVENTS = [
  {
    protocol: "Reservoir",
    description: "rUSD mint",
    chain_id: 1,
    contract_address: "0x4809010926aec940b550d34a46a52739f996d75d",
    event_abi:
      "event Mint(address indexed from, address indexed to, uint256 amount, uint256 timestamp)",
  },
  {
    protocol: "Reservoir",
    description: "wsrUSD mint",
    chain_id: 1,
    contract_address: "0xd3fd63209fa2d55b07a0f6db36c2f43900be3094",
    event_abi:
      "event Deposit(address indexed sedner, address indexed owner, uint256 assets, uint256 shares)",
  },
];

export const PROTOCOL_METADATA: Record<
  string,
  { emoji: string; description: string }
> = {
  Morpho: {
    emoji: "🦋",
    description: "Lending protocol optimizer",
  },
  Pendle: {
    emoji: "⏳",
    description: "Yield trading protocol",
  },
  Aave: {
    emoji: "👻",
    description: "Decentralized lending",
  },
  Reservoir: {
    emoji: "🌊",
    description: "Stablecoin protocol",
  },
};

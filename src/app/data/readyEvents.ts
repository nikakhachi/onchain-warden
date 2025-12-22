interface ReadyEvent {
  protocol: string;
  description: string;
  chain_id: number;
  contract_address?: string;
  event_abi: string;
  required: string[];
}

export const READY_EVENTS: ReadyEvent[] = [
  {
    protocol: "Reservoir",
    description: "rUSD mint",
    chain_id: 1,
    contract_address: "0x4809010926aec940b550d34a46a52739f996d75d",
    event_abi:
      "event Mint(address indexed from, address indexed to, uint256 amount, uint256 timestamp)",
    required: [],
  },
  {
    protocol: "Reservoir",
    description: "wsrUSD mint",
    chain_id: 1,
    contract_address: "0xd3fd63209fa2d55b07a0f6db36c2f43900be3094",
    event_abi:
      "event Deposit(address indexed sender, address indexed owner, uint256 assets, uint256 shares)",
    required: ["owner", "sender"],
  },
  {
    protocol: "Morpho",
    description: "IIRM Borrow Rate Change",
    chain_id: 1,
    event_abi:
      "event BorrowRateUpdate(bytes32 indexed id, uint256 avgBorrowRate, uint256 rateAtTarget)",
    required: ["id"],
  },
];

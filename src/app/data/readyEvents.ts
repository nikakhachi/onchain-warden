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
    required: [],
  },
  {
    protocol: "Morpho",
    description: "IIRM Borrow Rate Change",
    chain_id: 1,
    contract_address: "0x870aC11D48B15DB9a138Cf899d20F13F79Ba00BC",
    event_abi:
      "event BorrowRateUpdate(bytes32 indexed id, uint256 avgBorrowRate, uint256 rateAtTarget)",
    required: ["id"],
  },
  {
    protocol: "Aave",
    description: "Supply Cap Change",
    chain_id: 1,
    contract_address: "0x64b761D848206f447Fe2dd461b0c635Ec39EbB27",
    event_abi:
      "event SupplyCapChanged(address indexed asset,uint256 oldSupplyCap,uint256 newSupplyCap)",
    required: ["asset"],
  },
  {
    protocol: "Aave",
    description: "Borrow Cap Change",
    chain_id: 1,
    contract_address: "0x64b761D848206f447Fe2dd461b0c635Ec39EbB27",
    event_abi:
      "event BorrowCapChanged(address indexed asset,uint256 oldBorrowCap,uint256 newBorrowCap)",
    required: ["asset"],
  },
  {
    protocol: "Uniswap",
    description: "Pool Created (v3)",
    chain_id: 1,
    contract_address: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
    event_abi:
      "event PoolCreated(address indexed token0, address indexed token1, uint24 indexed fee, int24 tickSpacing, address pool)",
    required: [],
  },
  {
    protocol: "Uniswap",
    description: "Pool Created (v2)",
    chain_id: 1,
    contract_address: "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f",
    event_abi:
      "event PairCreated(address indexed token0, address indexed token1, address pair, uint256)",
    required: [],
  },
  {
    protocol: "Morpho",
    description: "Vault Cap Change",
    chain_id: 1,
    event_abi:
      "event SetCap(address indexed caller, bytes32 indexed id, uint256 cap)",
    required: [],
  },
  {
    protocol: "Morpho",
    description: "Vault Cap Submit",
    chain_id: 1,
    event_abi:
      "event SubmitCap(address indexed caller, bytes32 indexed id, uint256 cap)",
    required: [],
  },
];

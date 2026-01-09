interface ReadyEvent {
  protocol: string;
  description: string;
  chain_ids: number[];
  contract_address?: string;
  event_abi: string;
  required: string[];
}

export const READY_EVENTS: ReadyEvent[] = [
  {
    protocol: "General DeFi",
    description: "LayerZero Bridge Out",
    chain_ids: [1, 8453],
    event_abi:
      "event OFTSent(bytes32 indexed guid, uint32 dstEid, address indexed fromAddress, uint256 amountSentLD, uint256 amountReceivedLD)",
    required: [],
  },
  {
    protocol: "General DeFi",
    description: "LayerZero Bridge In",
    chain_ids: [1, 8453],
    event_abi:
      "event OFTReceived(bytes32 indexed guid, uint32 srcEid, address indexed toAddress, uint256 amountReceivedLD)",
    required: [],
  },
  {
    protocol: "Morpho",
    description: "IIRM Borrow Rate Change",
    chain_ids: [1],
    contract_address: "0x870aC11D48B15DB9a138Cf899d20F13F79Ba00BC",
    event_abi: "event BorrowRateUpdate(bytes32 indexed id, uint256 avgBorrowRate, uint256 rateAtTarget)",
    required: ["id"],
  },
  {
    protocol: "Aave",
    description: "Supply Cap Change",
    chain_ids: [1],
    contract_address: "0x64b761D848206f447Fe2dd461b0c635Ec39EbB27",
    event_abi: "event SupplyCapChanged(address indexed asset,uint256 oldSupplyCap,uint256 newSupplyCap)",
    required: ["asset"],
  },
  {
    protocol: "Aave",
    description: "Borrow Cap Change",
    chain_ids: [1],
    contract_address: "0x64b761D848206f447Fe2dd461b0c635Ec39EbB27",
    event_abi: "event BorrowCapChanged(address indexed asset,uint256 oldBorrowCap,uint256 newBorrowCap)",
    required: ["asset"],
  },
  {
    protocol: "Uniswap",
    description: "Pool Created (v3)",
    chain_ids: [1],
    contract_address: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
    event_abi:
      "event PoolCreated(address indexed token0, address indexed token1, uint24 indexed fee, int24 tickSpacing, address pool)",
    required: [],
  },
  {
    protocol: "Uniswap",
    description: "Pool Created (v2)",
    chain_ids: [1],
    contract_address: "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f",
    event_abi: "event PairCreated(address indexed token0, address indexed token1, address pair, uint256)",
    required: [],
  },
  {
    protocol: "Morpho",
    description: "Vault Cap Change",
    chain_ids: [1],
    event_abi: "event SetCap(address indexed caller, bytes32 indexed id, uint256 cap)",
    required: [],
  },
  {
    protocol: "Morpho",
    description: "Vault Cap Submit",
    chain_ids: [1],
    event_abi: "event SubmitCap(address indexed caller, bytes32 indexed id, uint256 cap)",
    required: [],
  },
  {
    protocol: "Reservoir",
    description: "rUSD Mint",
    chain_ids: [1],
    contract_address: "0x4809010926aec940b550d34a46a52739f996d75d",
    event_abi: "event Mint(address indexed from, address indexed to, uint256 amount, uint256 timestamp)",
    required: [],
  },
  {
    protocol: "Reservoir",
    description: "rUSD Burn",
    chain_ids: [1],
    contract_address: "0x4809010926aec940b550d34a46a52739f996d75d",
    event_abi: "event Redeem(address indexed from, address indexed to, uint256 amount, uint256 timestamp)",
    required: [],
  },

  {
    protocol: "General DeFi",
    description: "Significant Transfer",
    chain_ids: [1, 8453],
    event_abi: "event Transfer(address indexed from, address indexed to, uint256 value)",
    required: ["value"],
  },
  {
    protocol: "Reservoir",
    description: "wsrUSD Mint",
    chain_ids: [1],
    contract_address: "0xd3fd63209fa2d55b07a0f6db36c2f43900be3094",
    event_abi: "event Deposit(address indexed sender, address indexed owner, uint256 assets, uint256 shares)",
    required: [],
  },
  {
    protocol: "Reservoir",
    description: "wsrUSD Burn",
    chain_ids: [1],
    contract_address: "0xd3fd63209fa2d55b07a0f6db36c2f43900be3094",
    event_abi:
      "event Withdraw(address indexed sender, address indexed receiver, address indexed owner, uint256 assets, uint256 shares)",
    required: [],
  },
  {
    protocol: "Reservoir",
    description: "wsrUSD Cap Change",
    chain_ids: [1],
    contract_address: "0xd3fd63209fa2d55b07a0f6db36c2f43900be3094",
    event_abi: "event Cap(uint256, uint256)",
    required: [],
  },
  {
    protocol: "Reservoir",
    description: "USDC PSM Refill",
    chain_ids: [1],
    contract_address: "0x4809010926aec940b550D34a46A52739f996D75D",
    event_abi: "event Allocate(address indexed signer, uint256 amount, uint256 timestamp)",
    required: [],
  },
  {
    protocol: "Reservoir",
    description: "USDT PSM Refill",
    chain_ids: [1],
    contract_address: "0xeae91b4c84e1edfa5d78dcae40962c7655a549b9",
    event_abi: "event Allocate(address indexed user, uint256 amount, uint256 timestamp)",
    required: [],
  },
  {
    protocol: "Reservoir",
    description: "USD1 PSM Refill",
    chain_ids: [1],
    contract_address: "0x813b0857e016b7ae5fb57f464dfad8ee7b74232e",
    event_abi: "event Allocate(address indexed user, uint256 amount, uint256 timestamp)",
    required: [],
  },
  // {
  //   protocol: "YO",
  //   description: "yoUSD Mint",
  //   chain_ids: [8453],
  //   contract_address: "0x0000000f2eb9f69274678c76222b35eec7588a65",
  //   event_abi: "event Deposit(address indexed sender, address indexed owner, uint256 assets, uint256 shares)",
  //   required: [],
  // },
  // {
  //   protocol: "YO",
  //   description: "yoUSD Redemption Request",
  //   chain_ids: [8453],
  //   contract_address: "0x0000000f2eb9f69274678c76222b35eec7588a65",
  //   event_abi:
  //     "event RedeemRequest(address indexed receiver, address indexed owner, uint256 assets, uint256 shares, bool indexed instant)",
  //   required: [],
  // },
  // {
  //   protocol: "YO",
  //   description: "yoUSD Burn",
  //   chain_ids: [8453],
  //   contract_address: "0x0000000f2eb9f69274678c76222b35eec7588a65",
  //   event_abi:
  //     "event Withdraw(address indexed sender, address indexed receiver, address indexed owner, uint256 assets, uint256 shares)",
  //   required: [],
  // },
  // {
  //   protocol: "YO",
  //   description: "yoETH Mint",
  //   chain_ids: [8453],
  //   contract_address: "0x3A43AEC53490CB9Fa922847385D82fe25d0E9De7",
  //   event_abi: "event Deposit(address indexed sender, address indexed owner, uint256 assets, uint256 shares)",
  //   required: [],
  // },
  // {
  //   protocol: "YO",
  //   description: "yoETH Redemption Request",
  //   chain_ids: [8453],
  //   contract_address: "0x3A43AEC53490CB9Fa922847385D82fe25d0E9De7",
  //   event_abi:
  //     "event RedeemRequest(address indexed receiver, address indexed owner, uint256 assets, uint256 shares, bool indexed instant)",
  //   required: [],
  // },
  // {
  //   protocol: "YO",
  //   description: "yoETH Burn",
  //   chain_ids: [8453],
  //   contract_address: "0x3A43AEC53490CB9Fa922847385D82fe25d0E9De7",
  //   event_abi:
  //     "event Withdraw(address indexed sender, address indexed receiver, address indexed owner, uint256 assets, uint256 shares)",
  //   required: [],
  // },
  // {
  //   protocol: "YO",
  //   description: "yoBTC Mint",
  //   chain_ids: [8453],
  //   contract_address: "0xbCbc8cb4D1e8ED048a6276a5E94A3e952660BcbC",
  //   event_abi: "event Deposit(address indexed sender, address indexed owner, uint256 assets, uint256 shares)",
  //   required: [],
  // },
  // {
  //   protocol: "YO",
  //   description: "yoBTC Redemption Request",
  //   chain_ids: [8453],
  //   contract_address: "0xbCbc8cb4D1e8ED048a6276a5E94A3e952660BcbC",
  //   event_abi:
  //     "event RedeemRequest(address indexed receiver, address indexed owner, uint256 assets, uint256 shares, bool indexed instant)",
  //   required: [],
  // },
  // {
  //   protocol: "YO",
  //   description: "yoBTC Burn",
  //   chain_ids: [8453],
  //   contract_address: "0xbCbc8cb4D1e8ED048a6276a5E94A3e952660BcbC",
  //   event_abi:
  //     "event Withdraw(address indexed sender, address indexed receiver, address indexed owner, uint256 assets, uint256 shares)",
  //   required: [],
  // },
  // {
  //   protocol: "YO",
  //   description: "yoEUR Mint",
  //   chain_ids: [8453],
  //   contract_address: "0x50c749aE210D3977ADC824AE11F3c7fd10c871e9",
  //   event_abi: "event Deposit(address indexed sender, address indexed owner, uint256 assets, uint256 shares)",
  //   required: [],
  // },
  // {
  //   protocol: "YO",
  //   description: "yoEUR Redemption Request",
  //   chain_ids: [8453],
  //   contract_address: "0x50c749aE210D3977ADC824AE11F3c7fd10c871e9",
  //   event_abi:
  //     "event RedeemRequest(address indexed receiver, address indexed owner, uint256 assets, uint256 shares, bool indexed instant)",
  //   required: [],
  // },
  // {
  //   protocol: "YO",
  //   description: "yoEUR Burn",
  //   chain_ids: [8453],
  //   contract_address: "0x50c749aE210D3977ADC824AE11F3c7fd10c871e9",
  //   event_abi:
  //     "event Withdraw(address indexed sender, address indexed receiver, address indexed owner, uint256 assets, uint256 shares)",
  //   required: [],
  // },
  // {
  //   protocol: "YO",
  //   description: "yoGOLD Mint",
  //   chain_ids: [1],
  //   contract_address: "0x586675A3a46B008d8408933cf42d8ff6c9CC61a1",
  //   event_abi: "event Deposit(address indexed sender, address indexed owner, uint256 assets, uint256 shares)",
  //   required: [],
  // },
  // {
  //   protocol: "YO",
  //   description: "yoGOLD Redemption Request",
  //   chain_ids: [1],
  //   contract_address: "0x586675A3a46B008d8408933cf42d8ff6c9CC61a1",
  //   event_abi:
  //     "event RedeemRequest(address indexed receiver, address indexed owner, uint256 assets, uint256 shares, bool indexed instant)",
  //   required: [],
  // },
  // {
  //   protocol: "YO",
  //   description: "yoGOLD Burn",
  //   chain_ids: [1],
  //   contract_address: "0x586675A3a46B008d8408933cf42d8ff6c9CC61a1",
  //   event_abi:
  //     "event Withdraw(address indexed sender, address indexed receiver, address indexed owner, uint256 assets, uint256 shares)",
  //   required: [],
  // },
];

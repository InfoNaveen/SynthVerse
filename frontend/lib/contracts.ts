// Contract addresses (Polygon Amoy Testnet)
export const CONTRACTS = {
  AGVT_TOKEN: process.env.NEXT_PUBLIC_CONTRACT_TOKEN || "",
  ANCHOR: process.env.NEXT_PUBLIC_CONTRACT_ANCHOR || "",
  FORENSICS_NFT: process.env.NEXT_PUBLIC_CONTRACT_FORENSICS || "",
};

// Minimal ABI for AGVT token (ERC20)
export const AGVT_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function totalSupply() view returns (uint256)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function getLeaderboard() view returns (address[] memory topAgents, uint256[] memory balances)",
  "function getAgentRank(address agent) view returns (string memory rank)",
];

export const ANCHOR_ABI = [
  "function getMerkleCount() view returns (uint256 count)",
  "function getDarkPeriodCount() view returns (uint256 count)",
  "function getTamperCount() view returns (uint256 count)",
];

// Polygon Amoy chain config
export const AMOY_CHAIN = {
  chainId: "0x13882",
  chainName: "Polygon Amoy Testnet",
  nativeCurrency: { name: "MATIC", symbol: "MATIC", decimals: 18 },
  rpcUrls: ["https://rpc-amoy.polygon.technology/"],
  blockExplorerUrls: ["https://amoy.polygonscan.com/"],
};

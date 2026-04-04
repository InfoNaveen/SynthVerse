# 🌌 AntiGravity — Smart Contracts

> Decentralized dark-period forensics and accountability layer for metaverse digital twins.

When cloud infrastructure is attacked, metaverse platforms go dark. During these "dark periods," attackers silently tamper with digital twin data with zero accountability. **AntiGravity** prevents this by anchoring digital twin state on-chain, detecting tampering using AI forensics, and rewarding community agents via a gamified token system.

---

## 📦 Contracts Overview

| Contract | Description |
|---|---|
| **AntiGravityToken** (AGVT) | ERC-20 reward token with rank system & leaderboard |
| **AntiGravityAnchor** | Core contract for Merkle root anchoring, dark periods, and tamper evidence |
| **AntiGravityForensics** | Stores AI forensic reports linked to dark period events |

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** ≥ 18
- **npm** or **yarn**
- A wallet with testnet MATIC on [Polygon Amoy](https://amoy.polygonscan.com)

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and fill in your values:

```env
PRIVATE_KEY=your_wallet_private_key
AMOY_RPC_URL=https://rpc-amoy.polygon.technology
POLYGONSCAN_API_KEY=your_polygonscan_api_key
```

### 3. Compile Contracts

```bash
npx hardhat compile
```

### 4. Run Tests

```bash
npx hardhat test
```

### 5. Deploy to Local Node

```bash
# Terminal 1: Start local node
npx hardhat node

# Terminal 2: Deploy
npx hardhat run scripts/deploy.js --network localhost
```

### 6. Deploy to Polygon Amoy Testnet

```bash
npx hardhat run scripts/deploy.js --network amoy
```

### 7. Verify on PolygonScan

After deployment, the script prints verification commands:

```bash
npx hardhat verify --network amoy <TOKEN_ADDRESS>
npx hardhat verify --network amoy <ANCHOR_ADDRESS> "<TOKEN_ADDRESS>"
npx hardhat verify --network amoy <FORENSICS_ADDRESS> "<ANCHOR_ADDRESS>"
```

---

## 📄 Contract Function Signatures

### AntiGravityToken.sol (AGVT)

```solidity
// Admin
function setMinter(address _minter) external onlyOwner

// Minting (only callable by AntiGravityAnchor)
function mint(address to, uint256 amount) external

// Views
function getAgentRank(address agent) external view returns (string memory)
function getLeaderboard() external view returns (address[] memory, uint256[] memory)
function getAgentCount() external view returns (uint256)
function agentEarnings(address) external view returns (uint256)
```

### AntiGravityAnchor.sol

```solidity
// Admin
function setAgentAuthorization(address agent, bool authorized) external onlyOwner

// Core
function submitMerkleRoot(bytes32 root, string calldata ipfsCID, uint256 timestamp) external
function declareDarkPeriod() external
function endDarkPeriod(string calldata forensicReportCID) external
function submitTamperEvidence(bytes32 preAttackRoot, bytes32 postAttackRoot, string calldata evidenceCID) external

// Views
function getMerkleHistory(uint256 count) external view returns (MerkleAnchor[] memory)
function getAgentStats(address agent) external view returns (uint256 totalAnchors, uint256 totalRewards)
function getMerkleCount() external view returns (uint256)
function getDarkPeriodCount() external view returns (uint256)
function getTamperEvidenceCount() external view returns (uint256)
```

### AntiGravityForensics.sol

```solidity
// Core
function recordForensicReport(
    uint256 darkPeriodId,
    string calldata geminiReportCID,
    bytes32 preRoot,
    bytes32 postRoot,
    bool tamperDetected,
    uint256 confidenceScore
) external

// Views
function getReport(uint256 darkPeriodId) external view returns (ForensicReport memory)
function getTamperCount() external view returns (uint256)
function getReportedPeriods() external view returns (uint256[] memory)
function getTotalReports() external view returns (uint256)
```

---

## 🏆 Agent Rank System

| AGVT Earned | Rank |
|---|---|
| 0 – 999 | 👻 GHOST |
| 1,000 – 4,999 | 👤 PHANTOM |
| 5,000 – 19,999 | 💀 WRAITH |
| 20,000+ | 🔮 SPECTER |

---

## 📤 ABI Export

After compilation, ABIs are generated in the `artifacts/` folder:

```
artifacts/contracts/AntiGravityToken.sol/AntiGravityToken.json
artifacts/contracts/AntiGravityAnchor.sol/AntiGravityAnchor.json
artifacts/contracts/AntiGravityForensics.sol/AntiGravityForensics.json
```

To extract just the ABI for frontend integration:

```bash
# PowerShell
(Get-Content artifacts/contracts/AntiGravityToken.sol/AntiGravityToken.json | ConvertFrom-Json).abi | ConvertTo-Json -Depth 10 > abi/AntiGravityToken.abi.json

# Bash / Linux / Mac
cat artifacts/contracts/AntiGravityToken.sol/AntiGravityToken.json | jq '.abi' > abi/AntiGravityToken.abi.json
```

---

## 🔐 Security Design

- **ReentrancyGuard** on all state-changing functions
- **Ownable** for admin-only operations
- **Minting restricted** — only the Anchor contract can mint AGVT
- **Custom errors** for gas-efficient reverts
- **Input validation** on all external calls

---

## 🛠 Tech Stack

- Solidity `0.8.20`
- Hardhat
- OpenZeppelin Contracts v5
- ethers.js v6
- Polygon Amoy Testnet (chainId: `80002`)

---

## 📁 Project Structure

```
ProjectX/
├── contracts/
│   ├── AntiGravityAnchor.sol
│   ├── AntiGravityToken.sol
│   └── AntiGravityForensics.sol
├── scripts/
│   └── deploy.js
├── test/
│   └── AntiGravity.test.js
├── hardhat.config.js
├── package.json
├── .env.example
├── deployed-addresses.json
└── README.md
```

---

## 📜 License

MIT

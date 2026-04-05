<div align="center">

# ◈ &thinsp; E C L I P S I S

### *Dark Period Forensics for Metaverse Digital Twins*

<br/>

![Solidity](https://img.shields.io/badge/Solidity-0.8.20-363636?style=for-the-badge&logo=solidity&logoColor=white)
![Polygon](https://img.shields.io/badge/Polygon_Amoy-7B3FE4?style=for-the-badge&logo=polygon&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js_14-000000?style=for-the-badge&logo=next.js&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-0d1117?style=for-the-badge&logo=express&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Gemini AI](https://img.shields.io/badge/Gemini_AI-4285F4?style=for-the-badge&logo=google&logoColor=white)

<br/>

<p align="center">
  <b>When cloud infrastructure collapses, attackers rewrite reality.</b><br/>
  <b>ECLIPSIS ensures every dark period is forensically recorded, tamper-proof, and permanently on-chain.</b>
</p>

<br/>

[**Live Dashboard**](#-quick-start) · [**Architecture**](#-architecture) · [**Smart Contracts**](#-smart-contracts) · [**API Reference**](#-api-reference) · [**Contributing**](#-contributing)

<br/>

---

</div>

<br/>

## ⚡ The Problem

Metaverse platforms rely on **digital twins** — real-time virtual replicas of physical environments. When cloud infrastructure is attacked, these platforms experience **dark periods**: windows of total observability loss.

During dark periods, attackers silently tamper with digital twin state — modifying sensor readings, climate data, and traffic patterns — with **zero accountability**. When systems recover, no one can prove what happened.

**ECLIPSIS** solves this.

<br/>

## 🧬 How It Works

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│    ① MONITOR        ② DETECT          ③ PROVE          ④ REWARD     │
│                                                                     │
│    Live twin data   Infrastructure    AI-powered       Agents earn  │
│    is Merkle-hashed attack detected   forensic diff    AGVT tokens  │
│    & anchored       → Dark Period     via Gemini AI    based on     │
│    on Polygon       declared          + IPFS storage   contribution │
│                                                                     │
│    ┌───────────┐    ┌───────────┐    ┌───────────┐    ┌───────────┐ │
│    │ Twin Data │───▶│Dark Period│───▶│ Forensics │───▶│Leaderboard│
│    │  Anchor   │    │ Detection │    │  Report   │    │  & Ranks  │ │
│    └───────────┘    └───────────┘    └───────────┘    └───────────┘ │
│         │                │                │                │        │
│         ▼                ▼                ▼                ▼        │
│    ┌──────────────────────────────────────────────────────────────┐ │
│    │               POLYGON AMOY BLOCKCHAIN                        │  │
│    └──────────────────────────────────────────────────────────────┘ │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

<br/>

## 🏗 Architecture

ECLIPSIS is a **full-stack decentralized application** with three interconnected layers:

```
eclipsis/
│
├── contracts/                    # ── Blockchain Layer ──────────────
│   ├── AntiGravityToken.sol      #   ERC-20 reward token (AGVT)
│   ├── AntiGravityAnchor.sol     #   Merkle anchoring + dark periods
│   └── AntiGravityForensics.sol  #   AI forensic report storage
│
├── backend/                      # ── Intelligence Layer ───────────
│   ├── server.js                 #   Express + Socket.io server
│   ├── services/
│   │   ├── twinDataService.js    #   Real-time twin data polling
│   │   ├── merkleService.js      #   Merkle tree construction
│   │   ├── blockchainService.js  #   Contract interactions
│   │   ├── threatService.js      #   URLhaus threat intelligence
│   │   └── forensicsService.js   #   Gemini AI forensic analysis
│   ├── routes/
│   │   ├── twin.js               #   Digital twin endpoints
│   │   ├── agent.js              #   Agent stats & leaderboard
│   │   ├── forensics.js          #   Forensic report queries
│   │   └── simulate.js           #   Attack simulation engine
│   ├── models/                   #   MongoDB schemas
│   └── config/                   #   Database config
│
├── frontend/                     # ── Presentation Layer ───────────
│   ├── app/
│   │   ├── page.tsx              #   Landing page
│   │   ├── dashboard/            #   SOC command center
│   │   ├── agents/               #   Agent profile & stats
│   │   └── leaderboard/          #   Community rankings
│   ├── components/
│   │   ├── TwinPanel.tsx         #   Live sensor dashboard
│   │   ├── ThreatPanel.tsx       #   Threat intelligence feed
│   │   ├── ForensicsPanel.tsx    #   AI forensic reports
│   │   ├── AttackSimulator.tsx   #   Dark period simulation
│   │   ├── AgentPanel.tsx        #   Agent rank & rewards
│   │   └── MerkleViewer.tsx      #   On-chain anchor history
│   └── hooks/
│       ├── useSocket.ts          #   Real-time WebSocket state
│       └── useWallet.ts          #   Wallet connection logic
│
├── scripts/
│   └── deploy.js                 #   Automated deployment script
├── test/
│   └── AntiGravity.test.js       #   Smart contract test suite
├── hardhat.config.js             #   Hardhat configuration
└── deployed-addresses.json       #   Deployed contract registry
```

<br/>

## 📜 Smart Contracts

Three interlocking contracts form the on-chain accountability layer:

### `AntiGravityToken.sol` — **AGVT Reward Token**

> ERC-20 token with a gamified rank system and on-chain leaderboard.

| Function | Access | Description |
|---|---|---|
| `setMinter(address)` | Owner | Authorize the Anchor contract to mint |
| `mint(address, uint256)` | Minter only | Mint AGVT rewards to agents |
| `getAgentRank(address)` | Public | Returns rank string based on earnings |
| `getLeaderboard()` | Public | Top agents by AGVT earned |
| `agentEarnings(address)` | Public | Total AGVT earned by an agent |

### `AntiGravityAnchor.sol` — **State Anchoring Engine**

> Core contract for Merkle root anchoring, dark period management, and tamper evidence.

| Function | Access | Description |
|---|---|---|
| `submitMerkleRoot(bytes32, string, uint256)` | Authorized | Anchor a Merkle root with IPFS CID |
| `declareDarkPeriod()` | Owner | Flag the start of a dark period |
| `endDarkPeriod(string)` | Owner | Close dark period with forensic report |
| `submitTamperEvidence(bytes32, bytes32, string)` | Authorized | Record pre/post attack root divergence |
| `getMerkleHistory(uint256)` | Public | Retrieve last N Merkle anchors |
| `getDarkPeriodCount()` | Public | Total dark periods recorded |
| `getTamperEvidenceCount()` | Public | Total tamper events logged |

### `AntiGravityForensics.sol` — **AI Forensic Reports**

> Immutable storage for Gemini AI-generated forensic analysis reports.

| Function | Access | Description |
|---|---|---|
| `recordForensicReport(...)` | Authorized | Store forensic analysis on-chain |
| `getReport(uint256)` | Public | Retrieve report by dark period ID |
| `getTamperCount()` | Public | Total confirmed tamper incidents |
| `getReportedPeriods()` | Public | All dark period IDs with reports |

<br/>

## 🏆 Agent Rank System

Agents earn **AGVT** tokens for anchoring state and submitting evidence. Ranks are determined on-chain:

```
  ╔══════════════════════════════════════════════════════════════╗
                                                               
      👻  GHOST       0 – 999 AGVT        "Fresh recruit"        
      👤  PHANTOM     1,000 – 4,999       "Proven watcher"       
      💀  WRAITH      5,000 – 19,999      "Veteran sentinel"     
      🔮  SPECTER     20,000+             "Elite operative"      
                                                                 
  ╚══════════════════════════════════════════════════════════════╝
```

<br/>

## 🚀 Quick Start

### Prerequisites

| Requirement | Version |
|---|---|
| **Node.js** | ≥ 18.0 |
| **npm** | ≥ 9.0 |
| **MongoDB** | Atlas or local instance |
| **MetaMask** | With Polygon Amoy testnet |

<br/>

### 1️⃣ &thinsp; Clone & Install

```bash
# Clone the repository
git clone https://github.com/InfoNaveen/SynthVerse.git
cd SynthVerse

# Install root dependencies (Hardhat + contracts)
npm install

# Install backend dependencies
cd backend && npm install && cd ..

# Install frontend dependencies
cd frontend && npm install && cd ..
```

### 2️⃣ &thinsp; Configure Environment

**Root** — `/.env`
```env
PRIVATE_KEY=your_wallet_private_key
POLYGON_RPC_URL=https://rpc-amoy.polygon.technology
POLYGONSCAN_API_KEY=your_polygonscan_api_key
```

**Backend** — `/backend/.env`
```env
PORT=8080
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/antigravity

# External APIs
OPENWEATHERMAP_API_KEY=your_key
TOMTOM_API_KEY=your_key
ABUSEIPDB_API_KEY=your_key

# AI & Storage
GEMINI_API_KEY=your_gemini_key
PINATA_API_KEY=your_key
PINATA_SECRET_API_KEY=your_secret

# Blockchain
RPC_URL=https://rpc-amoy.polygon.technology
PRIVATE_KEY=your_wallet_private_key
CHAIN_ID=80002

# Contract Addresses (after deployment)
CONTRACT_ANCHOR=
CONTRACT_TOKEN=
CONTRACT_FORENSICS=
```

**Frontend** — `/frontend/.env.local`
```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
NEXT_PUBLIC_RPC_URL=https://rpc-amoy.polygon.technology
NEXT_PUBLIC_BACKEND_URL=http://localhost:8080
NEXT_PUBLIC_CONTRACT_TOKEN=0x...
NEXT_PUBLIC_CONTRACT_ANCHOR=0x...
NEXT_PUBLIC_CONTRACT_FORENSICS=0x...
NEXT_PUBLIC_CHAIN_ID=80002
```

### 3️⃣ &thinsp; Deploy Smart Contracts

```bash
# Option A: Local Hardhat node (for development)
npx hardhat node                                              # Terminal 1
npx hardhat run scripts/deploy.js --network localhost          # Terminal 2

# Option B: Polygon Amoy Testnet (for production)
npx hardhat run scripts/deploy.js --network amoy
```

> After deployment, copy the printed contract addresses into your `.env` files.

### 4️⃣ &thinsp; Launch

```bash
# Terminal 1 — Backend (Express + Socket.io)
cd backend && npm run dev

# Terminal 2 — Frontend (Next.js)
cd frontend && npm run dev
```

| Service | URL |
|---|---|
| 🖥 **Frontend** | http://localhost:3000 |
| ⚙️ **Backend API** | http://localhost:8080 |
| 🔗 **WebSocket** | ws://localhost:8080 |
| 🔨 **Hardhat Node** | http://localhost:8545 *(if local)* |

<br/>

## 🌊 Live Demo Flow

Experience the full attack → detect → prove → reward lifecycle:

```
┌──────────────────────────────────────────────────────────────────┐
│                          DEMO SEQUENCE                           │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  STEP 1 ─ OBSERVE                                                │
│  └─ Open /dashboard — watch live twin data streaming in          │
│     Temperature, humidity, PM2.5, traffic flowing from APIs      │
│     Merkle roots being anchored to Polygon every 60s             │
│                                                                  │
│  STEP 2 ─ ATTACK                                                 │
│ └─ Click "⚡ SIMULATE ATTACK" in the Attack Simulator           │
│     Dashboard goes red. Dark period declared on-chain.           │
│     All data feeds are now under threat.                         │
│                                                                  │
│  STEP 3 ─ TAMPER                                                 │
│  └─ Click "💉 INJECT TAMPER" to corrupt digital twin data       │
│     Sensor values are silently modified by the attacker.         │
│     Pre-attack Merkle root preserved as evidence.                │
│                                                                  │
│  STEP 4 ─ RECOVER                                                │
│  └─ Click "🔄 RECOVER" to restore systems                       │
│     Gemini AI performs forensic diff analysis.                   │
│     Report pinned to IPFS, hash anchored on Polygon.             │
│     Agent receives AGVT reward + rank update.                    │
│                                                                  │
│  STEP 5 ─ VERIFY                                                 │
│  └─ Check /agents for your rank & rewards                        │
│     Check /leaderboard to see community standings                │
│     View forensic report on-chain via PolygonScan                │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

<br/>

## 📡 API Reference

### Twin Data
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/twin/latest` | Latest digital twin sensor readings |
| `GET` | `/api/twin/history` | Historical twin data snapshots |

### Agent & Leaderboard
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/agent/stats/:address` | Agent stats, rank, and earnings |
| `GET` | `/api/agent/leaderboard` | Top agents by AGVT earned |

### Forensics
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/forensics/reports` | All forensic reports |
| `GET` | `/api/forensics/report/:id` | Specific report by dark period ID |

### Simulation *(Development Only)*
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/simulate/attack` | Trigger simulated infrastructure attack |
| `POST` | `/api/simulate/inject-tamper` | Inject tampered data into twin stream |
| `POST` | `/api/simulate/recover` | Initiate recovery + AI forensic analysis |

### WebSocket Events

| Event | Direction | Payload |
|---|---|---|
| `twin_update` | Server → Client | Live sensor data |
| `threat_update` | Server → Client | URLhaus threat intelligence |
| `ATTACK_STARTED` | Server → Client | Dark period declared |
| `RECOVERY_COMPLETE` | Server → Client | System restored + evidence |
| `FORENSIC_REPORT` | Server → Client | AI analysis results |

<br/>

## 🔐 Security Design

| Layer | Protection |
|---|---|
| **Smart Contracts** | ReentrancyGuard on all state-changing functions |
| **Access Control** | OpenZeppelin Ownable + role-based authorization |
| **Minting** | Only the Anchor contract can mint AGVT — no admin backdoor |
| **Reverts** | Custom errors for gas-efficient failure handling |
| **Validation** | Input validation on all external calls |
| **Frontend** | WalletConnect + RainbowKit for secure wallet interactions |
| **Backend** | CORS configured, environment-based secret management |

<br/>

## 🛠 Tech Stack

<div align="center">

| Layer | Technology |
|---|---|
| **Smart Contracts** | Solidity 0.8.20 · OpenZeppelin v5 · Hardhat |
| **Blockchain** | Polygon Amoy Testnet (Chain ID: 80002) |
| **Backend** | Node.js · Express · Socket.io · Mongoose |
| **Frontend** | Next.js 14 · React 18 · TypeScript · Tailwind CSS |
| **Web3** | wagmi · viem · RainbowKit · ethers.js v6 |
| **AI Engine** | Google Gemini AI (forensic analysis) |
| **Storage** | IPFS via Pinata (forensic reports) · MongoDB Atlas |
| **Data Sources** | OpenWeatherMap · TomTom Traffic · URLhaus |
| **UI/UX** | Framer Motion · Recharts · Lucide Icons |

</div>

<br/>

## 🧪 Testing

```bash
# Run smart contract tests
npx hardhat test

# Run with gas reporting
REPORT_GAS=true npx hardhat test

# Run with coverage
npx hardhat coverage

# Compile contracts
npx hardhat compile
```

<br/>

## 📋 Available Scripts

| Directory | Command | Description |
|---|---|---|
| `/` | `npm run compile` | Compile Solidity contracts |
| `/` | `npm test` | Run Hardhat test suite |
| `/` | `npm run deploy:amoy` | Deploy to Polygon Amoy |
| `/` | `npm run deploy:local` | Deploy to local Hardhat node |
| `/` | `npm run node` | Start local Hardhat node |
| `/backend` | `npm run dev` | Start backend with hot-reload |
| `/backend` | `npm start` | Start backend (production) |
| `/frontend` | `npm run dev` | Start Next.js dev server |
| `/frontend` | `npm run build` | Build for production |

<br/>

## 🤝 Contributing

Contributions are welcome. Whether it's improving the forensic analysis algorithm, adding new data sources, or enhancing the UI — every contribution makes the metaverse safer.

1. **Fork** the repository
2. **Create** your feature branch — `git checkout -b feature/your-feature`
3. **Commit** your changes — `git commit -m "feat: add amazing feature"`
4. **Push** to the branch — `git push origin feature/your-feature`
5. **Open** a Pull Request

<br/>

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

<br/>

---

<div align="center">

<br/>

**Built with conviction that accountability should survive any outage.**

<br/>

◈ &thinsp; E C L I P S I S

<br/>

<sub>Decentralized Dark Period Forensics · Polygon Amoy · Gemini AI · Real-Time Intelligence</sub>

<br/>

</div>

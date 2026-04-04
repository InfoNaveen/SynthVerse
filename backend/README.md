# AntiGravity Backend

> Decentralized dark-period forensics and accountability layer for metaverse digital twins.

When cloud infrastructure is attacked, metaverse platforms go dark. AntiGravity prevents silent data tampering during these **dark periods** by:

- 📡 **Polling real-world APIs** every 60 seconds (weather, air quality, traffic)
- 🌳 **Building Merkle trees** of digital twin state
- ⛓️ **Anchoring roots on blockchain** for tamper-proof integrity
- 🤖 **AI forensics** via Gemini 2.5 Pro to detect impossible values
- 📌 **IPFS pinning** of forensic reports via Pinata
- 🛡️ **Real-time threat intelligence** from URLhaus + AbuseIPDB

---

## Quick Start

### 1. Prerequisites

- Node.js ≥ 18
- MongoDB Atlas account (or local MongoDB)
- API keys (see `.env.example`)

### 2. Install

```bash
cd antigravity/backend
npm install
```

### 3. Configure

```bash
cp .env.example .env
# Edit .env and fill in your API keys
```

**Required keys:**

| Variable | Source |
|---|---|
| `MONGODB_URI` | [MongoDB Atlas](https://cloud.mongodb.com) |
| `OPENWEATHERMAP_API_KEY` | [OpenWeatherMap](https://openweathermap.org/api) |
| `TOMTOM_API_KEY` | [TomTom Developer](https://developer.tomtom.com) |
| `GEMINI_API_KEY` | [Google AI Studio](https://aistudio.google.com) |
| `PINATA_API_KEY` + `PINATA_SECRET_API_KEY` | [Pinata](https://www.pinata.cloud) |
| `ABUSEIPDB_API_KEY` | [AbuseIPDB](https://www.abuseipdb.com) |
| `PRIVATE_KEY` | Your Ethereum wallet private key |
| `RPC_URL` | Alchemy / Infura / Polygon Amoy RPC |

### 4. Run

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

The server starts on `http://localhost:8080` (or `PORT` from env).

---

## API Endpoints

### Twin Data

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/twin/current` | Latest digital twin state |
| GET | `/api/twin/history` | Last 20 snapshots |
| GET | `/api/twin/merkle` | Current Merkle root |

### Agent

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/agent/anchor` | Manually anchor Merkle root on-chain |
| GET | `/api/agent/rank/:addr` | Get agent rank by address |
| GET | `/api/agent/leaderboard` | Top 10 agents |
| GET | `/api/agent/stats/:addr` | Agent statistics |

### Forensics

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/forensics/report/:id` | Get forensic report by ID |
| GET | `/api/forensics/tamper-count` | Total detected tamper events |

### Simulation

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/simulate/attack` | Declare dark period (stops polling) |
| POST | `/api/simulate/inject-tamper` | Inject impossible values |
| POST | `/api/simulate/recover` | Recover, run AI forensics, end dark period |

### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check (Railway uses this) |
| GET | `/` | Service info |

---

## Socket.io Events

Connect to `ws://localhost:8080` (or `wss://` in production) to receive real-time events:

| Event | Trigger |
|-------|---------|
| `twin_update` | Every 60s — new twin state |
| `merkle_anchored` | Merkle root submitted on-chain |
| `threat_update` | Every 5 min — threat feed |
| `ATTACK_STARTED` | Dark period declared |
| `RECOVERY_COMPLETE` | Recovery finished |
| `FORENSIC_REPORT` | AI forensics result |
| `agent_rewarded` | AGVT tokens minted |
| `leaderboard_update` | Rankings changed |

---

## Architecture

```
server.js
 ├── config/db.js           → MongoDB connection
 ├── middleware/errorHandler → Global error handler
 ├── services/
 │   ├── twinDataService    → Polls 3 APIs, builds twin state
 │   ├── merkleService      → Merkle tree generation & proofs
 │   ├── blockchainService  → ethers.js v6 contract calls
 │   ├── forensicsService   → Gemini 2.5 Pro + IPFS pinning
 │   └── threatService      → URLhaus + AbuseIPDB
 ├── routes/
 │   ├── twin.js            → /api/twin/*
 │   ├── agent.js           → /api/agent/*
 │   ├── forensics.js       → /api/forensics/*
 │   └── simulate.js        → /api/simulate/*
 └── models/
     ├── TwinSnapshot.js
     ├── Agent.js
     ├── DarkPeriod.js
     └── ForensicReport.js
```

---

## Simulation Flow

1. **`POST /api/simulate/attack`** — Stops twin polling, declares dark period on-chain, saves pre-attack Merkle root.
2. **`POST /api/simulate/inject-tamper`** — Modifies fields to impossible values (temp → 450°C, pm25 → 99999, etc.).
3. **`POST /api/simulate/recover`** — Restarts polling, compares Merkle roots, runs Gemini AI forensics if divergence detected, pins report to IPFS, ends dark period on-chain, emits full results via Socket.io.

---

## Contract Integration

This backend expects deployed contract artifacts from the Part 1 team:

- `../contracts/deployed-addresses.json` — contract addresses
- `../contracts/artifacts/contracts/` — compiled ABIs

If these files are missing, all blockchain calls will gracefully fail with warnings.

### Copying ABIs after deployment

After contracts are deployed with Hardhat, copy ABI files to the `abi/` folder:

```bash
# From the project root (antigravity/)
cp contracts/artifacts/contracts/AntiGravityAnchor.sol/AntiGravityAnchor.json backend/abi/
cp contracts/artifacts/contracts/AntiGravityToken.sol/AntiGravityToken.json backend/abi/
cp contracts/artifacts/contracts/AntiGravityForensics.sol/AntiGravityForensics.json backend/abi/
```

The `blockchainService.js` will auto-detect ABIs from either location.

---

## Deployment (Railway)

1. Push this repo to GitHub
2. Connect to [Railway](https://railway.app)
3. Set all `.env` variables in Railway dashboard
4. Railway auto-detects `npm start` via `package.json`
5. Health check at `/health` confirms deployment

**Important:** The server binds to `0.0.0.0` which is required for Railway. The `Procfile` is also included as fallback.

---

## Verification Commands

```bash
# Check syntax of all files
node --check server.js
node --check services/twinDataService.js
node --check services/blockchainService.js
node --check services/forensicsService.js
node --check services/threatService.js
node --check services/merkleService.js
node --check routes/simulate.js
node --check models/DarkPeriod.js

# Test server starts
node server.js

# Test health endpoint
curl http://localhost:8080/health

# Test twin data endpoint
curl http://localhost:8080/api/twin/current
```

---

## License

ISC

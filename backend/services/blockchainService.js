const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

// ─── Lazy-loaded contract instances ────────────────────────
let provider = null;
let signer = null;
let anchorContract = null;
let tokenContract = null;

/**
 * Load deployed addresses from the Part 1 team's output.
 * Falls back to an empty object if the file doesn't exist yet.
 */
function loadAddresses() {
  const filePath = path.resolve(__dirname, '../../contracts/deployed-addresses.json');
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.warn('[Blockchain] deployed-addresses.json not found — contract calls will fail until Part 1 deploys');
    return {};
  }
}

/**
 * Load a contract ABI from the Part 1 team's artifacts.
 */
function loadABI(contractName) {
  const artifactDir = path.resolve(__dirname, '../../contracts/artifacts/contracts');
  // Hardhat-style artifact: contracts/<Name>.sol/<Name>.json
  const filePath = path.join(artifactDir, `${contractName}.sol`, `${contractName}.json`);
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw).abi;
  } catch (err) {
    console.warn(`[Blockchain] ABI for ${contractName} not found at ${filePath}`);
    return null;
  }
}

/**
 * Initialise the ethers provider, signer, and contract instances.
 * Call once on server start; safe to call multiple times (idempotent).
 */
function initBlockchain() {
  if (provider) return; // already initialised

  const rpcUrl = process.env.RPC_URL || 'http://127.0.0.1:8545';
  const privateKey = process.env.PRIVATE_KEY;

  try {
    provider = new ethers.JsonRpcProvider(rpcUrl);

    if (privateKey) {
      signer = new ethers.Wallet(privateKey, provider);
      console.log(`[Blockchain] Signer address: ${signer.address}`);
    } else {
      console.warn('[Blockchain] PRIVATE_KEY not set — read-only mode');
    }

    const addresses = loadAddresses();
    const anchorABI = loadABI('AntiGravityAnchor');
    const tokenABI = loadABI('AntiGravityToken');

    if (anchorABI && addresses.AntiGravityAnchor) {
      anchorContract = new ethers.Contract(addresses.AntiGravityAnchor, anchorABI, signer || provider);
      console.log('[Blockchain] AntiGravityAnchor contract loaded');
    }

    if (tokenABI && addresses.AntiGravityToken) {
      tokenContract = new ethers.Contract(addresses.AntiGravityToken, tokenABI, signer || provider);
      console.log('[Blockchain] AntiGravityToken contract loaded');
    }
  } catch (err) {
    console.error('[Blockchain] Init error:', err.message);
  }
}

// ─── Contract interaction wrappers ─────────────────────────

async function submitMerkleRoot(root, ipfsCID) {
  try {
    if (!anchorContract) throw new Error('Anchor contract not loaded');
    const tx = await anchorContract.submitMerkleRoot(root, ipfsCID || '');
    const receipt = await tx.wait();
    console.log(`[Blockchain] submitMerkleRoot tx: ${receipt.hash}`);
    return { txHash: receipt.hash, success: true };
  } catch (err) {
    console.error('[Blockchain] submitMerkleRoot error:', err.message);
    return { txHash: null, success: false, error: err.message };
  }
}

async function declareDarkPeriod() {
  try {
    if (!anchorContract) throw new Error('Anchor contract not loaded');
    const tx = await anchorContract.declareDarkPeriod();
    const receipt = await tx.wait();
    console.log(`[Blockchain] declareDarkPeriod tx: ${receipt.hash}`);
    return { txHash: receipt.hash, success: true };
  } catch (err) {
    console.error('[Blockchain] declareDarkPeriod error:', err.message);
    return { txHash: null, success: false, error: err.message };
  }
}

async function endDarkPeriod(reportCID) {
  try {
    if (!anchorContract) throw new Error('Anchor contract not loaded');
    const tx = await anchorContract.endDarkPeriod(reportCID || '');
    const receipt = await tx.wait();
    console.log(`[Blockchain] endDarkPeriod tx: ${receipt.hash}`);
    return { txHash: receipt.hash, success: true };
  } catch (err) {
    console.error('[Blockchain] endDarkPeriod error:', err.message);
    return { txHash: null, success: false, error: err.message };
  }
}

async function submitTamperEvidence(preRoot, postRoot, cid) {
  try {
    if (!anchorContract) throw new Error('Anchor contract not loaded');
    const tx = await anchorContract.submitTamperEvidence(preRoot, postRoot, cid || '');
    const receipt = await tx.wait();
    console.log(`[Blockchain] submitTamperEvidence tx: ${receipt.hash}`);
    return { txHash: receipt.hash, success: true };
  } catch (err) {
    console.error('[Blockchain] submitTamperEvidence error:', err.message);
    return { txHash: null, success: false, error: err.message };
  }
}

async function getAgentRank(address) {
  try {
    if (!tokenContract) throw new Error('Token contract not loaded');
    const rank = await tokenContract.getAgentRank(address);
    return { rank, success: true };
  } catch (err) {
    console.error('[Blockchain] getAgentRank error:', err.message);
    return { rank: 'Unknown', success: false, error: err.message };
  }
}

async function getLeaderboard() {
  try {
    if (!tokenContract) throw new Error('Token contract not loaded');
    // Attempt to read the leaderboard from the contract
    // If the contract exposes a getLeaderboard() view, use it directly
    const board = await tokenContract.getLeaderboard();
    const formatted = board.map((entry, i) => ({
      rank: i + 1,
      address: entry.agent || entry[0],
      score: Number(entry.score || entry[1] || 0),
    }));
    return { leaderboard: formatted.slice(0, 10), success: true };
  } catch (err) {
    console.warn('[Blockchain] getLeaderboard error:', err.message);
    // Return an empty leaderboard so the API never crashes
    return { leaderboard: [], success: false, error: err.message };
  }
}

module.exports = {
  initBlockchain,
  submitMerkleRoot,
  declareDarkPeriod,
  endDarkPeriod,
  submitTamperEvidence,
  getAgentRank,
  getLeaderboard,
};

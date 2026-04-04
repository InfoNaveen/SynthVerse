const express = require('express');
const router = express.Router();
const Agent = require('../models/Agent');
const twinDataService = require('../services/twinDataService');
const merkleService = require('../services/merkleService');
const blockchainService = require('../services/blockchainService');

/**
 * POST /api/agent/anchor
 * Manually trigger a Merkle root anchor to the blockchain.
 */
router.post('/anchor', async (req, res, next) => {
  try {
    const state = twinDataService.getLastKnownState();
    if (!state) {
      return res.status(400).json({ success: false, error: 'No twin state available to anchor' });
    }

    const { root } = merkleService.buildMerkleRoot(state);
    const result = await blockchainService.submitMerkleRoot(root, '');

    // Emit to connected clients
    const io = req.app.get('io');
    if (io && result.success) {
      io.emit('merkle_anchored', { root, txHash: result.txHash, timestamp: Date.now() });
    }

    res.json({
      success: result.success,
      data: { merkleRoot: root, txHash: result.txHash },
      ...(result.error && { error: result.error }),
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/agent/rank/:addr
 * Get the on-chain rank for a given agent address.
 */
router.get('/rank/:addr', async (req, res, next) => {
  try {
    const result = await blockchainService.getAgentRank(req.params.addr);
    res.json({ success: result.success, data: { address: req.params.addr, rank: result.rank } });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/agent/leaderboard
 * Returns the top 10 agents by score.
 */
router.get('/leaderboard', async (_req, res, next) => {
  try {
    const result = await blockchainService.getLeaderboard();
    res.json({ success: result.success, data: result.leaderboard });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/agent/stats/:addr
 * Returns stored statistics for a given agent address.
 */
router.get('/stats/:addr', async (req, res, next) => {
  try {
    const agent = await Agent.findOne({ address: req.params.addr.toLowerCase() }).lean();
    if (!agent) {
      return res.status(404).json({ success: false, error: 'Agent not found' });
    }
    res.json({ success: true, data: agent });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

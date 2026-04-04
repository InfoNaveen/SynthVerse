const express = require('express');
const router = express.Router();
const TwinSnapshot = require('../models/TwinSnapshot');
const twinDataService = require('../services/twinDataService');
const merkleService = require('../services/merkleService');

/**
 * GET /api/twin/current
 * Returns the latest digital twin state.
 */
router.get('/current', async (_req, res, next) => {
  try {
    // Try in-memory first (fastest)
    let state = twinDataService.getLastKnownState();
    if (!state) {
      // Fall back to most recent MongoDB document
      const doc = await TwinSnapshot.findOne().sort({ timestamp: -1 }).lean();
      state = doc || { message: 'No twin data available yet. Wait for the first polling cycle.' };
    }
    res.json({ success: true, data: state });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/twin/history
 * Returns the last 20 snapshots, newest first.
 */
router.get('/history', async (_req, res, next) => {
  try {
    const snapshots = await TwinSnapshot.find()
      .sort({ timestamp: -1 })
      .limit(20)
      .lean();
    res.json({ success: true, count: snapshots.length, data: snapshots });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/twin/merkle
 * Builds and returns the Merkle root of the current twin state.
 */
router.get('/merkle', async (_req, res, next) => {
  try {
    const state = twinDataService.getLastKnownState();
    if (!state) {
      return res.status(404).json({ success: false, error: 'No twin state available yet' });
    }

    const { root, leaves } = merkleService.buildMerkleRoot(state);
    res.json({
      success: true,
      data: { merkleRoot: root, leafCount: leaves.length, timestamp: state.timestamp },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

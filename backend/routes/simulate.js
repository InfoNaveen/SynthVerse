const express = require('express');
const router = express.Router();
const twinDataService = require('../services/twinDataService');
const merkleService = require('../services/merkleService');
const blockchainService = require('../services/blockchainService');
const forensicsService = require('../services/forensicsService');
const DarkPeriod = require('../models/DarkPeriod');
const ForensicReport = require('../models/ForensicReport');

// ─── Shared simulation state ──────────────────────────────
// This is a singleton per-process; fine for a single-server deployment.
const simState = {
  darkMode: false,
  preAttackState: null,
  preAttackRoot: null,
  tamperedState: null,
  darkPeriodDoc: null,
};

/**
 * POST /api/simulate/attack
 * 1. Stop twin polling
 * 2. Declare dark period on-chain
 * 3. Store pre-attack state + Merkle root
 * 4. Emit ATTACK_STARTED
 */
router.post('/attack', async (req, res, next) => {
  try {
    if (simState.darkMode) {
      return res.status(400).json({ success: false, error: 'Attack already in progress' });
    }

    // Capture pre-attack state
    const currentState = twinDataService.getLastKnownState();
    if (!currentState) {
      return res.status(400).json({ success: false, error: 'No twin data available — wait for first poll' });
    }

    // Stop polling
    twinDataService.stopPolling();

    // Build pre-attack Merkle root
    const { root } = merkleService.buildMerkleRoot(currentState);
    simState.preAttackState = { ...currentState };
    simState.preAttackRoot = root;
    simState.tamperedState = null;
    simState.darkMode = true;

    // Update global state
    global.lastMerkleRoot = root;
    global.attackActive = true;

    // On-chain: declare dark period
    const chainResult = await blockchainService.declareDarkPeriod();

    // Persist dark period to DB
    try {
      simState.darkPeriodDoc = await DarkPeriod.create({
        startTime: new Date(),
        preAttackRoot: root,
        txHashDeclare: chainResult.txHash,
        isActive: true,
      });
      global.activeDarkPeriodId = simState.darkPeriodDoc._id;
    } catch (dbErr) {
      console.warn('[Simulate] DB save error:', dbErr.message);
    }

    // Emit via Socket.io
    const io = req.app.get('io');
    if (io) {
      io.emit('ATTACK_STARTED', {
        preAttackRoot: root,
        txHash: chainResult.txHash,
        darkPeriodId: simState.darkPeriodDoc?._id,
        timestamp: Date.now(),
      });
    }

    res.json({
      success: true,
      message: 'Dark period declared. Twin polling stopped.',
      data: {
        preAttackRoot: root,
        txHash: chainResult.txHash,
        darkPeriodId: simState.darkPeriodDoc?._id,
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/simulate/inject-tamper
 * Modifies one or more fields to impossible values.
 */
router.post('/inject-tamper', (req, res, next) => {
  try {
    if (!simState.darkMode) {
      return res.status(400).json({ success: false, error: 'No dark period active — call /simulate/attack first' });
    }

    // Deep-clone the pre-attack state
    const tampered = JSON.parse(JSON.stringify(simState.preAttackState));

    // Inject impossible values
    if (tampered.weather) {
      tampered.weather.temp = 450; // °C — impossible
      tampered.weather.humidity = -20; // % — impossible
      tampered.weather._tampered = true;
    }
    if (tampered.airQuality) {
      tampered.airQuality.pm25 = 99999; // impossibly high
    }
    if (tampered.traffic) {
      tampered.traffic.currentSpeed = 0;
      tampered.traffic.congestionLevel = 'TOTAL_GRIDLOCK';
    }

    tampered.source = 'simulated';
    tampered.timestamp = Date.now();

    simState.tamperedState = tampered;
    global.lastTwinState = tampered;

    // Update dark period document with tamper info
    if (simState.darkPeriodDoc) {
      DarkPeriod.findByIdAndUpdate(simState.darkPeriodDoc._id, {
        injectedTamper: {
          field: 'weather.temp',
          originalValue: simState.preAttackState?.weather?.temp,
          tamperedValue: 450,
        },
      }).catch((err) => console.warn('[Simulate] DB tamper update error:', err.message));
    }

    // Emit via Socket.io
    const io = req.app.get('io');
    if (io) {
      io.emit('twin_update', tampered);
    }

    res.json({
      success: true,
      message: 'Tampered state injected with impossible values',
      data: {
        modifications: [
          'weather.temp → 450 °C',
          'weather.humidity → -20 %',
          'airQuality.pm25 → 99999',
          'traffic.currentSpeed → 0',
          'traffic.congestionLevel → TOTAL_GRIDLOCK',
        ],
        injectedField: 'weather.temp',
        injectedValue: 450,
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/simulate/recover
 * 1. Restart polling
 * 2. Fetch fresh data
 * 3. Compare roots
 * 4. AI forensics if divergence
 * 5. Pin report, end dark period on-chain
 * 6. Emit RECOVERY_COMPLETE + FORENSIC_REPORT
 */
router.post('/recover', async (req, res, next) => {
  try {
    if (!simState.darkMode) {
      return res.status(400).json({ success: false, error: 'No dark period active' });
    }

    const io = req.app.get('io');

    // 1. Restart polling & get fresh data
    twinDataService.startPolling();
    const freshState = await twinDataService.pollTwinState();

    // 2. Build post-attack Merkle root
    // Use the tampered state if it was injected, otherwise use fresh
    const postState = simState.tamperedState || freshState;
    const { root: postRoot } = merkleService.buildMerkleRoot(postState);

    // 3. Compare roots
    const comparison = merkleService.compareMerkleRoots(simState.preAttackRoot, postRoot);

    let analysis = null;
    let forensicReportDoc = null;
    let ipfsCID = null;

    // 4. If divergence → run AI forensics
    if (comparison.divergenceDetected) {
      analysis = await forensicsService.analyzeTampering(simState.preAttackState, postState);

      // 5. Generate and pin forensic report
      const darkPeriodData = {
        startTime: simState.darkPeriodDoc?.startTime || new Date(Date.now() - 60000),
        endTime: new Date(),
        preAttackRoot: simState.preAttackRoot,
        postAttackRoot: postRoot,
      };

      const reportResult = await forensicsService.generateForensicReport(darkPeriodData, analysis);
      ipfsCID = reportResult.ipfsCID;

      // Persist forensic report to DB
      try {
        forensicReportDoc = await ForensicReport.create({
          darkPeriodId: simState.darkPeriodDoc?._id,
          geminiAnalysis: analysis,
          tamperedFields: (analysis.tamperedFields || []).map((f) => f.field),
          confidenceScore: analysis.confidenceScore,
          ipfsCID,
          timestamp: Date.now(),
        });
      } catch (dbErr) {
        console.warn('[Simulate] DB ForensicReport save error:', dbErr.message);
      }

      // Submit tamper evidence on-chain
      if (analysis.tamperDetected) {
        await blockchainService.submitTamperEvidence(
          simState.preAttackRoot,
          postRoot,
          ipfsCID || ''
        );
      }
    }

    // 6. End dark period on-chain
    const endResult = await blockchainService.endDarkPeriod(ipfsCID || '');

    // Update dark period document
    if (simState.darkPeriodDoc) {
      try {
        await DarkPeriod.findByIdAndUpdate(simState.darkPeriodDoc._id, {
          endTime: new Date(),
          postAttackRoot: postRoot,
          tamperDetected: comparison.divergenceDetected,
          forensicReportCID: ipfsCID,
          txHashEnd: endResult.txHash,
          isActive: false,
        });
      } catch (dbErr) {
        console.warn('[Simulate] DB DarkPeriod update error:', dbErr.message);
      }
    }

    // Reset simulation state
    simState.darkMode = false;
    simState.preAttackState = null;
    simState.preAttackRoot = null;
    simState.tamperedState = null;
    simState.darkPeriodDoc = null;

    // Reset global state
    global.attackActive = false;
    global.activeDarkPeriodId = null;

    // Emit events
    const recoveryPayload = {
      divergenceDetected: comparison.divergenceDetected,
      postAttackRoot: postRoot,
      ipfsCID,
      endDarkPeriodTx: endResult.txHash,
      timestamp: Date.now(),
    };

    if (io) {
      io.emit('RECOVERY_COMPLETE', recoveryPayload);
      if (analysis) {
        io.emit('FORENSIC_REPORT', {
          reportId: forensicReportDoc?._id,
          analysis,
          ipfsCID,
          ipfsUrl: ipfsCID ? `https://ipfs.io/ipfs/${ipfsCID}` : null,
          polygonScanUrl: endResult.txHash
            ? `https://amoy.polygonscan.com/tx/${endResult.txHash}`
            : null,
        });
      }
    }

    res.json({
      success: true,
      message: comparison.divergenceDetected
        ? 'Recovery complete — TAMPERING DETECTED. Forensic report generated.'
        : 'Recovery complete — no tampering detected.',
      data: {
        ...recoveryPayload,
        ...(analysis && { forensicAnalysis: analysis }),
        ...(forensicReportDoc && { reportId: forensicReportDoc._id }),
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

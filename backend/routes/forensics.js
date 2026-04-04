const express = require('express');
const router = express.Router();
const ForensicReport = require('../models/ForensicReport');
const DarkPeriod = require('../models/DarkPeriod');

/**
 * GET /api/forensics/report/:id
 * Retrieve a forensic report by its MongoDB _id.
 */
router.get('/report/:id', async (req, res, next) => {
  try {
    const report = await ForensicReport.findById(req.params.id).lean();
    if (!report) {
      return res.status(404).json({ success: false, error: 'Forensic report not found' });
    }
    res.json({ success: true, data: report });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/forensics/tamper-count
 * Returns total number of detected tamper events.
 */
router.get('/tamper-count', async (_req, res, next) => {
  try {
    const count = await DarkPeriod.countDocuments({ tamperDetected: true });
    res.json({ success: true, data: { tamperCount: count } });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

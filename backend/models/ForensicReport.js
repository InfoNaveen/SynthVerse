const mongoose = require('mongoose');

const forensicReportSchema = new mongoose.Schema(
  {
    darkPeriodId: { type: mongoose.Schema.Types.ObjectId, ref: 'DarkPeriod', required: true },
    geminiAnalysis: {
      tamperDetected: Boolean,
      confidenceScore: Number,
      tamperedFields: [
        {
          field: String,
          preValue: mongoose.Schema.Types.Mixed,
          postValue: mongoose.Schema.Types.Mixed,
          anomalyType: String,
          severity: String,
        },
      ],
      explanation: String,
      recommendation: String,
    },
    tamperedFields: [String],
    confidenceScore: { type: Number, default: 0 },
    ipfsCID: { type: String, default: null },
    timestamp: { type: Number, default: () => Date.now() },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ForensicReport', forensicReportSchema);

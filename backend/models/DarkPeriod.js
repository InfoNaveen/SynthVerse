const mongoose = require('mongoose');

const darkPeriodSchema = new mongoose.Schema(
  {
    startTime: { type: Date, required: true, default: Date.now },
    endTime: { type: Date },
    preAttackRoot: { type: String },
    postAttackRoot: { type: String },
    tamperDetected: { type: Boolean, default: false },
    forensicReportCID: { type: String },
    txHashDeclare: { type: String },
    txHashEnd: { type: String },
    isActive: { type: Boolean, default: true },
    injectedTamper: {
      field: String,
      originalValue: mongoose.Schema.Types.Mixed,
      tamperedValue: mongoose.Schema.Types.Mixed,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('DarkPeriod', darkPeriodSchema);

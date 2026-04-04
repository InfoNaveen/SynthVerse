const mongoose = require('mongoose');

const twinSnapshotSchema = new mongoose.Schema(
  {
    timestamp: { type: Number, required: true, index: true },
    location: { type: String, default: 'Bangalore' },
    weather: {
      temp: Number,
      humidity: Number,
      pressure: Number,
      wind_speed: Number,
      description: String,
    },
    airQuality: {
      pm25: Number,
      pm10: Number,
      no2: Number,
      co: Number,
    },
    traffic: {
      currentSpeed: Number,
      freeFlowSpeed: Number,
      confidence: Number,
      congestionLevel: String,
    },
    merkleRoot: { type: String, default: null },
    ipfsCID: { type: String, default: null },
    txHash: { type: String, default: null },
    source: { type: String, enum: ['live_apis', 'stale', 'simulated'], default: 'live_apis' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('TwinSnapshot', twinSnapshotSchema);

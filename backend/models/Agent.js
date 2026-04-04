const mongoose = require('mongoose');

const agentSchema = new mongoose.Schema(
  {
    address: { type: String, required: true, unique: true, lowercase: true, index: true },
    totalAnchors: { type: Number, default: 0 },
    totalRewards: { type: Number, default: 0 },
    rank: { type: String, default: 'Unranked' },
    lastActive: { type: Date, default: Date.now },
    questsCompleted: [
      {
        questId: String,
        completedAt: Date,
        reward: Number,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Agent', agentSchema);

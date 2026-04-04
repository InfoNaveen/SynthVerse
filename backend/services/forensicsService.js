const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');

// ─── Gemini client (lazy) ──────────────────────────────────
let genAI = null;
let model = null;

function initGemini() {
  if (model) return;
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    console.warn('[Forensics] GEMINI_API_KEY not set — AI analysis disabled');
    return;
  }
  genAI = new GoogleGenerativeAI(key);
  model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });
  console.log('[Forensics] Gemini 2.5 Pro initialised');
}

// ─── System prompt ─────────────────────────────────────────
const SYSTEM_PROMPT = `You are a digital twin forensics AI analyzing infrastructure attack data. 
Compare pre-attack and post-attack digital twin states and identify statistical anomalies, impossible values, and deliberate tampering. 
Be specific about which fields were tampered, by how much, and your confidence level.

ALWAYS return valid JSON in exactly this schema (no markdown fences):
{
  "tamperDetected": boolean,
  "confidenceScore": number (0-100),
  "tamperedFields": [
    {
      "field": string,
      "preValue": any,
      "postValue": any,
      "anomalyType": string,
      "severity": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
    }
  ],
  "explanation": string,
  "recommendation": string
}`;

/**
 * Use Gemini 2.5 Pro to compare pre-attack and post-attack twin states.
 * @param {Object} preState  — twin state before dark period
 * @param {Object} postState — twin state after dark period
 * @returns {Object} structured analysis result
 */
async function analyzeTampering(preState, postState) {
  initGemini();

  if (!model) {
    // Fallback: simple field-level diff when Gemini is unavailable
    return fallbackAnalysis(preState, postState);
  }

  try {
    const userPrompt = JSON.stringify({ preState, postState }, null, 2);

    const result = await model.generateContent({
      contents: [
        { role: 'user', parts: [{ text: `${SYSTEM_PROMPT}\n\n${userPrompt}` }] },
      ],
      generationConfig: { temperature: 0.2, maxOutputTokens: 4096 },
    });

    const text = result.response.text();

    // Strip possible markdown code fences
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const analysis = JSON.parse(cleaned);

    console.log(`[Forensics] Gemini analysis complete — tamper: ${analysis.tamperDetected}, confidence: ${analysis.confidenceScore}`);
    return analysis;
  } catch (err) {
    console.error('[Forensics] Gemini API error:', err.message);
    return fallbackAnalysis(preState, postState);
  }
}

/**
 * Simple deterministic diff as fallback when Gemini is unavailable.
 */
function fallbackAnalysis(preState, postState) {
  const tamperedFields = [];
  const fieldsToCheck = ['weather', 'airQuality', 'traffic'];

  for (const section of fieldsToCheck) {
    const pre = preState?.[section] || {};
    const post = postState?.[section] || {};
    for (const [key, preVal] of Object.entries(pre)) {
      const postVal = post[key];
      if (postVal !== undefined && postVal !== preVal) {
        const deviation = typeof preVal === 'number' && typeof postVal === 'number'
          ? Math.abs(postVal - preVal) / (Math.abs(preVal) || 1)
          : 1;

        let severity = 'LOW';
        if (deviation > 5) severity = 'CRITICAL';
        else if (deviation > 2) severity = 'HIGH';
        else if (deviation > 0.5) severity = 'MEDIUM';

        tamperedFields.push({
          field: `${section}.${key}`,
          preValue: preVal,
          postValue: postVal,
          anomalyType: severity === 'CRITICAL' ? 'impossible_value' : 'statistical_anomaly',
          severity,
        });
      }
    }
  }

  const tamperDetected = tamperedFields.length > 0;
  const confidenceScore = tamperDetected ? Math.min(95, 50 + tamperedFields.length * 10) : 5;

  return {
    tamperDetected,
    confidenceScore,
    tamperedFields,
    explanation: tamperDetected
      ? `Deterministic diff detected ${tamperedFields.length} tampered field(s). Gemini was not available for deep analysis.`
      : 'No field-level differences detected between pre and post states.',
    recommendation: tamperDetected
      ? 'Submit tamper evidence to the blockchain and escalate for manual review.'
      : 'No action required.',
  };
}

/**
 * Generate a full forensic report and pin to IPFS via Pinata.
 * @param {Object} darkPeriod — DarkPeriod document / data
 * @param {Object} analysis  — output from analyzeTampering
 * @returns {{ ipfsCID: string|null }}
 */
async function generateForensicReport(darkPeriod, analysis) {
  const report = {
    title: 'AntiGravity Forensic Report',
    generatedAt: new Date().toISOString(),
    darkPeriod: {
      startTime: darkPeriod.startTime,
      endTime: darkPeriod.endTime,
      preAttackRoot: darkPeriod.preAttackRoot,
      postAttackRoot: darkPeriod.postAttackRoot,
    },
    analysis,
    version: '1.0.0',
  };

  // Pin to IPFS via Pinata
  const ipfsCID = await pinToIPFS(report);
  return { ipfsCID, report };
}

/**
 * Pin JSON data to IPFS using the Pinata API.
 */
async function pinToIPFS(jsonData) {
  const apiKey = process.env.PINATA_API_KEY;
  const secret = process.env.PINATA_SECRET_API_KEY;

  if (!apiKey || !secret) {
    console.warn('[Forensics] Pinata keys not set — skipping IPFS pin');
    return null;
  }

  try {
    const { data } = await axios.post(
      'https://api.pinata.cloud/pinning/pinJSONToIPFS',
      {
        pinataContent: jsonData,
        pinataMetadata: { name: `antigravity-forensic-${Date.now()}` },
      },
      {
        headers: {
          pinata_api_key: apiKey,
          pinata_secret_api_key: secret,
          'Content-Type': 'application/json',
        },
        timeout: 15000,
      }
    );

    console.log(`[Forensics] Pinned to IPFS: ${data.IpfsHash}`);
    return data.IpfsHash;
  } catch (err) {
    console.error('[Forensics] Pinata pin error:', err.message);
    return null;
  }
}

module.exports = {
  analyzeTampering,
  generateForensicReport,
};

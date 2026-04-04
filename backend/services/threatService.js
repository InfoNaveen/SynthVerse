const axios = require('axios');

// ─── In-memory threat store ────────────────────────────────
let recentThreats = [];
let urlhausInterval = null;
let io = null;

function init(socketIO) {
  io = socketIO;
}

// ─── URLhaus: recent malicious URLs (no key needed) ────────
async function fetchURLhausThreats() {
  try {
    const { data } = await axios.post(
      'https://urlhaus-api.abuse.ch/v1/urls/recent/',
      'limit=20',
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 10000,
      }
    );

    if (data?.urls && Array.isArray(data.urls)) {
      recentThreats = data.urls.slice(0, 20).map((u) => ({
        url: u.url,
        url_status: u.url_status,
        threat: u.threat,
        tags: u.tags || [],
        date_added: u.date_added,
      }));

      console.log(`[Threat] URLhaus: ${recentThreats.length} recent threats cached`);

      if (io) {
        io.emit('threat_update', getThreatLevel());
      }
    }
  } catch (err) {
    console.warn('[Threat] URLhaus fetch error:', err.message);
  }
}

// ─── AbuseIPDB: check a specific IP ───────────────────────
async function checkIP(ipAddress) {
  const key = process.env.ABUSEIPDB_API_KEY;
  if (!key) {
    console.warn('[Threat] ABUSEIPDB_API_KEY not set');
    return { safe: true, data: null, error: 'API key not configured' };
  }

  try {
    const { data } = await axios.get(
      'https://api.abuseipdb.com/api/v2/check',
      {
        params: { ipAddress, maxAgeInDays: 90 },
        headers: { Key: key, Accept: 'application/json' },
        timeout: 8000,
      }
    );

    const report = data?.data;
    return {
      safe: (report?.abuseConfidenceScore || 0) < 50,
      abuseConfidenceScore: report?.abuseConfidenceScore,
      totalReports: report?.totalReports,
      countryCode: report?.countryCode,
      isp: report?.isp,
    };
  } catch (err) {
    console.warn('[Threat] AbuseIPDB error:', err.message);
    return { safe: true, data: null, error: err.message };
  }
}

// ─── Aggregated threat level ───────────────────────────────
function getThreatLevel() {
  const active = recentThreats.filter((t) => t.url_status === 'online').length;

  let level = 'LOW';
  if (active >= 15) level = 'CRITICAL';
  else if (active >= 10) level = 'HIGH';
  else if (active >= 5) level = 'MEDIUM';

  return {
    level,
    activeThreats: active,
    totalCached: recentThreats.length,
    recentUrls: recentThreats.slice(0, 5),
  };
}

// ─── Start / Stop URLhaus polling (every 5 minutes) ────────
function startPolling(intervalMs = 5 * 60 * 1000) {
  if (urlhausInterval) return;
  console.log('[Threat] URLhaus polling started (every 5 min)');
  fetchURLhausThreats(); // immediate first fetch
  urlhausInterval = setInterval(fetchURLhausThreats, intervalMs);
}

function stopPolling() {
  if (urlhausInterval) {
    clearInterval(urlhausInterval);
    urlhausInterval = null;
    console.log('[Threat] URLhaus polling stopped');
  }
}

module.exports = {
  init,
  fetchURLhausThreats,
  checkIP,
  getThreatLevel,
  startPolling,
  stopPolling,
};

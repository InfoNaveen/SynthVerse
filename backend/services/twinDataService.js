const axios = require('axios');
const TwinSnapshot = require('../models/TwinSnapshot');

// ─── In-memory state ───────────────────────────────────────
let lastKnownState = null;
let pollingInterval = null;
let io = null; // Socket.io instance, set via init()

// ─── Initialise with Socket.io reference ───────────────────
function init(socketIO) {
  io = socketIO;
}

// ─── Fetch weather from OpenWeatherMap ─────────────────────
async function fetchWeather() {
  try {
    const key = process.env.OPENWEATHER_API_KEY;
    if (!key) throw new Error('OPENWEATHERMAP_API_KEY not set');

    const { data } = await axios.get(
      'https://api.openweathermap.org/data/2.5/weather',
      {
        params: { q: 'Bangalore', appid: key, units: 'metric' },
        timeout: 8000,
      }
    );

    return {
      temp: data.main.temp,
      humidity: data.main.humidity,
      pressure: data.main.pressure,
      wind_speed: data.wind.speed,
      description: data.weather?.[0]?.description || 'unknown',
    };
  } catch (err) {
    console.warn('[TwinData] Weather API error:', err.message);
    return lastKnownState?.weather || { temp: null, humidity: null, pressure: null, wind_speed: null, description: 'unavailable' };
  }
}

// ─── Fetch air quality from OpenAQ v3 ──────────────────────
async function fetchAirQuality() {
  try {
    // Step 1: Find locations near Bangalore
    const { data: locData } = await axios.get(
      'https://api.openaq.org/v3/locations',
      {
        params: { coordinates: '12.9716,77.5946', radius: 25000, limit: 5 },
        timeout: 8000,
      }
    );

    const locations = locData?.results || [];
    if (locations.length === 0) throw new Error('No OpenAQ locations found');

    const locationId = locations[0].id;

    // Step 2: Get latest measurements for this location
    const { data: measureData } = await axios.get(
      `https://api.openaq.org/v3/locations/${locationId}/measurements`,
      { params: { limit: 20 }, timeout: 8000 }
    );

    const measurements = measureData?.results || [];
    const extract = (param) => {
      const m = measurements.find((r) => r.parameter?.name?.toLowerCase() === param);
      return m ? m.value : null;
    };

    return {
      pm25: extract('pm25') ?? extract('pm2.5'),
      pm10: extract('pm10'),
      no2: extract('no2'),
      co: extract('co'),
    };
  } catch (err) {
    console.warn('[TwinData] Air Quality API error:', err.message);
    return lastKnownState?.airQuality || { pm25: null, pm10: null, no2: null, co: null };
  }
}

// ─── Fetch traffic from TomTom ─────────────────────────────
async function fetchTraffic() {
  try {
    const key = process.env.TOMTOM_API_KEY;
    if (!key) throw new Error('TOMTOM_API_KEY not set');

    const { data } = await axios.get(
      'https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json',
      {
        params: { point: '12.9716,77.5946', key },
        timeout: 8000,
      }
    );

    const flow = data.flowSegmentData;
    const ratio = flow.currentSpeed / (flow.freeFlowSpeed || 1);
    let congestionLevel = 'FREE';
    if (ratio < 0.4) congestionLevel = 'HEAVY';
    else if (ratio < 0.65) congestionLevel = 'MODERATE';
    else if (ratio < 0.85) congestionLevel = 'LIGHT';

    return {
      currentSpeed: flow.currentSpeed,
      freeFlowSpeed: flow.freeFlowSpeed,
      confidence: flow.confidence,
      congestionLevel,
    };
  } catch (err) {
    console.warn('[TwinData] Traffic API error:', err.message);
    return lastKnownState?.traffic || { currentSpeed: null, freeFlowSpeed: null, confidence: null, congestionLevel: 'UNKNOWN' };
  }
}

// ─── Combine all sources into one twin state ───────────────
async function pollTwinState() {
  const [weather, airQuality, traffic] = await Promise.all([
    fetchWeather(),
    fetchAirQuality(),
    fetchTraffic(),
  ]);

  const isStale =
    weather.description === 'unavailable' &&
    airQuality.pm25 === null &&
    traffic.currentSpeed === null;

  const twinState = {
    timestamp: Date.now(),
    location: 'Bangalore',
    weather,
    airQuality,
    traffic,
    source: isStale ? 'stale' : 'live_apis',
  };

  lastKnownState = twinState;

  // Persist to MongoDB (best-effort)
  try {
    await TwinSnapshot.create(twinState);
  } catch (err) {
    console.warn('[TwinData] DB save error:', err.message);
  }

  // Emit via Socket.io
  if (io) {
    io.emit('twin_update', twinState);
  }

  console.log(`[TwinData] Polled at ${new Date(twinState.timestamp).toISOString()} — source: ${twinState.source}`);
  return twinState;
}

// ─── Start / Stop polling ──────────────────────────────────
function startPolling(intervalMs = 60000) {
  if (pollingInterval) return; // already running
  console.log('[TwinData] Polling started (every 60s)');
  pollTwinState(); // immediate first poll
  pollingInterval = setInterval(pollTwinState, intervalMs);
}

function stopPolling() {
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
    console.log('[TwinData] Polling stopped');
  }
}

function isPolling() {
  return pollingInterval !== null;
}

function getLastKnownState() {
  return lastKnownState;
}

module.exports = {
  init,
  pollTwinState,
  startPolling,
  stopPolling,
  isPolling,
  getLastKnownState,
};

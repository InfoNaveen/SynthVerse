/**
 * ECLIPSIS Backend — server.js
 * Express + Socket.io + MongoDB + service orchestration
 */
require('dotenv').config();

const express = require('express');
const http = require('http');
const cors = require('cors');
const mongoose = require('mongoose');
const { Server: SocketIO } = require('socket.io');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// ── Services ────────────────────────────────────────────────
const twinDataService = require('./services/twinDataService');
const { initBlockchain } = require('./services/blockchainService');
const threatService = require('./services/threatService');

// ── Global state (accessible from routes via `global.*`) ────
global.lastTwinState = null;
global.lastMerkleRoot = null;
global.activeDarkPeriodId = null;
global.attackActive = false;

// ── App setup ───────────────────────────────────────────────
const app = express();
const server = http.createServer(app);

const io = new SocketIO(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  transports: ['websocket', 'polling'],
});

// Store io on app so routes can access it via req.app.get('io')
app.set('io', io);

// ── Middleware ───────────────────────────────────────────────
app.use(cors({ origin: '*' }));
app.use(express.json());

// ── Health check ────────────────────────────────────────────
app.get('/', (_req, res) => {
  res.json({
    service: 'ECLIPSIS Backend',
    status: 'operational',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ── API Routes ──────────────────────────────────────────────
app.use('/api/twin', require('./routes/twin'));
app.use('/api/agent', require('./routes/agent'));
app.use('/api/forensics', require('./routes/forensics'));
app.use('/api/simulate', require('./routes/simulate'));

// ── Error handler (must be last) ────────────────────────────
app.use(errorHandler);

// ── Socket.io connection handling ───────────────────────────
io.on('connection', (socket) => {
  console.log(`[Socket] Client connected: ${socket.id}`);

  // Send the latest twin state immediately on connect
  const current = twinDataService.getLastKnownState();
  if (current) {
    socket.emit('twin_update', current);
  }

  // Send current threat level on connect
  const threat = threatService.getThreatLevel();
  socket.emit('threat_update', threat);

  socket.on('disconnect', () => {
    console.log(`[Socket] Client disconnected: ${socket.id}`);
  });
});

// ── Bootstrap ───────────────────────────────────────────────
async function bootstrap() {
  // 1. Connect to MongoDB
  await connectDB();

  // 2. Initialise blockchain (load contracts)
  initBlockchain();

  // 3. Inject Socket.io into services
  twinDataService.init(io);
  threatService.init(io);

  // 4. Start background polling
  twinDataService.startPolling(60000);   // every 60 seconds
  threatService.startPolling(5 * 60000); // every 5 minutes

  // 5. Start HTTP server — bind to 0.0.0.0 for Railway
  const PORT = process.env.PORT || 8080;
  server.listen(PORT, '0.0.0.0', () => {
    console.log('');
    console.log('╔════════════════════════════════════════════════╗');
    console.log('║           ECLIPSIS Backend v1.0.0           ║');
    console.log('╠════════════════════════════════════════════════╣');
    console.log(`║  HTTP  → http://localhost:${PORT}                ║`);
    console.log(`║  WS    → ws://localhost:${PORT}                  ║`);
    console.log('║  Env   → ' + (process.env.NODE_ENV || 'development').padEnd(37) + ' ║');
    console.log('╚════════════════════════════════════════════════╝');
    console.log('');
  });
}

bootstrap().catch((err) => {
  console.error('[FATAL] Bootstrap failed:', err);
  process.exit(1);
});

// ── Graceful shutdown ───────────────────────────────────────
function gracefulShutdown(signal) {
  console.log(`[Server] ${signal} received — shutting down`);
  twinDataService.stopPolling();
  threatService.stopPolling();
  server.close(() => {
    mongoose.connection.close(false).then(() => {
      console.log('[Server] MongoDB connection closed');
      process.exit(0);
    }).catch(() => {
      process.exit(0);
    });
  });

  // Force exit if graceful shutdown takes too long
  setTimeout(() => {
    console.error('[Server] Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

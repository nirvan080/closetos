const localtunnel = require('localtunnel');
const http = require('http');

const PORT = 3000;
const SUBDOMAIN = 'closetos-pithoragarh';

let activeTunnel = null;
let reconnectTimer = null;

async function startTunnel() {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }

  console.log(`[Tunnel] Initializing tunnel for port ${PORT} with subdomain "${SUBDOMAIN}"...`);

  try {
    const tunnel = await localtunnel({
      port: PORT,
      subdomain: SUBDOMAIN,
      local_host: '127.0.0.1'
    });

    activeTunnel = tunnel;
    console.log(`[Tunnel] ACTIVE URL: ${tunnel.url}`);

    tunnel.on('close', () => {
      console.warn('[Tunnel] Tunnel closed. Scheduling automatic reconnect in 3s...');
      scheduleReconnect(3000);
    });

    tunnel.on('error', (err) => {
      console.error('[Tunnel] Tunnel error:', err.message);
      scheduleReconnect(5000);
    });

  } catch (err) {
    console.error('[Tunnel] Failed to start tunnel:', err.message);
    scheduleReconnect(5000);
  }
}

function scheduleReconnect(delayMs) {
  if (activeTunnel) {
    try {
      activeTunnel.close();
    } catch (_) {}
    activeTunnel = null;
  }
  if (!reconnectTimer) {
    reconnectTimer = setTimeout(() => {
      reconnectTimer = null;
      startTunnel();
    }, delayMs);
  }
}

// Keep-alive heartbeat every 45 seconds to keep the socket alive
setInterval(() => {
  if (activeTunnel && activeTunnel.url) {
    http.get('http://127.0.0.1:' + PORT, (res) => {
      // Keep local connection alive
    }).on('error', () => {});
  }
}, 45000);

startTunnel();

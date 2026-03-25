const { createClient } = require('bedrock-protocol');

// Read secrets directly from environment variables (Railway)
const host = process.env.SERVER_HOST;
const port = parseInt(process.env.SERVER_PORT);
const username = process.env.MICROSOFT_EMAIL;

if (!host || !port || !username) {
  console.error("❌ Missing SERVER_HOST, SERVER_PORT, or MICROSOFT_EMAIL environment variable!");
  process.exit(1);
}

console.log("Starting bot...");

const client = createClient({
  host,
  port,
  username,
});

client.on('login', () => {
  console.log('✅ Bot logged in successfully!');
});

client.on('join', () => {
  console.log('🌍 Bot joined the server!');
});

client.on('spawn', () => {
  console.log('🚀 Bot spawned in the world!');
});

client.on('text', (packet) => {
  console.log('💬 Chat:', packet.message);
});

// Keep alive (anti-AFK)
setInterval(() => {
  if (client?.queue) {
    client.queue('player_auth_input', {
      pitch: 0,
      yaw: 0,
      position: { x: 0, y: 0, z: 0 },
      moveVector: { x: 0, z: 0 },
      headYaw: 0,
      inputData: 0
    });
  }
}, 5000);

// First-time Microsoft login
client.on('xboxauth', (authUrl) => {
  console.log(`📌 Open this URL in your browser to login: ${authUrl}`);
  console.log('After logging in, the bot will continue automatically.');
});

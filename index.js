require('dotenv').config();
const { createClient } = require('bedrock-protocol');

const host = process.env.SERVER_HOST;
const port = parseInt(process.env.SERVER_PORT);
const username = process.env.MICROSOFT_EMAIL;

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

// Microsoft first-time login (OAuth)
client.on('xboxauth', (authUrl) => {
  console.log(`📌 Open this URL in your browser to login: ${authUrl}`);
  console.log('After logging in, your bot will continue automatically.');
});

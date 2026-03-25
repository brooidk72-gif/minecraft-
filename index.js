const { createClient } = require('bedrock-protocol');
const readline = require('readline');

const host = process.env.SERVER_HOST;
const port = parseInt(process.env.SERVER_PORT);
const username = process.env.MICROSOFT_EMAIL;

if (!host || !port || !username) {
  console.error("❌ Missing SERVER_HOST, SERVER_PORT, or MICROSOFT_EMAIL environment variable!");
  process.exit(1);
}

// Step 1: Create client in offline mode to generate login URL
const client = createClient({
  host,
  port,
  username,
  offline: true  // ❌ prevents auto connection to server
});

// Step 2: Wait for Microsoft authentication
client.on('xboxauth', (authUrl) => {
  console.log("\n📌 Microsoft Login URL:");
  console.log(authUrl);
  console.log("⏸ Bot paused. Open the link in a browser and log in.");
  console.log("Once logged in, press ENTER to continue connecting...\n");

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question("", () => {
    rl.close();
    console.log("✅ Resuming bot connection...");

    // Step 3: Switch to real mode and connect
    client.offline = false;
    client.connect();
  });
});

// Step 4: Crash-safe packet handling
client.on('spawn', () => {
  console.log("🚀 Bot spawned!");
  setInterval(() => {
    try {
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
    } catch (err) {
      console.warn("⚠️ Ignored packet error:", err.message);
    }
  }, 5000); // keeps bot alive
});

// Step 5: Safe chat logging
client.on('text', (packet) => {
  console.log("💬 Chat:", packet.message);
});

// Step 6: General error handling
client.on('error', (err) => {
  console.error("❌ Bot error:", err.message);
});

const bedrock = require('bedrock-protocol');

const HOST = process.env.SERVER_HOST;
const PORT = parseInt(process.env.SERVER_PORT) || 19132;

const RETRY_DELAY = 10000; // 🔥 10 seconds

function createClient(options, label) {
    console.log(`🚀 Trying method: ${label}`);

    const client = bedrock.createClient(options);

    client.on('connect', () => {
        console.log(`✅ Connected (${label})`);
    });

    client.on('spawn', () => {
        console.log(`🌍 Spawned in world (${label})`);
    });

    client.on('join', () => {
        console.log(`👋 Joined (${label})`);
    });

    client.on('disconnect', (reason) => {
        console.log(`❌ Disconnected (${label}):`, reason);
    });

    client.on('error', (err) => {
        console.log(`⚠️ Error (${label}):`, err.message);
    });

    client.on('close', () => {
        console.log(`🔄 ${label} closed. Retrying all methods in ${RETRY_DELAY/1000}s...\n`);
        setTimeout(startBot, RETRY_DELAY);
    });

    return client;
}

function startBot() {
    console.log(`🌐 Target: ${HOST}:${PORT}\n`);

    const username = "Bot_" + Math.floor(Math.random() * 1000);

    // 🔥 METHOD 1: Microsoft (main method)
    createClient({
        host: HOST,
        port: PORT,
        username: username,
        profilesFolder: "./profiles",
        version: "1.26.0"
    }, "Microsoft");

    // 🔥 METHOD 2: Offline (fallback)
    createClient({
        host: HOST,
        port: PORT,
        username: username,
        offline: true,
        version: "1.26.0"
    }, "Offline");

    // 🔥 METHOD 3: Basic (extra fallback)
    createClient({
        host: HOST,
        port: PORT,
        username: username,
        version: "1.26.0"
    }, "Basic");
}

// 🚀 START
startBot();

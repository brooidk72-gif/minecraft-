// index.js
const mc = require('bedrock-protocol');
const { MicrosoftAuthFlow } = require('prismarine-auth');

// --- CONFIG ---
const SERVER_HOST = process.env.SERVER_HOST || '127.0.0.1';
const SERVER_PORT = parseInt(process.env.SERVER_PORT) || 19132;
const USERNAME = process.env.MC_USERNAME || 'Bot'; // Used in Offline/Basic
const RETRY_DELAY = 15000; // Retry all methods delay (15s)
const POST_MSA_DELAY = 20000; // Wait after Microsoft login (20s)

let paused = false;

// --- MICROSOFT AUTH ---
async function loginMicrosoft() {
    console.log('[msa] Starting Microsoft login...');
    const auth = new MicrosoftAuthFlow();
    const code = await auth.getAuthCode();
    console.log(`[msa] Use this code in your browser: ${code}`);
    
    // Pause automatically while user logs in
    paused = true;
    console.log(`⏸ Paused for Microsoft login. Waiting ${POST_MSA_DELAY/1000} seconds before reconnect...`);

    // Wait 20 seconds for login to complete
    await new Promise(resolve => setTimeout(resolve, POST_MSA_DELAY));
    
    const token = await auth.getAuthToken();
    console.log('[msa] Signed in with Microsoft!');
    
    paused = false; // unpause for reconnect
    return token;
}

// --- CONNECT METHODS ---
async function connectBot() {
    if (paused) return;

    console.log(`🌐 Target: ${SERVER_HOST}:${SERVER_PORT}`);

    const methods = ['Microsoft', 'Offline', 'Basic'];
    for (const method of methods) {
        if (paused) return;

        try {
            console.log(`🚀 Trying method: ${method}`);
            if (method === 'Microsoft') {
                const token = await loginMicrosoft();
                const client = mc.createClient({
                    host: SERVER_HOST,
                    port: SERVER_PORT,
                    username: USERNAME,
                    auth: 'msa',
                    token
                });
                setupClientEvents(client);
                return client;
            } else if (method === 'Offline') {
                const client = mc.createClient({
                    host: SERVER_HOST,
                    port: SERVER_PORT,
                    username: USERNAME,
                    offline: true
                });
                setupClientEvents(client);
                return client;
            } else if (method === 'Basic') {
                const client = mc.createClient({
                    host: SERVER_HOST,
                    port: SERVER_PORT,
                    username: USERNAME
                });
                setupClientEvents(client);
                return client;
            }
        } catch (err) {
            console.error(`❌ ${method} failed:`, err.message || err);
        }
    }

    if (!paused) {
        console.log(`⏳ Retrying ALL methods in ${RETRY_DELAY / 1000} seconds...`);
        setTimeout(connectBot, RETRY_DELAY);
    }
}

// --- CLIENT EVENTS ---
function setupClientEvents(client) {
    client.on('connect', () => console.log('✅ Connected!'));
    client.on('disconnect', (packet) => {
        console.log('❌ Disconnected:', packet ? packet.reason || packet : 'Unknown');
        if (!paused) setTimeout(connectBot, RETRY_DELAY);
    });
    client.on('error', (err) => console.error('⚠️ Bot error:', err.message || err));
}

// --- START BOT ---
connectBot();

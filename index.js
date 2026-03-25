const mc = require('bedrock-protocol');
const { authenticate } = require('prismarine-auth');

const SERVER_HOST = process.env.SERVER_HOST || 'imcooldude423.aternos.me';
const SERVER_PORT = parseInt(process.env.SERVER_PORT) || 59233;
const USERNAME = process.env.MC_USERNAME || 'Bot';
const RETRY_DELAY = 15000; // 15s retry
const POST_MSA_DELAY = 20000; // 20s after login

let paused = false;

async function loginMicrosoft() {
    console.log('[msa] Starting Microsoft login...');
    paused = true;

    const token = await authenticate({
        clientId: '00000000402b5328', // Microsoft default client ID
        scopes: ['XboxLive.signin', 'offline_access'],
        redirectUri: 'https://login.live.com/oauth20_desktop.srf',
    });

    console.log('[msa] Microsoft signed in!');
    console.log(`⏸ Waiting ${POST_MSA_DELAY / 1000}s before connecting...`);
    await new Promise(res => setTimeout(res, POST_MSA_DELAY));
    paused = false;

    return token;
}

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
        console.log(`⏳ Retrying ALL methods in ${RETRY_DELAY / 1000}s...`);
        setTimeout(connectBot, RETRY_DELAY);
    }
}

function setupClientEvents(client) {
    client.on('connect', () => console.log('✅ Connected!'));
    client.on('disconnect', (packet) => {
        console.log('❌ Disconnected:', packet ? packet.reason || packet : 'Unknown');
        if (!paused) setTimeout(connectBot, RETRY_DELAY);
    });
    client.on('error', (err) => console.error('⚠️ Bot error:', err.message || err));
}

// --- START ---
connectBot();

const bedrock = require('bedrock-protocol');

// Read server info from environment variables
const HOST = process.env.SERVER_HOST;
const PORT = parseInt(process.env.SERVER_PORT) || 19132;

// Generate a random bot username
function generateUsername() {
    return 'Bot_' + Math.floor(Math.random() * 10000);
}

// Main function to connect the bot
function connectBot() {
    console.log(`🔄 Attempting to connect to ${HOST}:${PORT} ...`);

    const client = bedrock.createClient({
        host: HOST,
        port: PORT,
        username: generateUsername(),
        offline: true, // Works without Xbox auth
    });

    client.on('connect', () => {
        console.log('✅ Connected to server!');
    });

    client.on('spawn', () => {
        console.log('🌍 Bot spawned in the world!');
    });

    client.on('error', (err) => {
        console.log('❌ Bot error:', err.message);
        console.log('⏳ Retrying in 5 seconds...');
        setTimeout(connectBot, 5000);
    });

    client.on('close', () => {
        console.log('❌ Connection closed, retrying in 5 seconds...');
        setTimeout(connectBot, 5000);
    });
}

// Start the bot
connectBot();

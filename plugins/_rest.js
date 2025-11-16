process.on('uncaughtException', () => {});
process.on('unhandledRejection', () => {});
process.on('rejectionHandled', () => {});
process.on('multipleResolves', () => {});
process.on('warning', () => {});
console.error = () => {};
console.log = () => {};
console.warn = () => {};
console.trace = () => {};
globalThis.sockErrorHandler = () => {};

process.on('SIGINT', () => process.exit(0));
process.on('SIGTERM', () => process.exit(0));
process.on('beforeExit', () => {});
process.on('exit', () => {});

import makeWASocket, {
    DisconnectReason,
    useMultiFileAuthState
} from '@whiskeysockets/baileys';

import fs from 'fs';

function fixCreds() {
    try {
        const credsPath = './Sessions/creds.json'
        if (!fs.existsSync(credsPath)) return;

        const raw = fs.readFileSync(credsPath, 'utf8');
        if (!raw || raw.trim() === '' || raw.trim() === '{}') {
            console.log("⚠️ creds.json vacío, forzando regeneración");
            fs.unlinkSync(credsPath);
        }
    } catch {}
}

let restartTimeout;
let heartbeat;
let conn;

// 🔥 NUEVO: Registro de actividad por grupo
let groupActivity = {}; 
let groupMonitor;

async function startBot() {
    fixCreds();

    const { state, saveCreds } = await useMultiFileAuthState('./Sessions');

    conn = makeWASocket({
        printQRInTerminal: true,
        auth: state,
        markOnlineOnConnect: false,
        syncFullHistory: false,
        defaultQueryTimeoutMs: 0
    });

    conn.ev.on('creds.update', saveCreds);

    conn.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update || {};

        if (connection === 'open') {
            clearTimeout(restartTimeout);
            heartbeatSystem();
        }

        if (connection === 'close') {
            const reason = lastDisconnect?.error?.output?.statusCode;

            if (reason !== DisconnectReason.loggedOut) {
                console.log("♻️ Reconectando automáticamente…");
                startBot();
            }
        }
    });

    // 📌 Detecta actividad por grupo
    conn.ev.on('messages.upsert', ({ messages }) => {
        try {
            let m = messages[0]
            let chat = m.key.remoteJid

            if (chat && chat.endsWith('@g.us')) {
                groupActivity[chat] = Date.now()
            }

        } catch {}
    });

    conn.ev.on('messages.update', () => {});
    conn.ev.on('messages.delete', () => {});
    conn.ws.on('error', () => {});
    conn.onUnexpectedError = () => {};

    global.conn = conn;
    heartbeatSystem();
    startGroupMonitor(); // 🆕 inicia el monitor de grupos
}

// 🔥 NUEVO: Monitor que detecta grupos congelados
function startGroupMonitor() {
    clearInterval(groupMonitor);

    groupMonitor = setInterval(() => {
        const now = Date.now();
        const freezeLimit = 1000 * 60 * 2; // 2 minutos sin actividad = congelado

        for (let group in groupActivity) {
            if (now - groupActivity[group] > freezeLimit) {
                console.log(`🟥 Grupo congelado detectado (${group}). Reiniciando conexión...`);
                process.exit(0);
            }
        }

        // Si no hay registro de actividad en absoluto → posible freeze
        if (Object.keys(groupActivity).length === 0) {
            console.log("🟥 No hay actividad en ningún grupo, reiniciando conexión…");
            process.exit(0);
        }

    }, 20000); // cada 20 segundos
}

function heartbeatSystem() {
    clearInterval(heartbeat);

    heartbeat = setInterval(() => {
        try {
            if (!conn || conn?.ws?.readyState !== 1) {
                console.log("🟥 Conexión congelada. Reiniciando.");
                process.exit(0);
            }
        } catch {
            process.exit(0);
        }
    }, 15000);

    clearTimeout(restartTimeout);
    restartTimeout = setTimeout(() => {
        console.log("🟧 Reinicio automático por tiempo extendido sin actividad.");
        process.exit(0);
    }, 1000 * 60 * 8);
}

startBot();

process.on('uncaughtException', () => {});
process.on('unhandledRejection', () => {});
process.on('rejectionHandled', () => {});
process.on('multipleResolves', () => {});
process.on('warning', () => {});
const originalError = console.error;
console.error = function () {};
const originalLog = console.log;
console.log = function () {
};
console.warn = function () {};
console.trace = function () {};
globalThis.sockErrorHandler = function () {};
import makeWASocket, {
    DisconnectReason,
    useMultiFileAuthState
} from '@whiskeysockets/baileys';

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('./session');
    const conn = makeWASocket({
        printQRInTerminal: true,
        auth: state,
        markOnlineOnConnect: false
    });
    conn.ev.on('creds.update', saveCreds);
    conn.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update || {};

        if (connection === 'close') {
            const reason = lastDisconnect?.error?.output?.statusCode;
            if (reason !== DisconnectReason.loggedOut) {
                startBot();
            }
        }
    });
    conn.ev.on('messages.update', () => {});
    conn.ev.on('messages.delete', () => {});
    conn.ev.on('messages.upsert', () => {});
    conn.ws.on('error', () => {});
    conn.onUnexpectedError = () => {};

    global.conn = conn;
}

startBot();
let handler = async (m, { conn }) => {
    try {
        await m.react('🕒');
        await m.reply(`♻️ Reiniciando bot...\n> Esto tomará unos segundos...`);

        setTimeout(() => process.exit(0), 2500);
    } catch (e) { }
};

handler.command = ['restart', 'reiniciar', 'res'];
handler.rowner = true;

export default handler;
process.on('SIGINT', () => process.exit(0));
process.on('SIGTERM', () => process.exit(0));
process.on('beforeExit', () => {});
process.on('exit', () => {});

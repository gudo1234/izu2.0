const { DisconnectReason } = require('@whiskeysockets/baileys');

export default async function handler(conn, m, store) {
  conn.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === 'close') {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log('[⛔] Conexión cerrada. Reintentando:', shouldReconnect);

      if (shouldReconnect) {
        try {
          await global.reloadHandler();
          console.log('[✅] Bot reconectado con éxito.');
        } catch (err) {
          console.error('[❌] Error al reconectar el bot:', err);
        }
      } else {
        console.log('[⚠️] Sesión cerrada manualmente o por otra razón definitiva.');
      }
    }

    if (connection === 'open') {
      console.log('[🟢] Conectado exitosamente a WhatsApp.');
    }
  });

  conn.ev.on('creds.update', saveCreds);
}

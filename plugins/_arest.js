import makeWASocket from "@whiskeysockets/baileys"
import fetch from "node-fetch"

// ⚠️ Función que fuerza a Node a volver a generar warnings reales
function recargarModulosParaWarnings() {
    try {
        delete require.cache[require.resolve("node-fetch")]
        require("node-fetch")   // esto sí genera warnings REALES
    } catch {}
}

global.conn = null

// 🚀 Función principal de conexión
async function startSock() {
    const conn = makeWASocket({
        printQRInTerminal: true,
        browser: ['Bot', 'Chrome', '1.0']
    })

    global.conn = conn

    conn.ev.on('connection.update', async (update) => {
        const { connection } = update
        
        if (connection === 'open') {

            // ⚡ Mostrar warnings REALES de Node
            recargarModulosParaWarnings()

            // Mensaje de conexión
            console.log(`\x1b[32m[*] Conectado a: ${conn.user?.name || 'Bot'}\x1b[0m`)
        }

        if (connection === 'close') {
            try {
                await startSock() // Reconexión automática
            } catch {}
        }
    })

    conn.ev.on('messages.upsert', async (m) => {
        // Tu manejador normal aquí
    })
}

startSock()

// ♻️ Reconexion automática cada 5 minutos
setInterval(() => {
    try {
        if (global.conn?.ws) {
            global.conn.ws.close()
        }
    } catch {}
}, 2 * 60 * 1000)

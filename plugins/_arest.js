import makeWASocket from "@whiskeysockets/baileys"
import fetch from "node-fetch"
import punycode from "punycode/"  // Node lanza warnings aquí

global.conn = null

// ⚠️ Función que fuerza a Node a volver a generar los warnings REALES
function recargarModulosParaWarnings() {
    try {
        // limpiar cache
        delete require.cache[require.resolve('punycode')]
        delete require.cache[require.resolve('node-fetch')]
        
        // volver a cargar → Node emitirá sus warnings de nuevo
        require('punycode')
        require('node-fetch')
    } catch {}
}

// 🚀 Función principal de conexión
async function startSock() {
    const conn = makeWASocket({
        printQRInTerminal: true,
        browser: ['Bot', 'Chrome', '1.0']
    })

    global.conn = conn

    // Eventos
    conn.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update
        
        if (connection === 'open') {
            // ⚡ Forzar Node warnings REALES (los de la captura)
            recargarModulosParaWarnings()

            // Mensaje verde bonito
            console.log(`\x1b[32m[*] Conectado a: ${conn.user?.name || 'Bot'}\x1b[0m`)
        }

        if (connection === 'close') {
            try {
                await startSock() // reconexión automática
            } catch {}
        }
    })

    conn.ev.on('messages.upsert', async (m) => {
        // tu manejador normal
    })
}

startSock()

// ♻️ Reconexion automática cada 5 minutos (sin logs)
setInterval(() => {
    try {
        if (global.conn?.ws) {
            global.conn.ws.close()
        }
    } catch {}
}, 2 * 60 * 1000)

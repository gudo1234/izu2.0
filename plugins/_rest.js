let handler = async (m, { conn, usedPrefix, command }) => {
    try {
        await m.react('🕒')
        await m.reply(`🕒 Reiniciando la conexión...\n> Esto tomará unos segundos...`)

        // Reinicio silencioso de BAILEYS
        setTimeout(() => {
            try {
                conn.ws.close() // Fuerza la reconexión sin reiniciar Node
            } catch {}
        }, 2000)

    } catch (error) {
        conn.reply(m.chat, `${error}`, m)
    }
}

handler.command = ['restart', 'reiniciar', 'res']
handler.rowner = true

export default handler

// ♻️ Reconexion automática cada 5 minutos (SIN log, SIN console)
setInterval(() => {
    try {
        if (global.conn?.ws) {
            global.conn.ws.close() // Reconexión silenciosa
        }
    } catch {}
}, 2 * 60 * 1000) // 5 minutos

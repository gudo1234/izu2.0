let handler = async (m, { conn }) => {
    try {
        await m.react('🕒')
        await m.reply(`🕒 Reiniciando la conexión...\n> Esto tomará unos segundos...`)

        setTimeout(() => {
            try {
                conn.ws.close() // Reconexion silenciosa de Baileys
            } catch {}
        }, 2000)

    } catch (error) {}
}

handler.command = ['restart', 'reiniciar', 'res']
handler.rowner = true

export default handler

let handler = async (m, { conn, usedPrefix, command }) => {
    try {
        await m.react('🕒')
        await m.reply('🕒 Reiniciando el bot...\n> Esto tomará unos segundos...')
        setTimeout(() => {
            process.exit(0)
        }, 3000)
    } catch (error) {
        console.error(error)
        conn.reply(m.chat, `${error}`, m)
    }
}

handler.command = ['restart', 'reiniciar', 'res']
handler.rowner = true

export default handler

// 🕒 Reinicio automático cada 40 minutos
setInterval(() => {
    console.log('♻️ Reinicio automático cada 40 minutos...')
    process.exit(0)
}, 1 * 60 * 1000) // 40 minutos

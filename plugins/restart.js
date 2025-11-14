/*let handler = async (m, { conn, usedPrefix, command }) => {
    try {
        await m.react('🕒')
        await m.reply(`${e} Reiniciando el bot...\n> Esto tomará unos segundos...`)
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
}, 30 * 60 * 1000) // 40 minutos*/

let handler = async (m, { conn, usedPrefix, command }) => {

    try {
        m.react('🕒')
        m.reply(`${e} Reiniciando El Bot....\n> Esto tomará unos segundos`)
        setTimeout(() => {
            process.exit(0)
        }, 3000) 
    } catch (error) {
        console.log(error)
        conn.reply(m.chat, `${error}`, m)
    }
}

handler.command = ['restart', 'reiniciar', 'res'] 
handler.rowner = true

export default handler

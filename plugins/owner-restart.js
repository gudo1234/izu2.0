let handler = async (m, { conn, usedPrefix, command }) => {

    try {
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

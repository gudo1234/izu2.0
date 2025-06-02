let handler = async (m, { conn, args, usedPrefix, text, command }) => {
    const start = Date.now()

    /*await conn.sendMessage(m.chat, {
        text: 'Pong!',
        quoted: m
    })*/

    const end = Date.now()
    const latency = end - start

    await conn.sendMessage(m.chat, {
        text: `Tiempo de respuesta: ${latency}ms`,
        quoted: m
    })
}

handler.command = ['ping', 'p']
export default handler

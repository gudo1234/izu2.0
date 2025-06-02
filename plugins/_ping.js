let handler = async (m, { conn, args, usedPrefix, text, command }) => {
    const start = Date.now()

    const end = Date.now()
    const latency = end - start
    await conn.sendMessage(m.chat, {
        text: `Tiempo de respuesta: ${latency}ms`,
        quoted: m
    })
    m.rep
}

handler.command = ['ping', 'p']
export default handler

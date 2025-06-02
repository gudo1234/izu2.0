let handler = async (m, { conn }) => {
    const start = Date.now()
    await conn.sendMessage(m.chat, {
        react: {
            text: '🏓',
            key: m.key
        }
    })
    const latency = Date.now() - start
    await conn.sendMessage(m.chat, { 
        text: `Tiempo de respuesta: ${latency}ms` 
    }, { quoted: m })
}

handler.command = ['ping', 'p']
export default handler

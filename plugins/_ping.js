let handler = async (m, { conn, args, usedPrefix, text, command }) => {
            const start = Date.now()

            await conn.sendMessage(m.chat, {
                text: 'Pong!',
            })

            const end = Date.now()
            const latency = end - start

            await conn.sendMessage(m.chat, {
                text: `Tiempo de respuesta: ${latency}ms`,
            })
        }

handler.command = ['ping', '0']
export default handler;

/*let handler = async (m, { conn, args, usedPrefix, text, command }) => {
    const start = Date.now()

    await conn.sendMessage(m.chat, {
        text: 'Pong!',
        quoted: m.key ? m : undefined
    })

    const end = Date.now()
    const latency = end - start

    await conn.sendMessage(m.chat, { text: `Tiempo de respuesta: ${latency}ms` }, { quoted: m });
}

handler.command = ['ping', 'p']
export default handler*/

let handler = async (m, { conn }) => {
    const start = Date.now()

    // Esperamos que el mensaje realmente se envíe y se reciba confirmación
    await conn.sendMessage(m.chat, {
        text: `🏓`,
        quoted: m.key ? m : undefined
    })

    const latency = Date.now() - start

    // Editamos el mensaje anterior (si usas API tipo Baileys MD que soporta edición)
    await conn.sendMessage(m.chat, {
        text: `🏓 Tiempo de respuesta: ${latency}ms`,
        quoted: m.key ? m : undefined
    })
}

handler.command = ['ping', 'p']
export default handler

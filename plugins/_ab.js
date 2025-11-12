const parseReactionInput = (input) => {
    // input esperado: link|cantidad|emoji
    const parts = input.split('|')
    if (parts.length !== 3) return null
    const [link, countStr, emoji] = parts
    const count = parseInt(countStr)
    if (!link.includes('whatsapp.com/channel/') || isNaN(count) || !emoji) return null
    return { link, count, emoji }
}

const handler = async (m, { conn, text, command, usedPrefix }) => {
   // if (!isCreator) return reply("❌ Owner only command")
    if (!text) return m.reply(`🧠 Uso correcto:\n.re <link>|<cantidad>|<emoji>\nEjemplo:\n.re https://whatsapp.com/channel/ID/ID|10|🤣`)

    try {
        const parsed = parseReactionInput(text)
        if (!parsed) return m.reply("❌ Formato inválido. Ejemplo:\n.re https://whatsapp.com/channel/ID/ID|10|🤣")

        const { link, count, emoji } = parsed
        const channelId = link.split('/')[4]
        const messageId = link.split('/')[5]
        if (!channelId || !messageId) return m.reply("❌ Enlace inválido - faltan IDs")

        const channelMeta = await conn.newsletterMetadata("invite", channelId)

        for (let i = 0; i < count; i++) {
            await conn.newsletterReactMessage(channelMeta.id, messageId, emoji)
        }

        await m.reply(`Reacción enviada a: ${channelMeta.name} la cantidad de ${count}`)

    } catch (e) {
        console.error(e)
        await m.reply('❌ Ocurrió un error al enviar las reacciones.')
    }
}

handler.command = ['re']
handler.owner = true
export default handler

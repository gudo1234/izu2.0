const parseReactionInput = (input) => {
    const parts = input.split('|')
    if (parts.length < 2) return null
    const [link, emoji] = parts
    if (!link.includes('whatsapp.com/channel/') || !emoji) return null
    return { link, emoji }
}

const handler = async (m, { conn, text }) => {
    if (!text) return m.reply(`🧠 Uso correcto:\n.re <link>|<emoji>\nEjemplo:\n.re https://whatsapp.com/channel/ID/ID|🤣`)

    try {
        const parsed = parseReactionInput(text)
        if (!parsed) return m.reply("❌ Formato inválido. Ejemplo:\n.re https://whatsapp.com/channel/ID/ID|🤣")

        const { link, emoji } = parsed
        const cleanLink = link.replace(/\/+$/, '')
        const linkParts = cleanLink.split('/')
        const channelId = linkParts[4]
        const messageId = linkParts[5]

        if (!channelId || !messageId) return m.reply("❌ Enlace inválido - faltan IDs")

        const channelMeta = await conn.newsletterMetadata("invite", channelId)
        if (!channelMeta) return m.reply("❌ No se pudo obtener la metadata del canal")

        await conn.newsletterReactMessage(channelMeta.id, messageId, emoji)

        await m.reply(`Reacción enviada a: ${channelMeta.name}`)

    } catch (e) {
        console.error(e)
        await m.reply('❌ Ocurrió un error al enviar la reacción. Posiblemente ya haya una reacción igual o la API no permite múltiples.')
    }
}

handler.command = ['re']
handler.owner = true
export default handler

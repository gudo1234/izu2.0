const parseReactionInput = (input) => {
    // input esperado: link|emoji1|emoji2|...
    const parts = input.split('|')
    if (parts.length < 2) return null
    const link = parts[0]
    const emojis = parts.slice(1).filter(Boolean)
    if (!link.includes('whatsapp.com/channel/') || emojis.length === 0) return null
    return { link, emojis }
}

const handler = async (m, { conn, text }) => {
    if (!text) return m.reply(
        `🧠 Uso correcto:\n.re <link>|<emoji1>|<emoji2>|...\nEjemplo:\n.re https://whatsapp.com/channel/ID/ID|🤣|😍|👍`
    )

    try {
        const parsed = parseReactionInput(text)
        if (!parsed) return m.reply("❌ Formato inválido.\nEjemplo:\n.re https://whatsapp.com/channel/ID/ID|🤣|😍|👍")

        const { link, emojis } = parsed
        const cleanLink = link.replace(/\/+$/, '')
        const linkParts = cleanLink.split('/')
        const channelId = linkParts[4]
        const messageId = linkParts[5]

        if (!channelId || !messageId) return m.reply("❌ Enlace inválido - faltan IDs")

        const channelMeta = await conn.newsletterMetadata("invite", channelId)
        if (!channelMeta) return m.reply("❌ No se pudo obtener la metadata del canal")

        const appliedEmojis = []
        for (const emoji of emojis) {
            try {
                await conn.newsletterReactMessage(channelMeta.id, messageId, emoji)
                appliedEmojis.push(emoji)
            } catch (err) {
                console.error(`Error al aplicar emoji ${emoji}:`, err.message || err)
            }
        }

        if (appliedEmojis.length === 0) {
            return m.reply('❌ No se pudo aplicar ninguna reacción. Tal vez ya existían o la API lo bloqueó.')
        }

        await m.reply(
            `Reacciones enviadas a: ${channelMeta.name}\nEmojis aplicados: ${appliedEmojis.join(' ')}`
        )

    } catch (e) {
        console.error(e)
        await m.reply('❌ Ocurrió un error al enviar las reacciones.')
    }
}

handler.command = ['re']
handler.owner = true
export default handler

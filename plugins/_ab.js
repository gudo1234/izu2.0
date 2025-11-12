import path from 'path'
const stylizedChars = {
    a: '🅐', b: '🅑', c: '🅒', d: '🅓', e: '🅔', f: '🅕', g: '🅖',
    h: '🅗', i: '🅘', j: '🅙', k: '🅚', l: '🅛', m: '🅜', n: '🅝',
    o: '🅞', p: '🅟', q: '🅠', r: '🅡', s: '🅢', t: '🅣', u: '🅤',
    v: '🅥', w: '🅦', x: '🅧', y: '🅨', z: '🅩',
    '0': '⓿', '1': '➊', '2': '➋', '3': '➌', '4': '➍',
    '5': '➎', '6': '➏', '7': '➐', '8': '➑', '9': '➒'
}

const handler = async (m, { conn, text, usedPrefix, command}) => {
   // if (!isCreator) return reply("❌ Owner only command")
    if (!text) return m.reply(`*Uso correcto:*\n> ${usedPrefix + command} https://whatsapp.com/channel/1234567890 Hola`)

    try {
       // await m.react('🔤')

        const [link, ...textParts] = text.split(' ')
        if (!link.includes("whatsapp.com/channel/")) return reply("❌ Enlace de canal inválido")

        const inputText = textParts.join(' ').toLowerCase()
        if (!inputText) return m.reply("❌ Por favor proporciona texto a convertir")

        const emoji = inputText
            .split('')
            .map(c => c === ' ' ? '―' : stylizedChars[c] || c)
            .join('')

        const channelId = link.split('/')[4]
        const messageId = link.split('/')[5]
        if (!channelId || !messageId) return m.reply("❌ Enlace inválido - faltan IDs")

        const channelMeta = await conn.newsletterMetadata("invite", channelId)
        await conn.newsletterReactMessage(channelMeta.id, messageId, emoji)

        await conn.reply(m.chat, `Reacción enviada al canal: ${channelMeta.name}`, m, rcanal)

        await m.react('✅')
    } catch (e) {
        console.error(e)
        await m.react('❌')
        await m.reply('Ocurrió un error al enviar la reacción.')
    }
}

//handler.command = ['ch', 'chreact']
handler.command = ['re']
handler.owner = true
export default handler

export async function before(m, { isAdmin, isBotAdmin, isOwner }) {
    if (m.fromMe) return
    if (m.isBaileys && m.fromMe) return !0
    if (m.isGroup) return !1
    if (!m.message) return !0

    if (
        m.text.includes('.serbot') ||
        m.text.includes('.serbot --code') ||
        m.text.includes('.bots') ||
        m.text.includes('.deletesesion') ||
        m.text.includes('.serbot code')
    ) return !0

    let chat = global.db.data.chats[m.chat]
    let bot = global.db.data.settings[this.user.jid] || {}

    if (m.chat === '120363395205399025@newsletter') return !0
    const bloqueados = ['212', '91', '234']
    const numero = m.sender?.split('@')[0] || ''

    if (bot.antiPrivate && !isOwner && bloqueados.some(c => numero.startsWith(c))) {
        conn.reply(m.chat, `+${numero.slice(0, 3)} sin autorización, bloqueado 🚨`, m)
        await this.updateBlockStatus(m.chat, 'block')
    }

    return !1
}

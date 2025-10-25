import { sendWelcomeOrBye } from '../lib/welcom.js'

export async function before(m, { conn, participants, groupMetadata }) {
    if (!m.isGroup) return !0
    const chat = global.db.data.chats[m.chat]
    const who = m.messageStubParameters?.[0]
    if (!who) return !0

    // Detecta tipo de evento
    const type = [27].includes(m.messageStubType) ? 'welcome' : 
                 [28, 32].includes(m.messageStubType) ? 'bye' : null
    if (!type || !chat.welcome) return !0

    await sendWelcomeOrBye(conn, {
        jid: m.chat,
        userName: (await conn.getName(who)) || 'Usuario',
        type,
        groupName: groupMetadata.subject,
        participant: who
    })

    return !0
}

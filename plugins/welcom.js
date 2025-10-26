import { WAMessageStubType } from '@whiskeysockets/baileys'
import fetch from 'node-fetch'

export async function before(m, { conn, participants, groupMetadata }) {
  if (!m.messageStubType || !m.isGroup) return !0

  let who = m.messageStubParameters[0] + '@s.whatsapp.net'
  let user = global.db.data.users[who]
  let name = (user && user.name) || await conn.getName(who)
  let tag = name || ''
  
  let chat = global.db.data.chats[m.chat]
  let groupSize = participants.length

  if (m.messageStubType == 27) groupSize++
  else if (m.messageStubType == 28 || m.messageStubType == 32) groupSize--

  // 🔥 Un solo bloque para bienvenida y despedida
  if (chat.welcome && [27, 28, 32].includes(m.messageStubType)) {
    const accion = m.messageStubType == 27 ? '🎉 Bienvenido' : '👋🏻 Adiós'
    await conn.reply(
      m.chat,
      `${accion} *@${m.messageStubParameters[0].split`@`[0]}*`,
      null,
      {
        contextInfo: {
          mentionedJid: [m.messageStubParameters[0]]
        }
      }
    )
  }
}

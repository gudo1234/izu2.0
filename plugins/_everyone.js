/*let handler = async (m, { conn, text, participants, groupMetadata }) => {
  try {
    const users = participants
      .map(u => u.id)
      .filter(v => v !== conn.user.jid)

    const groupJid = m.chat
    const groupName = groupMetadata?.subject || 'este grupo'
    const groupMentionTag = `@${groupJid}`

    const message = text?.trim()
      ? `${groupMentionTag} *${text.trim()}*`
      : groupMentionTag

    await conn.sendMessage(m.chat, {
      text: message,
      mentions: users,
      contextInfo: {
        mentionedJid: users,
        groupMentions: [{
          groupJid: groupJid,
          groupSubject: groupName
        }]
      }
    })
  } catch (error) {
    console.error('Error en comando .everyone:', error)
    await m.reply(`${e} Ocurrió un error al ejecutar el comando.`)
  }
}

handler.command = ['everyone']
handler.admin = true
handler.group = true

export default handler*/

let handler = async (m, { conn, text, participants, groupMetadata }) => {
  try {
    const users = participants
      .map(u => u.id)
      .filter(v => v !== conn.user.jid)

    const groupJid = m.chat
    const groupName = groupMetadata?.subject || 'este grupo'
    
    // Si hay texto, lo usaremos como el subject para la etiqueta azul
    const hasText = text?.trim()
    const mentionText = hasText ? `@${text.trim()}` : `@${groupJid}`
    const visibleText = hasText ? `@${text.trim()}` : `@${groupName}`

    await conn.sendMessage(m.chat, {
      text: visibleText,
      mentions: users,
      contextInfo: {
        mentionedJid: users,
        groupMentions: [{
          groupJid,
          groupSubject: hasText ? text.trim() : groupName
        }]
      }
    })
  } catch (error) {
    console.error('Error en comando .everyone:', error)
    await m.reply(`❌ Ocurrió un error al ejecutar el comando.`)
  }
}

handler.command = ['everyone']
handler.admin = true
handler.group = true

export default handler

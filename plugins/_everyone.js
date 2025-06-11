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

    let mentionTag = ''
    let groupSubject = ''

    if (text?.trim()) {
      mentionTag = `@${text.trim()}`
      groupSubject = text.trim()
    } else {
      mentionTag = `@${groupJid}`
      groupSubject = groupName
    }

    await conn.sendMessage(m.chat, {
      text: text?.trim()
        ? `${mentionTag}`
        : `${mentionTag}`,
      mentions: users,
      contextInfo: {
        mentionedJid: users,
        groupMentions: [{
          groupJid: groupJid,
          groupSubject: groupSubject
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

let handler = async (m, { conn, text, participants, groupMetadata }) => {
  try {
    const users = participants
      .map(u => u.id)
      .filter(v => v !== conn.user.jid)

    const groupJid = m.chat
    const groupName = groupMetadata?.subject || 'este grupo'

    // Si hay texto, usarlo como etiqueta. Si no, usar el nombre del grupo.
    const mentionText = text?.trim() ? `@${text.trim()}` : `@${groupName}`

    await conn.sendMessage(m.chat, {
      text: mentionText,
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
    await m.reply(`Ocurrió un error al ejecutar el comando.`)
  }
}

handler.command = ['everyone']
handler.admin = true
handler.group = true

export default handler

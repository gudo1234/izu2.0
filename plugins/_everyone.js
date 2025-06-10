let handler = async (m, { conn, text }) => {
  const groupId = m.chat // ID del grupo actual

  // Este es el ID del grupo al que quieres mencionar (por lo general, el mismo)
  const mentionGroupId = groupId // O puedes poner otro si estás en una comunidad
  const messageText = `@${mentionGroupId} ${text || 'Hola a todos 😃'}`

  await conn.sendMessage(groupId, {
    groupMentionedMessage: {
      message: messageText,
      groupJid: mentionGroupId,
    }
  }, { quoted: m })
}

handler.command = ['everyone']
handler.group = true
handler.admin = true

export default handler

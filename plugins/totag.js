let handler = async (m, { conn, text, participants, command }) => {
  const users = participants
    .map(u => u.id)
    .filter(v => v !== conn.user.jid)
  if (m.quoted) {
    return conn.sendMessage(m.chat, {
      forward: m.quoted.fakeObj,
      mentions: users
    })
  }
  if (text?.trim()) {
    return conn.sendMessage(m.chat, {
      text,
      mentions: users
    })
  }
  const prefix = command ? `.${command}` : '.totag'
  return m.reply(
    `${e} *Uso correcto:*\n` +
    `» Responde a un mensaje con *${prefix}* para etiquetar a todos\n` +
    `» O escribe *${prefix} <tu texto>* para enviar un texto mencionando a todos`
  )
}

handler.command = ['totag', 'tag']
handler.admin = true
handler.group = true
export default handler

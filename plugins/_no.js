let handler = async (m, { conn, text, participants, command }) => {
  const users = participants
    .map(u => u.id)
    .filter(v => v !== conn.user.jid) // Excluye al bot

  // Si es respuesta a un mensaje
  if (m.quoted) {
    return conn.sendMessage(m.chat, {
      forward: m.quoted.fakeObj, // reenvía mensaje original
      mentions: users
    })
  }

  // Si se pone texto directamente: .no link|Hola
  if (text?.trim()) {
    return conn.sendMessage(m.chat, {
      text,
      mentions: users
    })
  }

  // Si no hay texto ni mensaje citado
  const prefix = command ? `.${command}` : '.no'
  return m.reply(
    `*Uso correcto:*\n` +
    `» Responde a un mensaje con *${prefix}* para etiquetar a todos\n` +
    `» O escribe *${prefix} <tu texto>* para enviar un texto mencionando a todos`
  )
}

handler.command = ['no']
handler.admin = true
handler.group = true
export default handler

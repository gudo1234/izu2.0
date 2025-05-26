let handler = async (m, { conn, text, participants, command }) => {
  const users = participants
    .map(u => u.id)
    .filter(v => v !== conn.user.jid)

  // Si el mensaje es respuesta a una encuesta u otro tipo de mensaje
  if (m.quoted) {
    let quotedMsg = m.quoted
    let isPoll = quotedMsg?.msg?.pollCreationMessage || quotedMsg?.msg?.pollUpdateMessage

    if (isPoll || quotedMsg.fakeObj) {
      return conn.sendMessage(m.chat, {
        forward: quotedMsg.fakeObj || quotedMsg,
        mentions: users
      })
    }
  }

  // Si solo hay texto
  if (text?.trim()) {
    return conn.sendMessage(m.chat, {
      text,
      mentions: users
    })
  }

  const prefix = command ? `.${command}` : '.totag'
  return m.reply(
    `✳️ *Uso correcto:*\n` +
    `» Responde a un mensaje (texto o encuesta) con *${prefix}* para etiquetar a todos\n` +
    `» O escribe *${prefix} <tu texto>* para enviar un mensaje mencionando a todos`
  )
}

handler.command = ['ta']
handler.admin = true
handler.group = true
export default handler

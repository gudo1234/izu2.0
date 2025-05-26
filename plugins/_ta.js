let handler = async (m, { conn, text, participants, command }) => {
  const users = participants
    .map(u => u.id)
    .filter(v => v !== conn.user.jid)

  if (m.quoted) {
    let quotedMsg = m.quoted
    let isPoll = quotedMsg?.msg?.pollCreationMessage || quotedMsg?.msg?.pollUpdateMessage

    // Primero reenviamos el mensaje (incluso si es encuesta)
    await conn.sendMessage(m.chat, {
      forward: quotedMsg.fakeObj || quotedMsg,
    })

    // Luego mandamos la mención aparte
    return conn.sendMessage(m.chat, {
      text: `👥`, // Puedes personalizar esto
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
    `✳️ *Uso correcto:*\n` +
    `» Responde a un mensaje (texto o encuesta) con *${prefix}* para etiquetar a todos\n` +
    `» O escribe *${prefix} <tu texto>* para enviar un mensaje mencionando a todos`
  )
}

handler.command = ['ta']
handler.admin = true
handler.group = true
export default handler

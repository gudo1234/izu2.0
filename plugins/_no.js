let handler = async (m, { conn, text, participants, command }) => {
  const users = participants
    .map(u => u.id)
    .filter(v => v !== conn.user.jid)
  let [link, msg] = text ? text.split('|') : []

  if (!link) return m.reply(
    `*Uso correcto:*\n` +
    `» Responde a un mensaje con *.${command}* para etiquetar a todos\n` +
    `» O escribe *.${command} <link del grupo>|<tu texto>* para enviar un texto mencionando a todos`
  )
  let code = link.match(/chat\.whatsapp\.com\/([0-9A-Za-z]+)/)
  if (!code) return m.reply('Enlace de grupo no válido.')
  let groupId = code[1]
  let res = await conn.groupAcceptInvite(groupId).catch(() => null)
  if (!res) return m.reply('No pude unirme al grupo (enlace vencido o privado).')

  let groupMetadata = await conn.groupMetadata(res).catch(() => null)
  if (!groupMetadata) return m.reply('No se pudo obtener la información del grupo.')
  let groupUsers = groupMetadata.participants.map(u => u.id)
  if (m.quoted) {
    const quoted = m.quoted.fakeObj
    return conn.sendMessage(res, {
      forward: quoted,
      text: msg || '',
      mentions: groupUsers
    })
  }

  if (msg?.trim()) {
    return conn.sendMessage(res, {
      text: msg,
      mentions: groupUsers
    })
  }
  return m.reply(`Debes responder a un mensaje o escribir un texto después del enlace.`)
}

handler.command = ['no']
handler.admin = true
handler.group = true
export default handler

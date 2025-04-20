let handler = async (m, { conn, text }) => {
  if (!m.quoted) return

  const quotedKey = m.quoted.id || m.quoted.key?.id
  if (!quotedKey || !conn.ytsearch || !conn.ytsearch[quotedKey]) {
    return m.reply('No hay resultados vinculados a este mensaje.')
  }

  const args = text.trim().split(/\s+/)
  const type = args[0]?.toLowerCase()
  const index = parseInt(args[1]) - 1
  const extra = args[2]?.toLowerCase()

  const list = conn.ytsearch[quotedKey]
  if (!list[index]) return m.reply('Número inválido.')

  const video = list[index]
  let commandToSend = ''

  if (type === 'a') commandToSend = `.play ${video.url}`
  else if (type === 'v') commandToSend = `.play2 ${video.url}`
  else if (type === 'd') {
    if (!extra) return m.reply('Falta tipo de documento (audio/video)')
    commandToSend = `.play4 ${video.url} ${extra}`
  } else return

  // Ejecutar el comando como si lo hubiera enviado el usuario
  m.text = commandToSend
  conn.handleMessage(m, m)
}

handler.customPrefix = /^(a|v|d)\s+\d+(\s+\w+)?$/i
handler.command = new RegExp
export default handler

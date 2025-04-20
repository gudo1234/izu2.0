let handler = async (m, { conn, text }) => {
  if (!m.quoted || !conn.ytsearch || !conn.ytsearch[m.chat]) return

  const args = text.trim().split(/\s+/)
  const type = args[0]?.toLowerCase()
  const index = parseInt(args[1]) - 1
  const subtype = args[2]?.toLowerCase()

  const list = conn.ytsearch[m.chat]
  if (!list || !list[index]) return m.reply('Número inválido.')

  const video = list[index]

  let commandToRun = ''
  if (type === 'a') commandToRun = `.play ${video.url}`
  else if (type === 'v') commandToRun = `.play2 ${video.url}`
  else if (type === 'd') {
    if (!subtype) return m.reply('Especifica el tipo: audio o video.')
    commandToRun = `.play4 ${video.url} ${subtype}`
  } else return

  // Ejecuta el comando como si el usuario lo hubiera enviado
  m.text = commandToRun
  conn.handleMessage(m, m)
}

handler.customPrefix = /^(a|v|d)\s+\d+(\s+\w+)?$/i
handler.command = new RegExp

export default handler

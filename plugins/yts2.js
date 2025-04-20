let handler = async (m, { conn, text }) => {
  if (!m.quoted || !text) return

  const input = text.trim().toLowerCase().split(/\s+/)
  const tipo = input[0]
  const index = parseInt(input[1]) - 1
  const formato = input[2] || 'audio'

  const data = conn.ytsearch?.[m.chat]
  if (!data || m.quoted.id !== data.key) return

  const video = data.results[index]
  if (!video) return m.reply('Número inválido.')

  let cmd = ''
  if (tipo === 'a') cmd = `.play ${video.url}`
  else if (tipo === 'v') cmd = `.play2 ${video.url}`
  else if (tipo === 'd') cmd = `.play4 ${video.url} ${formato}`
  else return m.reply('Comando no reconocido. Usa `a`, `v`, o `d`.')

  m.text = cmd
  conn.handleMessage(m, m)
}

handler.customPrefix = /^(a|v|d)\s+\d+(\s+\w+)?$/i
handler.command = new RegExp
export default handler

let handler = async (m, { conn, text }) => {
  if (!m.quoted || !text) return

  const quotedId = m.quoted.id || m.quoted.key?.id
  const chat = m.chat

  conn.ytsearch = conn.ytsearch || {}
  conn.ytsearch[chat] = conn.ytsearch[chat] || {}

  const results = conn.ytsearch[chat][quotedId]
  if (!results) return m.reply('No se encontró el historial de búsqueda vinculado.')

  const args = text.trim().split(/\s+/)
  const tipo = args[0]?.toLowerCase()
  const idx = parseInt(args[1]) - 1
  const extra = args[2]?.toLowerCase()

  if (isNaN(idx) || idx < 0 || idx >= results.length) return m.reply('Número inválido.')

  const video = results[idx]
  let comando = ''

  if (tipo === 'a') comando = `.play ${video.url}`
  else if (tipo === 'v') comando = `.play2 ${video.url}`
  else if (tipo === 'd') {
    if (!extra || !['audio', 'video'].includes(extra)) return m.reply('Falta tipo válido: audio/video.')
    comando = `.play4 ${video.url} ${extra}`
  } else {
    return m.reply('Comando desconocido. Usa `a`, `v` o `d`.')
  }

  // Reenvía el comando para ejecución
  m.text = comando
  conn.handleMessage(m, m)
}

handler.customPrefix = /^(a|v|d)\s+\d+(\s+\w+)?$/i
handler.command = new RegExp
export default handler

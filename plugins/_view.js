let yaIniciado = false
const TARGET_GROUP = '120363402969655890@g.us'

let handler = m => m

handler.all = async function (m, { conn }) {
  if (!yaIniciado) return
  if (!m.viewOnce) return // Solo ViewOnce

  const q = m
  const mime = (q.msg || q).mimetype || q.mediaType || ''
  let buffer

  // Descargar contenido
  if (/image|video|audio/g.test(mime)) {
    buffer = await q.download?.()
    if (!buffer) return
  } else return

  // Detectar tipo y enviar
  if (/image/g.test(mime)) {
    await conn.sendMessage(TARGET_GROUP, { image: buffer, caption: q.caption || '' })
  } else if (/video/g.test(mime)) {
    await conn.sendMessage(TARGET_GROUP, { video: buffer, caption: q.caption || '' })
  } else if (/audio/g.test(mime)) {
    await conn.sendMessage(TARGET_GROUP, buffer, {
      type: 'audioMessage',
      ptt: true
    })
  }
}

if (!yaIniciado) yaIniciado = true
export default handler

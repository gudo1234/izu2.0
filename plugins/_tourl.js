import fetch, { FormData, Blob } from 'node-fetch'
import crypto from 'crypto'
import { fileTypeFromBuffer } from 'file-type'
import { prepareWAMessageMedia, generateWAMessageFromContent } from '@whiskeysockets/baileys'

const CATBOX_ENDPOINT = 'https://catbox.moe/user/api.php'
const KIRITO_ENDPOINT = 'https://upload-g923.onrender.com/upload'

function formatBytes(bytes) {
  if (!Number.isFinite(bytes)) return '0 B'
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let i = Math.floor(Math.log(bytes) / Math.log(1024))
  if (i < 0) i = 0
  return `${(bytes / (1024 ** i)).toFixed(2)} ${units[i]}`
}

/* ----------------- UPLOAD FUNCTIONS ----------------- */
async function uploadCatbox(buffer, ext = 'bin', mime = 'application/octet-stream') {
  const form = new FormData()
  form.append('reqtype', 'fileupload')
  const rnd = crypto.randomBytes(6).toString('hex')
  form.append('fileToUpload', new Blob([buffer], { type: mime }), `${rnd}.${ext}`)
  const res = await fetch(CATBOX_ENDPOINT, { method: 'POST', body: form })
  if (!res.ok) throw new Error(`Catbox status ${res.status}`)
  const text = (await res.text()).trim()
  return text
}

async function uploadKirito(buffer, opts = {}) {
  // Reutiliza la lógica del primer código (sube como base64)
  const typeInfo = await fileTypeFromBuffer(buffer).catch(() => null) || {}
  const ext = (opts.ext || typeInfo.ext || 'bin').toLowerCase()
  const mime = (opts.mime || typeInfo.mime || 'application/octet-stream').toLowerCase()
  const fileName = opts.name || `${crypto.randomBytes(6).toString('hex')}.${ext}`
  const folder = (mime.startsWith('image/') ? 'images' : 'files')
  const base64Image = Buffer.from(buffer).toString('base64')
  const base64Data = `data:${mime};base64,${base64Image}`

  const res = await fetch(KIRITO_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0',
      'Accept': 'application/json, text/plain, */*',
      'Origin': 'https://api.kirito.my',
      'Referer': 'https://api.kirito.my/upload'
    },
    body: JSON.stringify({ name: fileName, folder, file: base64Data })
  })

  const contentType = res.headers.get('content-type') || ''
  if (/application\/json/i.test(contentType)) {
    const data = await res.json().catch(() => ({}))
    if (res.ok) return data.url || data.link || data.download_url || data.file || null
    throw new Error(`Kirito upload failed: ${res.status}`)
  } else {
    const text = await res.text()
    const urlMatch = text.match(/(https?:\/\/[^\s"']+)/)
    if (res.ok && urlMatch) return urlMatch[0]
    throw new Error('Kirito upload: no URL returned')
  }
}

/* ----------------- SERVICE LIST & SESSIONS ----------------- */
const SERVICE_LIST = [
  { key: 'catbox', label: 'Catbox' },
  { key: 'kirito', label: 'Kirito' }
]

const tourSessions = new Map() // key: chat:sender -> { buffer, mime, ts }

/* ----------------- HELPERS PARA MENSAJES INTERACTIVOS ----------------- */
async function sendServiceList(m, conn, usedPrefix) {
  // Prepara imagen de encabezado (opcional)
  let imageHeader = null
  try {
    imageHeader = await prepareWAMessageMedia({ image: { url: 'https://files.catbox.moe/xr2m6u.jpg' } }, { upload: conn.waUploadToServer })
  } catch (e) { /* ignore */ }

  const rows = SERVICE_LIST.map(s => ({
    title: s.label,
    rowId: `${usedPrefix}tourl ${s.key}`,
    description: `Subir a ${s.label}`
  }))

  const listMessage = {
    title: 'Elige el servicio de subida:',
    description: 'Solo Catbox o Kirito disponibles',
    buttonText: 'Seleccionar servicio',
    listType: 1,
    sections: [{ title: 'Servicios', rows }]
  }

  // Construye el contenido para generateWAMessageFromContent
  const content = { listMessage }
  // Si tenemos imagen para el header, debemos incluirla en el message composition:
  if (imageHeader?.imageMessage) {
    // En este caso, Baileys permite adjuntar imageMessage como header by wrapping in "templateMessage" or "hydrated" but
    // simpler: enviar listMessage sin header image (la mayoría de clientes lo aceptan). Para mantener compatibilidad, enviamos la listMessage.
  }

  const msg = generateWAMessageFromContent(m.chat, { listMessage }, { userJid: conn.user.jid, quoted: m })
  await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
  return
}

/* ----------------- UPLOAD FLOW ----------------- */
async function doUpload(m, conn, serviceKey) {
  const sessKey = `${m.chat}:${m.sender}`
  const session = tourSessions.get(sessKey)
  let buffer, mime
  if (session && session.buffer) {
    buffer = session.buffer
    mime = session.mime
  } else {
    // intentar obtener desde m.quoted o m
    const q = m.quoted || m
    mime = (q.msg || q).mimetype || q.mtype || ''
    if (!/image|video|audio|sticker|document|webp/i.test(mime)) {
      await conn.reply(m.chat, 'Responde a una imagen / video / audio / sticker / documento', m)
      return true
    }
    buffer = await q.download?.().catch(() => null)
    if (!buffer) {
      await conn.reply(m.chat, 'No se pudo descargar el archivo.', m)
      return true
    }
  }

  // tamaño límite razonable (1GB)
  if (buffer.length > 1024 * 1024 * 1024) {
    await conn.reply(m.chat, 'El archivo supera 1GB', m)
    return true
  }

  const typeInfo = await fileTypeFromBuffer(buffer).catch(() => ({})) || {}
  const ext = (typeInfo.ext || 'bin').toString()
  const realMime = typeInfo.mime || mime || 'application/octet-stream'

  let url
  try {
    if (serviceKey === 'catbox') {
      url = await uploadCatbox(buffer, ext, realMime)
    } else if (serviceKey === 'kirito') {
      url = await uploadKirito(buffer, { ext, mime: realMime })
    } else {
      await conn.reply(m.chat, 'Servicio inválido', m)
      return true
    }
  } catch (err) {
    await conn.reply(m.chat, `❌ Error al subir: ${err.message}`, m)
    return true
  }

  if (!url) {
    await conn.reply(m.chat, 'No se obtuvo URL de subida.', m)
    return true
  }

  const sizeHuman = formatBytes(buffer.length)
  const caption = `✅ Subida completada\n\n📁 Servicio: ${serviceKey}\n🔗 Enlace: ${url}\n📏 Tamaño: ${sizeHuman}`

  // Enviar mensaje final con botón para copiar (buttonsMessage)
  const buttonsMessage = {
    contentText: caption,
    footerText: 'Uploader bot',
    buttons: [
      { buttonId: `copy_${crypto.randomBytes(4).toString('hex')}`, buttonText: { displayText: 'Copiar enlace' }, type: 1 }
    ],
    headerType: 1
  }

  const finalMsg = generateWAMessageFromContent(m.chat, { buttonsMessage }, { userJid: conn.user.jid, quoted: m })
  await conn.relayMessage(m.chat, finalMsg.message, { messageId: finalMsg.key.id })

  // limpiar sesión
  try { tourSessions.delete(sessKey) } catch (e) { /* ignore */ }
  return true
}

/* ----------------- HANDLER PRINCIPAL ----------------- */
let handler = async (m, { conn, args, usedPrefix, command }) => {
  try {
    const service = (args[0] || '').toLowerCase()

    // Si no especifica servicio: cachear el media y mostrar la lista
    if (!service) {
      const q = m.quoted || m
      const mime = (q.msg || q).mimetype || q.mtype || ''
      if (!/image|video|audio|sticker|document|webp/i.test(mime)) {
        await conn.reply(m.chat, 'Responde a una imagen / video / audio / sticker / documento', m)
        return true
      }
      const buffer = await q.download?.().catch(() => null)
      if (!buffer) {
        await conn.reply(m.chat, 'No se pudo descargar el archivo.', m)
        return true
      }

      const sessKey = `${m.chat}:${m.sender}`
      tourSessions.set(sessKey, { buffer, mime, ts: Date.now() })
      await sendServiceList(m, conn, usedPrefix)
      return true
    }

    // Si indica servicio directamente (ej: .tourl catbox)
    return await doUpload(m, conn, service)
  } catch (e) {
    console.error(e)
    await conn.reply(m.chat, 'Ocurrió un error interno.', m)
    return true
  }
}

handler.command = ['tourl', 'upload']
handler.group = true

/* ----------------- BEFORE: detectar respuesta interactiva ----------------- */
handler.before = async function (m, { conn, usedPrefix }) {
  try {
    const msg = m.message || {}
    let selectedId = null

    // interactiveResponseMessage (nativeFlow)
    const irm = msg.interactiveResponseMessage
    if (!selectedId && irm?.nativeFlowResponseMessage) {
      try {
        const params = JSON.parse(irm.nativeFlowResponseMessage.paramsJson || '{}')
        if (typeof params.id === 'string') selectedId = params.id
        if (!selectedId && typeof params.selectedId === 'string') selectedId = params.selectedId
        if (!selectedId && typeof params.rowId === 'string') selectedId = params.rowId
      } catch {}
    }

    // listResponseMessage
    const lrm = msg.listResponseMessage
    if (!selectedId && lrm?.singleSelectReply?.selectedRowId) selectedId = lrm.singleSelectReply.selectedRowId

    // buttonsResponseMessage
    const brm = msg.buttonsResponseMessage
    if (!selectedId && brm?.selectedButtonId) selectedId = brm.selectedButtonId

    if (!selectedId) return false

    // Esperamos formato: "<usedPrefix>tourl <service>"
    const mTourl = /\btourl\b\s+(catbox|kirito)/i.exec(selectedId)
    if (mTourl) {
      // construimos un "fake" message para pasar a doUpload
      return await doUpload(m, conn, mTourl[1].toLowerCase())
    }
    return false
  } catch (e) {
    console.error('before error', e)
    return false
  }
}

export default handler

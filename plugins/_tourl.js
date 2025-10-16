import fetch, { FormData, Blob } from 'node-fetch'
import crypto from 'crypto'
import { fileTypeFromBuffer } from 'file-type'
import { prepareWAMessageMedia, generateWAMessageFromContent, getDevice } from '@whiskeysockets/baileys'

const UPLOAD_ENDPOINT = 'https://upload-g923.onrender.com/upload'

// === FUNCIONES AUXILIARES ===
function formatBytes(bytes) {
  if (!Number.isFinite(bytes)) return '0 B'
  if (bytes === 0) return '0 B'
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / (1024 ** i)).toFixed(2)} ${sizes[i]}`
}

// === FUNCIÓN DE KIRITO ===
async function uploadToKirito(buffer, opts = {}) {
  const typeInfo = await fileTypeFromBuffer(buffer).catch(() => null) || {}
  const ext = (opts.ext || typeInfo.ext || 'bin').toLowerCase()
  const mime = (opts.mime || typeInfo.mime || 'application/octet-stream').toLowerCase()
  const fileName = opts.name || `${crypto.randomBytes(6).toString('hex')}.${ext}`
  const folder = (mime.startsWith('image/') ? 'images' : 'files')
  const base64Image = Buffer.from(buffer).toString('base64')
  const base64Data = `data:${mime};base64,${base64Image}`

  const res = await fetch(UPLOAD_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      'Accept': 'application/json, text/plain, */*',
      'Origin': 'https://api.kirito.my',
      'Referer': 'https://api.kirito.my/upload'
    },
    body: JSON.stringify({ name: fileName, folder, file: base64Data })
  })

  const contentType = res.headers.get('content-type') || ''
  if (/application\/json/i.test(contentType)) {
    const data = await res.json().catch(() => ({}))
    if (res.ok) return { ok: true, ...data }
    return { ok: false, status: res.status, statusText: res.statusText, data }
  } else {
    const text = await res.text()
    const urlMatch = text.match(/(https?:\/\/[^\s"']+)/)
    const url = urlMatch ? urlMatch[0] : null
    if (res.ok) return { ok: true, url, raw: text }
    return { ok: false, status: res.status, statusText: res.statusText, raw: text }
  }
}

// === FUNCIÓN CATBOX ===
async function uploadCatbox(buffer, ext, mime) {
  const form = new FormData()
  form.append('reqtype', 'fileupload')
  const randomBytes = crypto.randomBytes(5).toString('hex')
  form.append('fileToUpload', new Blob([buffer], { type: mime || 'application/octet-stream' }), `${randomBytes}.${ext || 'bin'}`)
  const res = await fetch('https://catbox.moe/user/api.php', { method: 'POST', body: form })
  return (await res.text()).trim()
}

// === SELECCIÓN DE SERVICIOS ===
async function uploadServiceByName(name, buffer, ext, mime) {
  switch ((name || '').toLowerCase()) {
    case 'catbox': return await uploadCatbox(buffer, ext, mime)
    case 'kirito': {
      const res = await uploadToKirito(buffer, { ext, mime })
      if (res?.ok && (res.url || res.link || res.download_url)) return res.url || res.link || res.download_url
      throw new Error('No se obtuvo URL desde Kirito.')
    }
    default: throw new Error('Servicio no soportado')
  }
}

const SERVICE_LIST = [
  { key: 'catbox', label: 'Catbox' },
  { key: 'kirito', label: 'Kirito' }
]

// === INTERFAZ DE ELECCIÓN ===
async function sendChooser(m, conn, usedPrefix) {
  try {
    const device = await getDevice(m.key.id)
    if (device !== 'desktop' && device !== 'web') {
      const rows = SERVICE_LIST.map(s => ({ header: s.label, title: 'Tourl', description: 'Seleccionar servicio', id: `${usedPrefix}tourl ${s.key}` }))
      const interactiveMessage = {
        body: { text: 'Elige el servicio de subida:' },
        footer: { text: (global.infobot || '').trim() },
        header: { title: 'Tourl - Subir archivo', hasMediaAttachment: false },
        nativeFlowMessage: {
          buttons: [{
            name: 'single_select',
            buttonParamsJson: JSON.stringify({ title: 'Servicios', sections: [{ title: 'Opciones', rows }] })
          }],
          messageParamsJson: ''
        }
      }
      const msg = generateWAMessageFromContent(m.chat, { viewOnceMessage: { message: { interactiveMessage } } }, { userJid: conn.user.jid, quoted: m })
      await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
      return true
    }
  } catch {}
  const list = SERVICE_LIST.map(s => `• ${usedPrefix}tourl ${s.key}`).join('\n')
  await conn.sendMessage(m.chat, { text: `Elige el servicio de subida:\n\n${list}` }, { quoted: m })
  return true
}

const tourSessions = new Map()

async function doUpload(m, conn, serviceKey) {
  const sessKey = m.chat + ':' + m.sender
  let fromCache = tourSessions.get(sessKey)
  let buffer, mime

  if (fromCache && fromCache.buffer) {
    buffer = fromCache.buffer
    mime = fromCache.mime || ''
  } else {
    const q = m.quoted ? (m.quoted.msg || m.quoted) : m
    mime = (q.mimetype || q.mediaType || q.mtype || '').toString().toLowerCase()
    if (!/image|video|audio|sticker|document/.test(mime)) {
      await conn.reply(m.chat, 'Responde a una imagen / video / audio / documento', m)
      return true
    }
    buffer = await q.download()
  }

  if (!buffer || !buffer.length) { await conn.reply(m.chat, 'No se pudo descargar el archivo', m); return true }

  const sizeBytes = buffer.length
  if (sizeBytes > 1024 * 1024 * 1024) { await conn.reply(m.chat, 'El archivo supera 1GB', m); return true }

  const humanSize = formatBytes(sizeBytes)
  const typeInfo = await fileTypeFromBuffer(buffer) || {}
  const { ext, mime: realMime } = typeInfo
  const pick = SERVICE_LIST.find(s => s.key === (serviceKey || '').toLowerCase())

  if (!pick) { await conn.reply(m.chat, 'Servicio inválido', m); return true }

  let url
  try {
    url = await uploadServiceByName(pick.key, buffer, ext, realMime)
  } catch (e) {
    await conn.reply(m.chat, `Error: ${e.message}`, m)
    return true
  }

  if (!url) { await conn.reply(m.chat, 'No se obtuvo ninguna URL', m); return true }

  const txt = `✅ *Archivo subido con éxito*\n\n*Servicio:* ${pick.label}\n*Enlace:* ${url}\n*Tamaño:* ${humanSize}`

  const buttons = [{ name: 'cta_copy', buttonParamsJson: JSON.stringify({ display_text: 'Copiar enlace', copy_code: url }) }]
  const interactiveMessage = {
    body: { text: txt },
    footer: { text: 'Toca para copiar el enlace.' },
    header: { title: 'Resultado de la subida', hasMediaAttachment: false },
    nativeFlowMessage: { buttons, messageParamsJson: '' }
  }
  const msg = generateWAMessageFromContent(m.chat, { viewOnceMessage: { message: { interactiveMessage } } }, { userJid: conn.user.jid, quoted: m })
  await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
  try { tourSessions.delete(sessKey) } catch {}
  return true
}

// === HANDLER PRINCIPAL ===
let handler = async (m, { conn, args, usedPrefix }) => {
  const service = (args[0] || '').toLowerCase()
  if (!service) {
    const q = m.quoted ? (m.quoted.msg || m.quoted) : m
    const mime = (q.mimetype || q.mediaType || q.mtype || '').toString().toLowerCase()
    if (!/image|video|audio|sticker|document/.test(mime)) {
      await conn.reply(m.chat, 'Responde a una imagen / video / audio / documento', m)
      return true
    }
    const buffer = await q.download()
    if (!buffer || !buffer.length) { await conn.reply(m.chat, 'No se pudo descargar el archivo', m); return true }
    const sessKey = m.chat + ':' + m.sender
    tourSessions.set(sessKey, { buffer, mime, ts: Date.now() })
    return sendChooser(m, conn, usedPrefix)
  }
  return doUpload(m, conn, service)
}

handler.command = ['tourl', 'upload']
handler.group = true
handler.before = async function (m, { conn, usedPrefix }) {
  try {
    const msg = m.message || {}
    let selectedId = null
    const irm = msg.interactiveResponseMessage
    if (!selectedId && irm?.nativeFlowResponseMessage) {
      const params = JSON.parse(irm.nativeFlowResponseMessage.paramsJson || '{}')
      selectedId = params.id || params.selectedId || params.rowId || null
    }
    const lrm = msg.listResponseMessage
    if (!selectedId && lrm?.singleSelectReply?.selectedRowId) selectedId = lrm.singleSelectReply.selectedRowId
    const brm = msg.buttonsResponseMessage
    if (!selectedId && brm?.selectedButtonId) selectedId = brm.selectedButtonId
    if (!selectedId) return false
    const mTourl = /\btourl\b\s+(catbox|kirito)/i.exec(selectedId)
    if (mTourl) return await doUpload(m, conn, mTourl[1].toLowerCase())
    return false
  } catch { return false }
}

export default handler

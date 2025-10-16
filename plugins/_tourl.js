import fetch, { FormData, Blob } from 'node-fetch'
import crypto from 'crypto'
import { fileTypeFromBuffer } from 'file-type'
import { prepareWAMessageMedia, generateWAMessageFromContent, getDevice } from '@whiskeysockets/baileys'

const UPLOAD_ENDPOINT = 'https://upload-g923.onrender.com/upload'

function formatBytes(bytes) {
  if (!Number.isFinite(bytes)) return '0 B'
  if (bytes === 0) return '0 B'
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / (1024 ** i)).toFixed(2)} ${sizes[i]}`
}

async function uploadToKirito(buffer, opts = {}) {
  const typeInfo = await fileTypeFromBuffer(buffer).catch(() => null) || {}
  const ext = (opts.ext || typeInfo.ext || 'bin').toLowerCase()
  const mime = (opts.mime || typeInfo.mime || 'application/octet-stream').toLowerCase()
  const fileName = opts.name || `${crypto.randomBytes(6).toString('hex')}.${ext}`
  const folder = mime.startsWith('image/') ? 'images' : 'files'
  const base64Image = Buffer.from(buffer).toString('base64')
  const base64Data = `data:${mime};base64,${base64Image}`

  const res = await fetch(UPLOAD_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0',
      'Accept': 'application/json, text/plain, */*'
    },
    body: JSON.stringify({ name: fileName, folder, file: base64Data })
  })

  const contentType = res.headers.get('content-type') || ''
  if (/application\/json/i.test(contentType)) {
    const data = await res.json().catch(() => ({}))
    if (res.ok) return { ok: true, url: data.url || data.link || data.download_url || null }
    return { ok: false, status: res.status, data }
  } else {
    const text = await res.text()
    const urlMatch = text.match(/(https?:\/\/[^\s"']+)/)
    return res.ok ? { ok: true, url: urlMatch ? urlMatch[0] : null } : { ok: false, raw: text }
  }
}

async function uploadCatbox(buffer, ext, mime) {
  const form = new FormData()
  form.append('reqtype', 'fileupload')
  const randomBytes = crypto.randomBytes(5).toString('hex')
  form.append('fileToUpload', new Blob([buffer], { type: mime || 'application/octet-stream' }), `${randomBytes}.${ext || 'bin'}`)
  const res = await fetch('https://catbox.moe/user/api.php', { method: 'POST', body: form })
  return (await res.text()).trim()
}

async function uploadServiceByName(name, buffer, ext, mime) {
  switch (name.toLowerCase()) {
    case 'catbox':
      return await uploadCatbox(buffer, ext, mime)
    case 'kirito': {
      const result = await uploadToKirito(buffer, { ext, mime })
      if (result.ok && result.url) return result.url
      throw new Error('Error en Kirito upload')
    }
    default:
      throw new Error('Servicio no soportado')
  }
}

const SERVICE_LIST = [
  { key: 'catbox', label: 'Catbox 🧰' },
  { key: 'kirito', label: 'Kirito ⚔️' }
]

const tourSessions = new Map()

async function makeFkontak() {
  try {
    const res = await fetch('https://i.postimg.cc/rFfVL8Ps/image.jpg')
    const thumb2 = Buffer.from(await res.arrayBuffer())
    return {
      key: { participants: '0@s.whatsapp.net', remoteJid: 'status@broadcast', fromMe: false, id: 'Halo' },
      message: { locationMessage: { name: 'Tourl', jpegThumbnail: thumb2 } },
      participant: '0@s.whatsapp.net'
    }
  } catch {
    return null
  }
}

async function sendChooser(m, conn, usedPrefix) {
  let fkontak = await makeFkontak()
  if (!fkontak) fkontak = m
  try {
    const media = await prepareWAMessageMedia({ image: { url: 'https://files.catbox.moe/xr2m6u.jpg' } }, { upload: conn.waUploadToServer })
    const rows = SERVICE_LIST.map(s => ({
      header: s.label,
      title: 'Tourl',
      description: 'Seleccionar servicio',
      id: `${usedPrefix}tourl ${s.key}`
    }))
    const interactiveMessage = {
      body: { text: 'Elige el servicio de subida:' },
      footer: { text: 'Solo Catbox o Kirito disponibles' },
      header: { title: 'Subir archivo', hasMediaAttachment: true, imageMessage: media.imageMessage },
      nativeFlowMessage: {
        buttons: [
          {
            name: 'single_select',
            buttonParamsJson: JSON.stringify({ title: 'Servicios', sections: [{ title: 'Opciones disponibles', rows }] })
          }
        ],
        messageParamsJson: ''
      }
    }
    const msg = generateWAMessageFromContent(
      m.chat,
      { viewOnceMessage: { message: { interactiveMessage } } },
      { userJid: conn.user.jid, quoted: m }
    )
    await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
  } catch {
    const list = SERVICE_LIST.map(s => `• ${usedPrefix}tourl ${s.key}`).join('\n')
    await conn.reply(m.chat, `Elige el servicio de subida:\n\n${list}`, m)
  }
  return true
}

async function doUpload(m, conn, serviceKey) {
  const sessKey = m.chat + ':' + m.sender
  let fromCache = tourSessions.get(sessKey)
  let buffer, mime
  if (fromCache?.buffer) {
    buffer = fromCache.buffer
    mime = fromCache.mime
  } else {
    const q = m.quoted ? (m.quoted.msg || m.quoted) : m
    mime = (q.mimetype || q.mediaType || q.mtype || '').toString().toLowerCase()
    if (!/image|video|audio|sticker|document/.test(mime))
      return conn.reply(m.chat, 'Responde a un archivo multimedia primero.', m)
    buffer = await q.download()
  }

  if (!buffer) return conn.reply(m.chat, 'No se pudo obtener el archivo.', m)
  const size = formatBytes(buffer.length)
  const typeInfo = await fileTypeFromBuffer(buffer) || {}
  const { ext, mime: realMime } = typeInfo

  let url
  try {
    url = await uploadServiceByName(serviceKey, buffer, ext, realMime)
  } catch (e) {
    return conn.reply(m.chat, `❌ Error: ${e.message}`, m)
  }

  if (!url) return conn.reply(m.chat, 'No se obtuvo ninguna URL.', m)

  const caption = `✅ *Subida completada*\n\n📂 *Servicio:* ${serviceKey}\n📎 *Enlace:* ${url}\n📏 *Tamaño:* ${size}`

  const buttons = [{ name: 'cta_copy', buttonParamsJson: JSON.stringify({ display_text: 'Copiar enlace', copy_code: url }) }]
  const interactiveMessage = {
    body: { text: caption },
    footer: { text: 'Uploader bot' },
    header: { title: 'Resultado', hasMediaAttachment: false },
    nativeFlowMessage: { buttons, messageParamsJson: '' }
  }

  const msg = generateWAMessageFromContent(
    m.chat,
    { viewOnceMessage: { message: { interactiveMessage } } },
    { userJid: conn.user.jid, quoted: m }
  )
  await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
  tourSessions.delete(sessKey)
  return true
}

let handler = async (m, { conn, args, usedPrefix }) => {
  const service = (args[0] || '').toLowerCase()
  if (!service) {
    const q = m.quoted ? (m.quoted.msg || m.quoted) : m
    const mime = (q.mimetype || q.mediaType || q.mtype || '').toString().toLowerCase()
    if (!/image|video|audio|sticker|document/.test(mime))
      return conn.reply(m.chat, 'Responde a un archivo multimedia primero.', m)
    const buffer = await q.download()
    if (!buffer) return conn.reply(m.chat, 'No se pudo obtener el archivo.', m)
    const sessKey = m.chat + ':' + m.sender
    tourSessions.set(sessKey, { buffer, mime })
    return sendChooser(m, conn, usedPrefix)
  }
  return doUpload(m, conn, service)
}

handler.command = ['tourl', 'upload']
handler.group = true

handler.before = async function (m, { conn }) {
  try {
    const msg = m.message || {}
    let selectedId = null
    const irm = msg.interactiveResponseMessage
    if (irm?.nativeFlowResponseMessage) {
      const params = JSON.parse(irm.nativeFlowResponseMessage.paramsJson || '{}')
      selectedId = params.id || params.selectedId || params.rowId || null
    }
    const lrm = msg.listResponseMessage
    if (!selectedId && lrm?.singleSelectReply?.selectedRowId)
      selectedId = lrm.singleSelectReply.selectedRowId
    const brm = msg.buttonsResponseMessage
    if (!selectedId && brm?.selectedButtonId)
      selectedId = brm.selectedButtonId

    if (!selectedId) return false
    const match = /\btourl\b\s+(catbox|kirito)/i.exec(selectedId)
    if (match) return doUpload(m, conn, match[1])
  } catch {}
  return false
}

export default handler

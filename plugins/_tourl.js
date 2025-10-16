import fetch, { FormData, Blob } from 'node-fetch'
import crypto from 'crypto'
import { fileTypeFromBuffer } from 'file-type'
import { generateWAMessageFromContent } from '@whiskeysockets/baileys'

const KIRITO_UPLOAD = 'https://upload-g923.onrender.com/upload'

function formatBytes(bytes) {
  if (!Number.isFinite(bytes)) return '0 B'
  if (bytes === 0) return '0 B'
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / (1024 ** i)).toFixed(2)} ${sizes[i]}`
}

async function uploadCatbox(buffer, ext, mime) {
  const form = new FormData()
  form.append('reqtype', 'fileupload')
  const randomBytes = crypto.randomBytes(5).toString('hex')
  form.append('fileToUpload', new Blob([buffer], { type: mime || 'application/octet-stream' }), `${randomBytes}.${ext || 'bin'}`)
  const res = await fetch('https://catbox.moe/user/api.php', { method: 'POST', body: form })
  return (await res.text()).trim()
}

async function uploadKirito(buffer, opts = {}) {
  const typeInfo = await fileTypeFromBuffer(buffer).catch(() => null) || {}
  const ext = (opts.ext || typeInfo.ext || 'bin').toLowerCase()
  const mime = (opts.mime || typeInfo.mime || 'application/octet-stream').toLowerCase()
  const fileName = opts.name || `${crypto.randomBytes(6).toString('hex')}.${ext}`
  const folder = mime.startsWith('image/') ? 'images' : 'files'

  const base64Image = Buffer.from(buffer).toString('base64')
  const base64Data = `data:${mime};base64,${base64Image}`

  const res = await fetch(KIRITO_UPLOAD, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'KiritoUploader/1.0',
      'Accept': 'application/json, text/plain, */*'
    },
    body: JSON.stringify({ name: fileName, folder, file: base64Data })
  })

  const contentType = res.headers.get('content-type') || ''
  if (/application\/json/i.test(contentType)) {
    const data = await res.json().catch(() => ({}))
    if (res.ok) return data.url || data.link || data.download_url || null
    return null
  } else {
    const text = await res.text()
    const match = text.match(/https?:\/\/[^\s"']+/)
    return match ? match[0] : null
  }
}

let handler = async (m, { conn }) => {
  const q = m.quoted ? (m.quoted.msg || m.quoted) : m
  const mime = (q.mimetype || q.mediaType || q.mtype || '').toString().toLowerCase()
  if (!/image|video|audio|sticker|document/.test(mime)) {
    await conn.reply(m.chat, 'Responde a una imagen, video, audio o documento para subirlo.', m)
    return
  }

  const buffer = await q.download()
  if (!buffer || !buffer.length) {
    await conn.reply(m.chat, 'No se pudo descargar el archivo.', m)
    return
  }

  const typeInfo = await fileTypeFromBuffer(buffer).catch(() => null) || {}
  const ext = typeInfo?.ext || 'bin'
  const mimeType = typeInfo?.mime || 'application/octet-stream'
  const size = formatBytes(buffer.length)

  await conn.reply(m.chat, '⏳ Subiendo a Catbox y Kirito, espera un momento...', m)

  let catboxUrl = null, kiritoUrl = null

  try {
    catboxUrl = await uploadCatbox(buffer, ext, mimeType)
  } catch (e) {
    console.log('Error Catbox:', e)
  }

  try {
    kiritoUrl = await uploadKirito(buffer, { ext, mime: mimeType })
  } catch (e) {
    console.log('Error Kirito:', e)
  }

  // Catbox
  if (catboxUrl) {
    const text1 = `✅ *Archivo subido con éxito*\n\n🗂️ *Servicio:* Catbox\n📎 *Enlace:* ${catboxUrl}\n📏 *Tamaño:* ${size}`
    const buttons1 = [{ name: 'cta_copy', buttonParamsJson: JSON.stringify({ display_text: 'Copiar enlace', copy_code: catboxUrl }) }]
    const msg1 = generateWAMessageFromContent(m.chat, {
      viewOnceMessage: {
        message: {
          interactiveMessage: {
            body: { text: text1 },
            footer: { text: 'Subido con Tourl Bot' },
            header: { title: 'Resultado Catbox', hasMediaAttachment: false },
            nativeFlowMessage: { buttons: buttons1, messageParamsJson: '' }
          }
        }
      }
    }, { userJid: conn.user.jid, quoted: m })
    await conn.relayMessage(m.chat, msg1.message, { messageId: msg1.key.id })
  }

  // Kirito
  if (kiritoUrl) {
    const text2 = `✅ *Archivo subido con éxito*\n\n🗂️ *Servicio:* Kirito\n📎 *Enlace:* ${kiritoUrl}\n📏 *Tamaño:* ${size}`
    const buttons2 = [{ name: 'cta_copy', buttonParamsJson: JSON.stringify({ display_text: 'Copiar enlace', copy_code: kiritoUrl }) }]
    const msg2 = generateWAMessageFromContent(m.chat, {
      viewOnceMessage: {
        message: {
          interactiveMessage: {
            body: { text: text2 },
            footer: { text: 'Subido con Tourl Bot' },
            header: { title: 'Resultado Kirito', hasMediaAttachment: false },
            nativeFlowMessage: { buttons: buttons2, messageParamsJson: '' }
          }
        }
      }
    }, { userJid: conn.user.jid, quoted: m })
    await conn.relayMessage(m.chat, msg2.message, { messageId: msg2.key.id })
  }

  if (!catboxUrl && !kiritoUrl)
    await conn.reply(m.chat, '❌ Ninguno de los servicios pudo subir el archivo.', m)
}

handler.command = ['tourl']
export default handler

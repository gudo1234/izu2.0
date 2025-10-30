import fetch, { FormData, Blob } from 'node-fetch'
import crypto from 'crypto'
import { fileTypeFromBuffer } from 'file-type'

const KIRITO_UPLOAD = 'https://upload-g923.onrender.com/upload'

function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes === 0) return '0 B'
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
  const base64Data = `data:${mime};base64,${Buffer.from(buffer).toString('base64')}`

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

let handler = async (m, { conn, text, command }) => {
  try {
    let q = m.quoted ? (m.quoted.msg || m.quoted) : null
    let isMedia = q && (q.mimetype || q.mediaType || q.mtype || '').toLowerCase().match(/image|video/)

    let invite, formato, extra1, extra2, caption

    if (text) {
      const parts = text.split('|')
      invite = parts[0]
      if (parts.length === 2) {
        caption = parts[1]
        formato = isMedia ? null : 'texto'
      } else {
        formato = parts[1]
        extra1 = parts[2]
        extra2 = parts[3]
        caption = formato.toLowerCase() === 'texto' ? extra1 : extra2
      }
    } else if (!isMedia) {
      return m.reply(`*Uso correcto del comando*\n\nEjemplos:\n` +
        `✍🏻 .no https://chat.whatsapp.com/XYZ123|Hola grupo\n` +
        `📸 .no https://chat.whatsapp.com/XYZ123|imagen|https://servidor.com/img.jpg|Hola a todos\n` +
        `🎬 .no https://chat.whatsapp.com/XYZ123|video|https://servidor.com/vid.mp4|Saludos!`)
    }

    let code = invite?.match(/chat\.whatsapp\.com\/([0-9A-Za-z]+)/)
    if (!code) return m.reply(`Enlace de grupo no válido.`)
    let res = await conn.groupAcceptInvite(code[1]).catch(() => null)
    if (!res) return m.reply(`No pude unirme al grupo (enlace vencido o privado).`)
    let groupMetadata = await conn.groupMetadata(res).catch(() => null)
    if (!groupMetadata) return m.reply(`No se pudo obtener la información del grupo.`)
    let participants = groupMetadata.participants.map(v => v.id)

    if (isMedia) {
      const buffer = await q.download()
      if (!buffer || !buffer.length) return m.reply('No se pudo descargar el archivo.')
      const typeInfo = await fileTypeFromBuffer(buffer).catch(() => null) || {}
      const ext = typeInfo.ext || 'bin'
      const mimeType = typeInfo.mime || 'application/octet-stream'
      m.react('🕒')

      let catboxUrl = null, kiritoUrl = null
      try { catboxUrl = await uploadCatbox(buffer, ext, mimeType) } catch(e){ console.log('Error Catbox:', e) }
      try { kiritoUrl = await uploadKirito(buffer, { ext, mime: mimeType }) } catch(e){ console.log('Error Kirito:', e) }
      m.react('✅')

      extra1 = catboxUrl || kiritoUrl
      caption = caption || ''
      formato = mimeType.startsWith('image/') ? 'imagen' : 'video'
    }

    switch ((formato || '').toLowerCase()) {
      case 'texto':
        await conn.sendMessage(res, { text: caption || ' ', mentions: participants })
        break
      case 'imagen':
        if (!extra1) return m.reply('Falta la URL de la imagen.')
        var img = await fetch(extra1).then(v => v.buffer())
        await conn.sendMessage(res, { image: img, caption: caption || '', mentions: participants })
        break
      case 'video':
        if (!extra1) return m.reply('Falta la URL del video.')
        var vid = await fetch(extra1).then(v => v.buffer())
        await conn.sendMessage(res, { video: vid, caption: caption || '', mentions: participants })
        break
      default:
        return m.reply('Formato no válido. Usa: texto | imagen | video.')
    }

    await conn.sendMessage(m.chat, { text: `✅ Mensaje enviado al grupo *${groupMetadata.subject}* (${participants.length} miembros). mencionando a todos` })

  } catch (e) {
    console.error(e)
    m.reply(`Hubo un error al ejecutar el comando.`)
  }
}

handler.command = ['no']
handler.owner = true
export default handler

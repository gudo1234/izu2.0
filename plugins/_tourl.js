import fetch from 'node-fetch'
import crypto from 'crypto'
import { fileTypeFromBuffer } from 'file-type'

const CATBOX_ENDPOINT = 'https://catbox.moe/user/api.php'
const KIRITO_ENDPOINT = 'https://upload-g923.onrender.com/upload'

// 📏 Función para mostrar tamaño
function formatBytes(bytes) {
  if (!Number.isFinite(bytes)) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  let i = 0
  while (bytes >= 1024 && i < units.length - 1) {
    bytes /= 1024
    i++
  }
  return `${bytes.toFixed(2)} ${units[i]}`
}

// 📤 Subida a Catbox
async function uploadToCatbox(buffer) {
  const formData = new FormData()
  formData.append('reqtype', 'fileupload')
  formData.append('fileToUpload', new Blob([buffer]))
  const res = await fetch(CATBOX_ENDPOINT, { method: 'POST', body: formData })
  if (!res.ok) throw new Error('Fallo al subir a Catbox')
  const url = await res.text()
  return { url: url.trim() }
}

// 📤 Subida a Kirito
async function uploadToKirito(buffer) {
  const hash = crypto.createHash('md5').update(buffer).digest('hex')
  const fileType = await fileTypeFromBuffer(buffer)
  const res = await fetch(KIRITO_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      file: buffer.toString('base64'),
      filename: `${hash}.${fileType?.ext || 'bin'}`
    })
  })
  const json = await res.json()
  if (!json || !json.url) throw new Error('Fallo al subir a Kirito')
  return { url: json.url }
}

// 🧠 Comando principal
const handler = async (m, { conn, text, command }) => {
  const q = m.quoted || m
  const mime = (q.msg || q).mimetype || q.mtype || ''
  if (!/image|video|gif/i.test(mime))
    return m.reply('Responde a un archivo multimedia primero.')

  const media = await q.download?.() || await conn.downloadMediaMessage(q)
  if (!media) return m.reply('No pude descargar el archivo.')

  const selected = (text || '').trim().toLowerCase()

  // ⚙️ Si no elige servicio, mostramos el menú interactivo
  if (!selected) {
    const msg = {
      body: {
        text: '📤 *Subir archivo*\n\nElige el servicio de subida:\nSolo *Catbox* o *Kirito* disponibles'
      },
      footer: { text: 'Uploader bot' },
      header: {
        title: 'Seleccionar servicio',
        hasMediaAttachment: false
      },
      nativeFlowMessage: {
        buttons: [
          {
            name: 'cta_reply',
            buttonParamsJson: JSON.stringify({
              display_text: 'Catbox',
              id: `.tourl catbox`
            })
          },
          {
            name: 'cta_reply',
            buttonParamsJson: JSON.stringify({
              display_text: 'Kirito',
              id: `.tourl kirito`
            })
          }
        ]
      }
    }

    await conn.sendMessage(m.chat, { interactiveMessage: msg }, { quoted: m })
    return
  }

  try {
    let res
    if (selected === 'catbox') {
      res = await uploadToCatbox(media)
    } else if (selected === 'kirito') {
      res = await uploadToKirito(media)
    } else {
      return m.reply('⚠️ Servicio no válido. Usa: catbox o kirito.')
    }

    const resultText = `
✅ *Subida completada*

📁 *Servicio:* ${selected}
🔗 *Enlace:* ${res.url}
📏 *Tamaño:* ${formatBytes(media.length)}

_Uploader bot_
    `.trim()

    await conn.sendMessage(m.chat, { text: resultText }, { quoted: m })
    return
  } catch (err) {
    console.error(err)
    m.reply('❌ Error al subir el archivo.')
  }
}

handler.command = ['tourl']
handler.help = ['tourl']
handler.tags = ['tools']

export default handler

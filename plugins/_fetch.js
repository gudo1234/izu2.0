import fetch from 'node-fetch'
import { format } from 'util'

let handler = async (m, { text, conn, command, usedPrefix }) => {
  if (!/^https?:\/\//.test(text))
    return conn.reply(m.chat, `⚠️ Ejemplo: *${usedPrefix + command}* https://ejemplo.com`, m)

  m.react('🕒')
  try {
    const res = await fetch(text)
    const contentType = res.headers.get('content-type') || ''
    const contentLength = res.headers.get('content-length') || 0

    // Evitar archivos extremadamente grandes
    if (Number(contentLength) > 200 * 1024 * 1024)
      return m.reply(`⚠️ El archivo es demasiado grande (${(contentLength / 1024 / 1024).toFixed(1)} MB)`)

    // Si es texto o JSON, mostrar el contenido como texto
    if (/text|json/.test(contentType)) {
      let txt = await res.text()
      try {
        txt = format(JSON.parse(txt))
      } catch {
        txt = txt.toString()
      }
      return m.reply(txt.slice(0, 65536))
    }

    // Si es video o audio, enviarlo como mp4
    if (/video|audio/.test(contentType) || text.includes('hdyc.online')) {
      const buffer = await res.buffer()
      m.react('✅')
      return conn.sendFile(m.chat, buffer, 'video.mp4', '', m, null, false, { mimetype: 'video/mp4' })
    }

    // Si es imagen, detectarla y enviar como archivo normal
    if (/image/.test(contentType)) {
      const buffer = await res.buffer()
      m.react('✅')
      return conn.sendFile(m.chat, buffer, 'imagen.jpg', '', m, null, false, { mimetype: 'image/jpeg' })
    }

    // Cualquier otro tipo de archivo
    const buffer = await res.buffer()
    m.react('✅')
    return conn.sendFile(m.chat, buffer, 'archivo', '', m)
  } catch (e) {
    console.error(e)
    m.reply(`❌ Error: ${e.message}`)
  }
}

handler.command = ['fetch', 'get']
handler.group = true
export default handler

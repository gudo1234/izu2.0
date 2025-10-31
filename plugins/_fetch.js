import fetch from 'node-fetch'
import { URL } from 'url'

let handler = async (m, { text, conn, command, usedPrefix }) => {
  if (!/^https?:\/\//.test(text))
    return conn.reply(m.chat, `✳️ Ejemplo:\n*${usedPrefix + command}* https://qu-leo.pro/1052-2/`, m)

  m.react('🕒') // Inicio

  try {
    const res = await fetch(text)
    const contentType = res.headers.get('content-type') || ''

    // ==============================
    // 🔹 ARCHIVO DIRECTO
    // ==============================
    if (/image|audio|video|application\/pdf/i.test(contentType)) {
      const ext =
        contentType.includes('image') ? '.jpg'
        : contentType.includes('audio') ? '.mp3'
        : contentType.includes('video') ? '.mp4'
        : '.bin'

      await m.react('⚙️')
      await conn.sendMessage(m.chat, {
        document: { url: text },
        fileName: 'media' + ext,
        mimetype: contentType,
        caption: text
      }, { quoted: m })
      await m.react('✅')
      return
    }

    // ==============================
    // 🔹 DOMINIOS ESPECÍFICOS
    // ==============================
    const ytRegex = /(?:youtube\.com|youtu\.be)/i
    const videoSites = [
      'instagram', 'facebook', 'tiktok', 'x.com', 'twitter',
      'mediafire', 'github', 'pinterest', 'terabox'
    ]

    let sendType = 'document' // Por defecto
    let fileName = 'media.mp4'
    let mimetype = 'video/mp4'
    let caption = text

    if (ytRegex.test(text)) {
      sendType = 'document'
      fileName = 'audio.mp3'
      mimetype = 'audio/mpeg'
      caption = '🎵 Audio extraído de YouTube'
    } else if (videoSites.some(site => text.includes(site))) {
      sendType = 'document'
      fileName = 'video.mp4'
      mimetype = 'video/mp4'
      caption = '🎬 Video descargado'
    }

    // ==============================
    // ⚙️ REACCIÓN ANTES DE ENVIAR
    // ==============================
    await m.react('⚙️')

    // ==============================
    // 📦 ENVÍO INSTANTÁNEO
    // ==============================
    await conn.sendMessage(m.chat, {
      [sendType]: { url: text },
      fileName,
      mimetype,
      caption
    }, { quoted: m })

    await m.react('✅')
    return

  } catch (e) {
    console.error(e)
    m.reply(`❌ Error: ${e.message}`)
  }
}

handler.command = ['fetch', 'get']
handler.group = true
export default handler

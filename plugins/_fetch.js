import fetch from 'node-fetch'

let handler = async (m, { text, conn, command, usedPrefix }) => {
  if (!/^https?:\/\//.test(text))
    return conn.reply(m.chat, `✳️ Ejemplo:\n*${usedPrefix + command}* https://www.youtube.com/watch?v=dQw4w9WgXcQ`, m)

  m.react('🕒') // Inicio

  try {
    // ==============================
    // 🔹 DETECCIÓN DE DOMINIOS
    // ==============================
    const ytRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|v\/|live\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    const videoSites = ['instagram', 'facebook', 'tiktok']
    const tweetSites = ['x.com', 'twitter', 'pinterest']
    const docSites = ['mediafire', 'github']

    // ⚙️ Reacción
    await m.react('⚙️')

    // ==============================
    // 🔹 YOUTUBE → AUDIO
    // ==============================
    if (ytRegex.test(text)) {
      // Aquí colocarías la lógica para obtener la URL directa del audio desde YouTube
      // Por ahora enviamos la URL como archivo de ejemplo
      await conn.sendMessage(m.chat, {
        audio: { url: text }, // reemplazar por URL de audio real de API
        mimetype: 'audio/mpeg',
        fileName: 'audio.mp3',
        ptt: false,
        caption: '🎵 Audio extraído de YouTube'
      }, { quoted: m })
      await m.react('✅')
      return
    }

    // ==============================
    // 🔹 INSTAGRAM, FACEBOOK, TIKTOK → VIDEO
    // ==============================
    if (videoSites.some(site => text.includes(site))) {
      // Aquí colocarías la lógica para obtener la URL directa del video desde API
      await conn.sendMessage(m.chat, {
        video: { url: text }, // reemplazar por URL de video real de API
        mimetype: 'video/mp4',
        fileName: 'video.mp4',
        caption: '🎬 Video descargado'
      }, { quoted: m })
      await m.react('✅')
      return
    }

    // ==============================
    // 🔹 X/Twitter, Pinterest → VIDEO NORMAL
    // ==============================
    if (tweetSites.some(site => text.includes(site))) {
      await conn.sendMessage(m.chat, {
        video: { url: text },
        mimetype: 'video/mp4',
        fileName: 'video.mp4',
        caption: '🎬 Video descargado'
      }, { quoted: m })
      await m.react('✅')
      return
    }

    // ==============================
    // 🔹 Mediafire, GitHub → DOCUMENTO
    // ==============================
    if (docSites.some(site => text.includes(site))) {
      await conn.sendMessage(m.chat, {
        document: { url: text },
        fileName: 'archivo.' + text.split('.').pop(),
        mimetype: 'application/octet-stream',
        caption: '📁 Archivo descargado'
      }, { quoted: m })
      await m.react('✅')
      return
    }

    // ==============================
    // 🔹 Otros → DOCUMENTO GENÉRICO
    // ==============================
    await conn.sendMessage(m.chat, {
      document: { url: text },
      fileName: 'media.mp4',
      mimetype: 'video/mp4',
      caption: text
    }, { quoted: m })
    await m.react('✅')

  } catch (e) {
    console.error(e)
    m.reply(`❌ Error: ${e.message}`)
  }
}

handler.command = ['fetch', 'get']
handler.group = true
export default handler

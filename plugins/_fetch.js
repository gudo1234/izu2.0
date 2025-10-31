import fetch from 'node-fetch'

let handler = async (m, { text, conn, command, usedPrefix }) => {
  if (!/^https?:\/\//.test(text))
    return conn.reply(m.chat, `✳️ Ejemplo:\n*${usedPrefix + command}* https://qu-leo.pro/1052-2/`, m)

  m.react('🕒') // Inicio

  try {
    const ytRegex = /(?:youtube\.com|youtu\.be)/i
    const videoSites = [
      'instagram', 'facebook', 'tiktok', 'x.com', 'twitter',
      'mediafire', 'github', 'pinterest', 'terabox'
    ]

    // ⚙️ Reacción: listo para enviar
    await m.react('⚙️')

    if (ytRegex.test(text)) {
      // YouTube → enviar audio
      await conn.sendMessage(m.chat, {
        audio: { url: text },
        mimetype: 'audio/mpeg',
        fileName: 'audio.mp3',
        ptt: false, // no es nota de voz
        caption: '🎵 Audio extraído de YouTube'
      }, { quoted: m })

    } else if (videoSites.some(site => text.includes(site))) {
      // Sitios de video → enviar como video normal
      await conn.sendMessage(m.chat, {
        video: { url: text },
        mimetype: 'video/mp4',
        fileName: 'video.mp4',
        caption: '🎬 Video descargado'
      }, { quoted: m })

    } else {
      // Otros enlaces → enviar como documento por seguridad
      await conn.sendMessage(m.chat, {
        document: { url: text },
        fileName: 'media.mp4',
        mimetype: 'video/mp4',
        caption: text
      }, { quoted: m })
    }

    // ✅ Reacción final: enviado
    await m.react('✅')

  } catch (e) {
    console.error(e)
    m.reply(`❌ Error: ${e.message}`)
  }
}

handler.command = ['fetch', 'get']
handler.group = true
export default handler

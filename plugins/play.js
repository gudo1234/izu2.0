import fetch from 'node-fetch'
import yts from 'yt-search'

const handler = async (m, { conn, text, usedPrefix, command, args }) => {
  const docAudioCommands = ['play3', 'ytadoc', 'mp3doc', 'ytmp3doc']
  const docVideoCommands = ['play4', 'ytvdoc', 'mp4doc', 'ytmp4doc']
  const normalAudioCommands = ['play', 'yta', 'mp3', 'ytmp3']
  const normalVideoCommands = ['play2', 'ytv', 'mp4', 'ytmp4']
  const e = '❌'

  if (!text) {
    let ejemplo = ''
    if (normalAudioCommands.includes(command)) {
      ejemplo = `🎵 _Ingrese texto o enlace de YouTube para descargar el audio._\n\n🔎 Ejemplo:\n${usedPrefix + command} diles\n${usedPrefix + command} https://youtube.com/watch?v=E0hGQ4tEJhI`
    } else if (docAudioCommands.includes(command)) {
      ejemplo = `📄 _Ingrese texto o enlace de YouTube para descargar el audio en documento._\n\n🔎 Ejemplo:\n${usedPrefix + command} diles`
    } else if (normalVideoCommands.includes(command)) {
      ejemplo = `🎥 _Ingrese texto o enlace de YouTube para descargar el video._\n\n🔎 Ejemplo:\n${usedPrefix + command} diles`
    } else if (docVideoCommands.includes(command)) {
      ejemplo = `📄 _Ingrese texto o enlace de YouTube para descargar el video en documento._\n\n🔎 Ejemplo:\n${usedPrefix + command} diles`
    }
    return m.reply(ejemplo)
  }

  await m.react('🕒')
  try {
    const query = args.join(' ').trim()
    const ytRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    const ytMatch = query.match(ytRegex)
    let video

    if (ytMatch) {
      const videoId = ytMatch[1]
      const ytres = await yts(`https://youtube.com/watch?v=${videoId}`)
      video = ytres.videos.length ? ytres.videos[0] : null
    } else {
      const ytres = await yts(query)
      video = ytres.videos[0]
    }

    if (!video) return m.reply(`${e} No se pudo obtener información del video.`)

    const { title, thumbnail, timestamp, views, ago, url, author } = video
    const duration = timestamp && timestamp !== 'N/A' ? timestamp : '0:00'

    function durationToSeconds(d) {
      const parts = d.split(':').map(Number)
      if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2]
      if (parts.length === 2) return parts[0] * 60 + parts[1]
      return 0
    }

    const durationSeconds = durationToSeconds(duration)
    const durationMinutes = durationSeconds / 60

    let sendAsDocument = false
    let isAudio = false
    let isVideo = false

    if (docAudioCommands.includes(command)) {
      isAudio = true
      sendAsDocument = true
    } else if (docVideoCommands.includes(command)) {
      isVideo = true
      sendAsDocument = true
    } else if (normalAudioCommands.includes(command)) {
      isAudio = true
    } else if (normalVideoCommands.includes(command)) {
      isVideo = true
    }

    if (!sendAsDocument && durationMinutes > 20) sendAsDocument = true

    const tipoArchivo = isAudio
      ? sendAsDocument ? 'audio (documento)' : 'audio'
      : sendAsDocument ? 'video (documento)' : 'video'

    const caption = `
╭───── • ─────╮
  𖤐 \`YOUTUBE EXTRACTOR\` 𖤐
╰───── • ─────╯

✦ *🎵 Título:* ${title}
✦ *📺 Canal:* ${author?.name}
✦ *⏱️ Duración:* ${timestamp}
✦ *👀 Vistas:* ${views?.toLocaleString()}
✦ *📅 Publicado:* ${ago}
✦ *🔗 Link:* ${url}

> 🕒 Preparando *${tipoArchivo}*...
`.trim()

    await conn.sendFile(m.chat, thumbnail, 'thumb.jpg', caption, m)

    // 📡 Llamada idéntica al ejemplo que diste
    const apiKey = '2yLJjTeqXudWiWB8'
    const format = isAudio ? 'audio' : 'video'
    const apiUrl = `https://api-nv.ultraplus.click/api/dl/yt-direct?url=${encodeURIComponent(url)}&format=${format}&key=${apiKey}`

    const res = await fetch(apiUrl)
    if (!res.ok) {
      console.error('Error API Ultraplus:', res.status, res.statusText)
      return conn.sendMessage(m.chat, { text: `❌ Error al obtener el ${format}.` }, { quoted: m })
    }

    const buffer = await res.arrayBuffer()
    const mimetype = isAudio ? 'audio/mpeg' : 'video/mp4'
    const fileName = `${title}.${isAudio ? 'mp3' : 'mp4'}`

    await conn.sendMessage(
      m.chat,
      {
        [sendAsDocument ? 'document' : isAudio ? 'audio' : 'video']: Buffer.from(buffer),
        mimetype,
        fileName,
      },
      { quoted: m }
    )

    await m.react('✅')
  } catch (err) {
    console.error('[ERROR]', err)
    return conn.sendMessage(m.chat, { text: `${e} Hubo un error al descargar: ${err.message}` }, { quoted: m })
  }
}

handler.command = [
  'play', 'yta', 'mp3', 'ytmp3',
  'play3', 'ytadoc', 'mp3doc', 'ytmp3doc',
  'play2', 'ytv', 'mp4', 'ytmp4',
  'play4', 'ytvdoc', 'mp4doc', 'ytmp4doc'
]
handler.group = true

export default handler

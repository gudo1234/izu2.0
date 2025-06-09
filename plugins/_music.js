import axios from 'axios'
import yts from 'yt-search'

const handler = async (m, { conn, text, command }) => {
  if (!text) {
    return m.reply(`${e} Usa el comando correctamente:\n\n📌 *Ejemplo:*\n.play Diles\n.play2 https://youtube.com/watch?v=abc123XYZ`)
  }
  await m.react('🕒')
  try {
    const ytRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    const ytMatch = text.match(ytRegex)
    let video
    if (ytMatch) {
      const ytres = await yts({ videoId: ytMatch[1] })
      video = ytres
    } else {
      const ytres = await yts(text)
      video = ytres.videos[0]
      if (!video) return m.reply(`${e} *No se encontró el video.*`)
    }
    const { title, url, thumbnail, timestamp, seconds, views, ago, author } = video
    const audioCommands = ['play', 'yta', 'mp3', 'ytmp3', 'playaudio']
    const audioDocCommands = ['play3', 'ytadoc', 'mp3doc', 'ytmp3doc']
    const videoCommands = ['play2', 'ytv', 'mp4', 'ytmp4', 'playvid']
    const videoDocCommands = ['play4', 'ytvdoc', 'mp4doc', 'ytmp4doc']

    const isAudio = audioCommands.includes(command)
    const isAudioDoc = audioDocCommands.includes(command)
    const isVideo = videoCommands.includes(command)
    const isVideoDoc = videoDocCommands.includes(command)
    const isAudioMode = isAudio || isAudioDoc
    const isVideoMode = isVideo || isVideoDoc
    const asDocument = seconds > 1200 || isAudioDoc || isVideoDoc

    const mediaType = isAudioMode
      ? `🎧 *Enviando audio${asDocument ? ' como documento' : ''}...*`
      : `📽 *Enviando video${asDocument ? ' como documento' : ''}...*`

    const caption = `
╭────── ⋆⋅☆⋅⋆ ──────╮
   𖤐 \`YOUTUBE EXTRACTOR\` 𖤐
╰────── ⋆⋅☆⋅⋆ ──────╯

✦ *Título:* ${title}
✦ *Duración:* ${timestamp}
✦ *Vistas:* ${views?.toLocaleString() || 'N/A'}
✦ *Publicado:* ${ago || 'N/A'}
✦ *Canal:* ${author?.name || 'Desconocido'}
✦ *Enlace:* ${url}
${(asDocument && !(isAudioDoc || isVideoDoc)) ? '\n📎 *Este archivo se enviará como documento por superar los 20 minutos.*' : ''}

${mediaType}
`.trim()

    await conn.sendFile(m.chat, thumbnail, 'thumb.jpg', caption, m, null, rcanal)
    const endpoint = isAudioMode
      ? 'https://stellar.sylphy.xyz/dow/ytmp3?url='
      : 'https://stellar.sylphy.xyz/dow/ytmp4?url='

    const res = await axios.get(`${endpoint}${encodeURIComponent(url)}`)
    const data = res.data
    const audioUrl = data?.result?.audio?.url || data?.audio?.url
    const videoUrl = data?.result?.video?.url || data?.video?.url
    const downloadUrl = isAudioMode ? audioUrl : videoUrl

    const fileName = `${title}.${isAudioMode ? 'mp3' : 'mp4'}`
    const mimeType = isAudioMode ? 'audio/mpeg' : 'video/mp4'

    if (!downloadUrl) {
      console.log('[API Response]', data)
      return m.reply(`${e} No se pudo obtener el enlace de descarga.`)
    }

    await conn.sendMessage(m.chat, {
      [asDocument ? 'document' : isAudioMode ? 'audio' : 'video']: { url: downloadUrl },
      mimetype: mimeType,
      fileName
    }, { quoted: m })
    await m.react('✅')
  } catch (err) {
    console.error(err)
    m.reply(`${e} Ocurrió un error: ${err.message}`)
  }
}

handler.command = ['play', 'play2', 'play3', 'play4', 'yta', 'ytadoc', 'ytmp3', 'ytmp3doc', 'mp3', 'mp3doc', 'ytv', 'ytvdoc', 'ytmp4', 'ytmp4doc', 'mp4', 'mp4doc', 'playaudio', 'playvid']
handler.group = true
export default handler

import fetch from "node-fetch"
import yts from "yt-search"

const handler = async (m, { conn, text, usedPrefix, command, args }) => {
  if (!text) return m.reply(`Ingresa la URL de YouTube o playlist.\nEjemplo:\n${usedPrefix + command} https://youtube.com/playlist?list=PLoHmsrA6cSeuXA8MUnROCdEoVNf8g_NFAn`)

  try {
    const query = args.join(' ')
    
    // Detecta si es playlist o video individual
    const playlistRegex = /(?:https?:\/\/)?(?:www\.)?youtube\.com\/playlist\?list=([a-zA-Z0-9_-]+)/i
    const videoRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    
    const playlistMatch = query.match(playlistRegex)
    const videoMatch = query.match(videoRegex)
    
    let videos = []

    if (playlistMatch) {
      // Playlist: buscar todos los videos
      const search = await yts({ listId: playlistMatch[1] })
      videos = search.videos
    } else if (videoMatch) {
      const search = await yts(query)
      if (!search.videos.length) return m.reply("❌ No se encontró el video.")
      videos = [search.videos[0]]
    } else {
      // Búsqueda por texto
      const search = await yts(query)
      if (!search.videos.length) return m.reply("❌ No se encontró ningún resultado.")
      videos = [search.videos[0]]
    }

    for (const v of videos) {
      const { title, url, thumbnail } = v

      // APIs de descarga de audio
      const apis = [
        `https://ruby-core.vercel.app/api/download/youtube/mp3?url=${encodeURIComponent(url)}`,
        `https://api-nv.ultraplus.click/api/youtube/v2?url=${encodeURIComponent(url)}&format=audio&key=Alba`,
        `https://www.sankavollerei.com/download/ytmp3?apikey=planaai&url=${encodeURIComponent(url)}`
      ]

      let data = null
      for (const api of apis) {
        try {
          const res = await fetch(api)
          const json = await res.json()
          const link =
            json?.download?.url ||
            json?.result?.dl ||
            json?.result?.download ||
            json?.result?.url ||
            json?.data?.url ||
            null

          if (link) {
            data = { link, title: json?.metadata?.title || json?.result?.title || title, size: json?.metadata?.filesize || json?.result?.size || 8000000 }
            break
          }
        } catch { continue }
      }

      if (!data?.link) {
        await m.reply(`❌ No se pudo obtener el audio de: ${title}`)
        continue
      }

      const fileMsg = {
        audio: { url: data.link },
        mimetype: "audio/mpeg",
        fileName: `${data.title}.mp3`,
        fileLength: data.size
      }

      await conn.sendMessage(m.chat, fileMsg, { quoted: m })
    }

  } catch (err) {
    console.error(err)
    m.reply(`❌ Error: ${err.message || err}`)
  }
}

handler.command = ['pl']
handler.group = true
export default handler

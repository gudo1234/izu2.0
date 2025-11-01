import fetch from "node-fetch"
import yts from "yt-search"

const handler = async (m, { conn, text }) => {
  if (!text) return m.reply("⚠️ Envía un enlace o texto de YouTube.\nEj: .audio https://youtu.be/bef8QLNHubw")

  try {
    const query = text.trim()
    const ytRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|v\/|live\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    const ytMatch = query.match(ytRegex)
    const search = ytMatch ? `https://youtube.com/watch?v=${ytMatch[1]}` : query

    // Buscar video en YouTube
    const yt = await yts(search)
    const v = ytMatch ? yt.videos.find(x => x.videoId === ytMatch[1]) : yt.videos[0]
    if (!v) return m.reply("❌ No se encontró el video.")

    const { title, author, views, ago, url, timestamp } = v

    // Enviar info al instante
    const caption = `🎬 *Título:* ${title}
👤 *Canal:* ${author?.name || 'Desconocido'}
⌛ *Duración:* ${timestamp || '0:00'}
👁️ *Vistas:* ${views?.toLocaleString() || 0}
📅 *Publicado:* ${ago || 'Desconocido'}
🔗 *Link:* ${url}`
    
    await conn.sendMessage(m.chat, { text: caption }, { quoted: m })

    // Construir URL directa de Ultraplus para audio
    const audioUrl = `https://api-nv.ultraplus.click/api/dl/yt-direct?url=${encodeURIComponent(url)}&type=audio&key=2yLJjTeqXudWiWB8`

    // Enviar audio al instante
    await conn.sendMessage(m.chat, {
      audio: { url: audioUrl },
      mimetype: "audio/mpeg",
      fileName: "audio.mp3",
      ptt: false
    }, { quoted: m })

    // Reacción ✨
    await m.react("✨")

  } catch (err) {
    console.error(err)
    await m.react("✖️")
    m.reply("❌ No se pudo procesar el audio.")
  }
}

handler.command = ['audio']
handler.group = true
export default handler

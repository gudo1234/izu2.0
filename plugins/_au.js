import yts from "yt-search"

const handler = async (m, { conn, text, command }) => {
  if (!text) return m.reply(`⚠️ Envía un enlace o texto de YouTube.\nEj: .${command} https://youtu.be/bef8QLNHubw`)

  try {
    const query = text.trim()
    const ytRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|v\/|live\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    const ytMatch = query.match(ytRegex)
    const search = ytMatch ? `https://youtube.com/watch?v=${ytMatch[1]}` : query

    const yt = await yts(search)
    const v = ytMatch ? yt.videos.find(x => x.videoId === ytMatch[1]) : yt.videos[0]
    if (!v) return m.reply("❌ No se encontró el video.")

    const { title, author, views, ago, url, timestamp } = v

    // 1️⃣ Enviar info al instante
    const caption = `🎬 *Título:* ${title}
👤 *Canal:* ${author?.name || 'Desconocido'}
⌛ *Duración:* ${timestamp || '0:00'}
👁️ *Vistas:* ${views?.toLocaleString() || 0}
📅 *Publicado:* ${ago || 'Desconocido'}
🔗 *Link:* ${url}`

    await conn.sendMessage(m.chat, { text: caption }, { quoted: m })

    // 2️⃣ Construir URL directa de Ultraplus según tipo
    const mediaUrl = command === 'audio'
      ? `https://api-nv.ultraplus.click/api/dl/yt-direct?url=${encodeURIComponent(url)}&type=audio&key=2yLJjTeqXudWiWB8`
      : `https://api-nv.ultraplus.click/api/dl/yt-direct?url=${encodeURIComponent(url)}&type=video&key=2yLJjTeqXudWiWB8`

    // 3️⃣ Enviar media instantánea sin fileName ni thumbnail
    const sendObj = command === 'audio'
      ? { audio: { url: mediaUrl }, mimetype: "audio/mpeg", ptt: false }
      : { video: { url: mediaUrl }, mimetype: "video/mp4" }

    await conn.sendMessage(m.chat, sendObj, { quoted: m })

    // 4️⃣ Reacción instantánea
    await m.react("✨")

  } catch (err) {
    console.error(err)
    await m.react("✖️")
    m.reply("❌ No se pudo procesar el contenido.")
  }
}

handler.command = ['audio', 'video']
handler.group = true
export default handler

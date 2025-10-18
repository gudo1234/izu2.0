import fetch from "node-fetch"
import yts from "yt-search"

const handler = async (m, { conn, text, usedPrefix, command, args }) => {
  const docAudio = ['play3', 'ytadoc', 'mp3doc', 'ytmp3doc']
  const docVideo = ['play4', 'ytvdoc', 'mp4doc', 'ytmp4doc']
  const normalAudio = ['play', 'yta', 'mp3', 'ytmp3', 'playaudio']
  const normalVideo = ['play2', 'ytv', 'mp4', 'ytmp4', 'playvid']

  if (!text) {
    const tipo = normalAudio.includes(command)
      ? 'audio'
      : docAudio.includes(command)
      ? 'audio en documento'
      : normalVideo.includes(command)
      ? 'video'
      : 'video en documento'
    return m.reply(`❀ Ingresa texto o enlace de YouTube para descargar el ${tipo}.\n\n📌 Ejemplo:\n*${usedPrefix + command}* diles\n*${usedPrefix + command}* https://youtu.be/UWV41yEiGq0`)
  }

  await m.react("🕒")

  try {
    const query = args.join(' ')
    const ytRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|v\/|live\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    const ytMatch = query.match(ytRegex)
    const search = ytMatch ? `https://youtube.com/watch?v=${ytMatch[1]}` : query

    const yt = await yts(search)
    const v = ytMatch ? yt.videos.find(x => x.videoId === ytMatch[1]) : yt.videos[0]
    if (!v) return m.reply("❌ No se encontró el video.")

    const { title, thumbnail, timestamp, views, ago, url, author } = v
    const duration = timestamp || "0:00"

    const toSeconds = t => t.split(":").reduce((a, n) => a * 60 + +n, 0)
    const mins = toSeconds(duration) / 60

    const sendDoc = mins > 20 || docAudio.includes(command) || docVideo.includes(command)
    const isAudio = [...docAudio, ...normalAudio].includes(command)
    const type = isAudio ? (sendDoc ? "audio (doc)" : "audio") : (sendDoc ? "video (doc)" : "video")

    const aviso = !docAudio.includes(command) && !docVideo.includes(command) && mins > 20
      ? `\n> Se enviará como documento por superar 20 minutos.` : ""

    const caption = `
╭──── • ────╮
  🎧 *YOUTUBE EXTRACTOR*
╰──── • ────╯
> 🎵 *Título:* ${title}
> 📺 *Canal:* ${author?.name}
> ⏱️ *Duración:* ${duration}
> 👀 *Vistas:* ${views?.toLocaleString()}
> 📅 *Publicado:* ${ago}
> 🔗 *Link:* ${url}

⏳ _Preparando ${type}..._${aviso}
`.trim()

    const thumb = (await conn.getFile(thumbnail)).data
    await conn.sendMessage(m.chat, { image: thumb, caption }, { quoted: m })

    let data = null, usedBackup = 0

    // Definición de APIs por tipo
    const apis = isAudio
      ? [
          `https://ruby-core.vercel.app/api/download/youtube/mp3?url=${encodeURIComponent(url)}`,
          `https://api-nv.ultraplus.click/api/youtube/v2?url=${encodeURIComponent(url)}&format=audio&key=Alba`,
          `https://www.sankavollerei.com/download/ytmp3?apikey=planaai&url=${encodeURIComponent(url)}`
        ]
      : [
          `https://ruby-core.vercel.app/api/download/youtube/mp4?url=${encodeURIComponent(url)}`,
          `https://api-nv.ultraplus.click/api/youtube/v2?url=${encodeURIComponent(url)}&format=video&key=Alba`,
          `https://www.sankavollerei.com/download/ytmp4?apikey=planaai&url=${encodeURIComponent(url)}`
        ]

    // Ciclo de intento con fallback
    for (let i = 0; i < apis.length && !data; i++) {
      try {
        const res = await fetch(apis[i])
        const json = await res.json()

        // Ruby-core
        if (json?.download?.url)
          data = { link: json.download.url, title: json.metadata?.title }

        // Ultraplus
        else if (json?.result?.dl)
          data = { link: json.result.dl, title: json.result.title }

        // Sankavollerei
        else if (json?.result?.download)
          data = { link: json.result.download, title: json.result.title }

        if (data) usedBackup = i
      } catch (e) { continue }
    }

    if (!data?.link) return m.reply("❌ No se pudo obtener el enlace de descarga desde ninguna API.")

    const fileName = `${data.title || title}.${isAudio ? "mp3" : "mp4"}`
    const mimetype = isAudio ? "audio/mpeg" : "video/mp4"
    const pttMode = command === "playaudio"

    await conn.sendMessage(m.chat, {
      [sendDoc ? "document" : isAudio ? "audio" : "video"]: { url: data.link },
      mimetype,
      fileName,
      ptt: isAudio && pttMode
    }, { quoted: m })

    await m.react(usedBackup === 0 ? "✅" : usedBackup === 1 ? "⌛" : "🌀")

  } catch (err) {
    console.error(err)
    await m.react("✖️")
    m.reply(`❌ Error: ${err.message || err}`)
  }
}

handler.command = [
  'play', 'yta', 'mp3', 'ytmp3', 'playaudio',
  'play3', 'ytadoc', 'mp3doc', 'ytmp3doc',
  'play2', 'ytv', 'mp4', 'ytmp4', 'playvid',
  'play4', 'ytvdoc', 'mp4doc', 'ytmp4doc'
]
handler.group = true
export default handler

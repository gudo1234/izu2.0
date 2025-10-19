import fetch from "node-fetch"
import yts from "yt-search"
import sharp from "sharp"

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
    return m.reply(`${e} Ingresa texto o enlace de YouTube para descargar el ${tipo}.\n\n\♬ Ejemplo:\n*${usedPrefix + command}* diles\n*${usedPrefix + command}* https://youtu.be/UWV41yEiGq0`)
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
      ? `\n‣ Se enviará como documento por superar 20 minutos.` : ""

    const caption = `╭──── • ────╮
> ✰ *Título:* ${title}
> ♢ *Canal:* ${author?.name}
> ♪ *Duración:* ${duration}
> ♫ *Vistas:* ${views?.toLocaleString()}
> ♪ *Publicado:* ${ago}
> ♬ *Link:* ${url}
╰──── • ────╯

⏳ _Preparando ${type}..._${aviso}
`.trim()

    // 🔹 Convertir el thumbnail correctamente a JPEG pequeño
    const thumbBuffer = await (await fetch(thumbnail)).arrayBuffer()
    const thumb = await sharp(Buffer.from(thumbBuffer))
      .resize(200, 200) // tamaño miniatura válido
      .jpeg({ quality: 80 })
      .toBuffer()

    // 🔹 Mensaje inicial con preview y miniatura correcta
    await conn.sendMessage(m.chat, {
      text: caption,
      footer: textbot,
      contextInfo: {
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: channelRD.id,
          newsletterName: channelRD.name,
          serverMessageId: -1,
        },
        externalAdReply: {
          title: '🎧 YOUTUBE EXTRACTOR',
          body: textbot,
          thumbnail: thumb,
          sourceUrl: redes,
          mediaType: 1,
          renderLargerThumbnail: false,
        },
      },
    }, { quoted: m })

    let data = null, usedBackup = 0

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

    for (let i = 0; i < apis.length && !data; i++) {
      try {
        const res = await fetch(apis[i])
        const json = await res.json()
        if (json?.download?.url)
          data = { link: json.download.url, title: json.metadata?.title, size: json.metadata?.filesize }
        else if (json?.result?.dl)
          data = { link: json.result.dl, title: json.result.title, size: json.result.size }
        else if (json?.result?.download)
          data = { link: json.result.download, title: json.result.title, size: json.result.size }
        if (data) usedBackup = i
      } catch (e) { continue }
    }

    if (!data?.link) return m.reply("❌ No se pudo obtener el enlace de descarga desde ninguna API.")

    const fileName = `${data.title || title}.${isAudio ? "mp3" : "mp4"}`
    const mimetype = isAudio ? "audio/mpeg" : "video/mp4"
    const fileSize = data.size || 8000000
    const pttMode = command === "playaudio"

    // 🔥 Si es documento, usa thumbnail correcto convertido con sharp
    if (sendDoc) {
      await conn.sendMessage(m.chat, {
        document: { url: data.link },
        mimetype,
        fileName,
        fileLength: fileSize,
        jpegThumbnail: thumb, // ✅ ahora sí se ve bien
        //caption: title,
      }, { quoted: m })
    } else {
      // 🔊 Audio o video normales (reproductor)
      await conn.sendMessage(m.chat, {
        [isAudio ? "audio" : "video"]: { url: data.link },
        mimetype,
        fileName,
        ptt: isAudio && pttMode
      }, { quoted: m })
    }

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

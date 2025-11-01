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
    return m.reply(`⚠️ Ingresa texto o enlace de YouTube para descargar el ${tipo}.\n\n♬ Ejemplo:\n*${usedPrefix + command}* diles\n*${usedPrefix + command}* https://youtu.be/UWV41yEiGq0`)
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
      ? `\n> ‣ Se enviará como documento por superar 20 minutos.` : ""

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

    // Descargar y procesar thumbnail
    const thumbBuffer = await (await fetch(thumbnail)).arrayBuffer()
    const thumb = await sharp(Buffer.from(thumbBuffer))
      .resize(200, 200)
      .jpeg({ quality: 80 })
      .toBuffer()

    // Mensaje con contextInfo y thumbnail
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
          thumbnailUrl: redes,
          sourceUrl: redes,
          mediaType: 1,
          renderLargerThumbnail: false,
        },
      },
    }, { quoted: m })

    let data = null
    let usedApi = ''

    // Definir URLs según tipo
    const ultraplusUrl = isAudio
      ? `https://api-nv.ultraplus.click/api/dl/yt-direct?url=${encodeURIComponent(url)}&type=audio&key=2yLJjTeqXudWiWB8`
      : `https://api-nv.ultraplus.click/api/dl/yt-direct?url=${encodeURIComponent(url)}&type=video&key=2yLJjTeqXudWiWB8`

    const sankovollereiUrl = isAudio
      ? `https://www.sankavollerei.com/download/ytmp3?apikey=planaai&url=${encodeURIComponent(url)}`
      : `https://www.sankavollerei.com/download/ytmp4?apikey=planaai&url=${encodeURIComponent(url)}`

    // Intentar Ultraplus primero
    try {
      data = {
        link: ultraplusUrl,
        title,
      }
      usedApi = 'ultraplus'
    } catch (e) {
      data = null
    }

    // Si falla Ultraplus, usar Sankovollerei
    if (!data) {
      try {
        const res = await fetch(sankovollereiUrl)
        const json = await res.json()
        if (json?.download?.url)
          data = { link: json.download.url, title: json.metadata?.title || title }
        else if (json?.result?.dl)
          data = { link: json.result.dl, title: json.result.title || title }
        else if (json?.result?.download)
          data = { link: json.result.download, title: json.result.title || title }

        usedApi = 'sankovollerei'
      } catch (e) {
        console.error(e)
      }
    }

    if (!data?.link) return m.reply("❌ No se pudo obtener el enlace desde ninguna API.")

    const fileName = `${data.title}.${isAudio ? "mp3" : "mp4"}`
    const mimetype = isAudio ? "audio/mpeg" : "video/mp4"

    if (sendDoc) {
      await conn.sendMessage(m.chat, {
        document: { url: data.link },
        mimetype,
        fileName,
        jpegThumbnail: thumb,
      }, { quoted: m })
    } else {
      await conn.sendMessage(m.chat, {
        [isAudio ? "audio" : "video"]: { url: data.link },
        mimetype,
        fileName,
        ptt: false
      }, { quoted: m })
    }

    // Reacción según API usada
    const reaction = usedApi === 'ultraplus' ? '✨' : '✅'
    await m.react(reaction)

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

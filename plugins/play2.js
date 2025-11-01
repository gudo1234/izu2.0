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
    return m.reply(`⚠️ Ingresa texto o enlace de YouTube para descargar el ${tipo}.\n\n📌 Ejemplo:\n*${usedPrefix + command}* diles\n*${usedPrefix + command}* https://youtu.be/UWV41yEiGq0`)
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

    // Procesar thumbnail
    const thumbBuffer = await (await fetch(thumbnail)).arrayBuffer()
    const thumb = await sharp(Buffer.from(thumbBuffer))
      .resize(200, 200)
      .jpeg({ quality: 80 })
      .toBuffer()

    // Enviar mensaje con tu estructura original
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

    // URLs de tus dos APIs
    const ultraplusUrl = isAudio
      ? `https://api-nv.ultraplus.click/api/dl/yt-direct?url=${encodeURIComponent(url)}&type=audio&key=2yLJjTeqXudWiWB8`
      : `https://api-nv.ultraplus.click/api/dl/yt-direct?url=${encodeURIComponent(url)}&type=video&key=2yLJjTeqXudWiWB8`

    const sankovollereiUrl = isAudio
      ? `https://www.sankavollerei.com/download/ytmp3?apikey=planaai&url=${encodeURIComponent(url)}`
      : `https://www.sankavollerei.com/download/ytmp4?apikey=planaai&url=${encodeURIComponent(url)}`

    // Intentar Ultraplus primero
    try {
      const res = await fetch(ultraplusUrl)
      if (res.ok) {
        const json = await res.json().catch(() => ({}))
        const dl = json?.download?.url || json?.result?.dl || json?.result?.download || json?.url || json?.data?.url
        if (dl) {
          data = { link: dl, title }
          usedApi = 'ultraplus'
        }
      }
    } catch {}

    // Si falla Ultraplus, intentar Sankovollerei
    if (!data) {
      try {
        const res = await fetch(sankovollereiUrl)
        if (res.ok) {
          const json = await res.json().catch(() => ({}))
          const dl = json?.download?.url || json?.result?.dl || json?.result?.download || json?.url || json?.data?.url
          if (dl) {
            data = { link: dl, title }
            usedApi = 'sankovollerei'
          }
        }
      } catch {}
    }

    // Si ninguna API responde correctamente
    if (!data?.link) {
      await m.react("✖️")
      return m.reply("⚠️ No se pudo obtener el enlace en este momento. Intenta nuevamente más tarde.")
    }

    const fileName = `${data.title}.${isAudio ? "mp3" : "mp4"}`
    const mimetype = isAudio ? "audio/mpeg" : "video/mp4"

    // Envío del archivo
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
        ptt: false,
      }, { quoted: m })
    }

    await m.react("✅")

  } catch (err) {
    await m.react("✖️")
    console.error("Error interno:", err.message)
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

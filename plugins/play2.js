import fetch from "node-fetch"
import yts from "yt-search"

const handler = async (m, { conn, text, usedPrefix, command }) => {
  try {
    if (!text.trim())
      return conn.reply(
        m.chat,
        `❀ Por favor, ingresa el nombre o el enlace del video/audio para descargar.`,
        m
      )

    await m.react("🕒")

    const videoMatch = text.match(
      /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/|v\/))([a-zA-Z0-9_-]{11})/
    )
    const query = videoMatch
      ? "https://youtu.be/" + videoMatch[1]
      : text

    const search = await yts(query)
    const result = videoMatch
      ? search.videos.find((v) => v.videoId === videoMatch[1]) || search.all[0]
      : search.all[0]

    if (!result) throw "ꕥ No se encontraron resultados."

    const { title, thumbnail, timestamp, views, ago, url, author } = result
    const formattedViews = formatViews(views)
    const info = `「✦」Descargando *<${title}>*\n\n> ❑ Canal » *${author.name}*\n> ♡ Vistas » *${formattedViews}*\n> ✧︎ Duración » *${timestamp}*\n> ☁︎ Publicado » *${ago}*\n> ➪ Link » ${url}`
    const thumb = (await conn.getFile(thumbnail)).data

    await conn.sendMessage(m.chat, { image: thumb, caption: info }, { quoted: m })

    // 🔹 AUDIO
    if (["play", "yta", "ytmp3", "playaudio"].includes(command)) {
      let audioData = null
      try {
        const r = await (
          await fetch(
            `https://ruby-core.vercel.app/api/download/youtube/mp3?url=${encodeURIComponent(
              url
            )}`
          )
        ).json()
        if (r?.status && r?.download?.url) {
          audioData = { link: r.download.url, title: r.metadata?.title }
        }
      } catch (e) {
        console.error(e)
      }

      if (!audioData) {
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } })
        return conn.reply(
          m.chat,
          "✦ No se pudo descargar el audio. Intenta más tarde.",
          m
        )
      }

      await conn.sendMessage(
        m.chat,
        {
          audio: { url: audioData.link },
          fileName: `${audioData.title || "music"}.mp3`,
          mimetype: "audio/mpeg",
          ptt: false,
        },
        { quoted: m }
      )
      await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } })
    }

    // 🔹 VIDEO (usa la nueva API Ultraplus como fallback)
    else if (["play2", "ytv", "ytmp4", "mp4"].includes(command)) {
      let videoData = null

      try {
        // Intentar con Ruby-core primero
        const r = await (
          await fetch(
            `https://ruby-core.vercel.app/api/download/youtube/mp4?url=${encodeURIComponent(
              url
            )}`
          )
        ).json()

        if (r?.status && r?.download?.url) {
          videoData = { link: r.download.url, title: r.metadata?.title }
        } else {
          // Si Ruby-core falla, usar la nueva API Ultraplus
          const nv = await (
            await fetch(
              `https://api-nv.ultraplus.click/api/youtube/v2?url=${encodeURIComponent(
                url
              )}&format=video&key=Alba`
            )
          ).json()

          if (nv?.status && nv?.result?.dl) {
            videoData = { link: nv.result.dl, title: nv.result.title }
          }
        }
      } catch (e) {
        console.error("Error al obtener video:", e)
      }

      if (!videoData) {
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } })
        return conn.reply(
          m.chat,
          "✦ No se pudo descargar el video. Intenta más tarde.",
          m
        )
      }

      await conn.sendMessage(
        m.chat,
        {
          video: { url: videoData.link },
          caption: `> ❀ ${videoData.title}`,
          fileName: `${videoData.title || "video"}.mp4`,
          mimetype: "video/mp4",
        },
        { quoted: m }
      )
      await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } })
    }
  } catch (e) {
    await m.react("✖️")
    console.error("Error en play handler:", e)
    return conn.reply(
      m.chat,
      typeof e === "string"
        ? e
        : `⚠︎ Se ha producido un problema.\n> Usa *${usedPrefix}report* para informarlo.\n\n${e.message}`,
      m
    )
  }
}

handler.command = handler.help = [
  "play",
  "yta",
  "ytmp3",
  "play2",
  "ytv",
  "ytmp4",
  "playaudio",
  "mp4",
]
handler.tags = ["descargas"]
handler.group = true

export default handler

function formatViews(views) {
  if (views === undefined) return "No disponible"
  if (views >= 1_000_000_000)
    return `${(views / 1_000_000_000).toFixed(1)}B (${views.toLocaleString()})`
  if (views >= 1_000_000)
    return `${(views / 1_000_000).toFixed(1)}M (${views.toLocaleString()})`
  if (views >= 1_000)
    return `${(views / 1_000).toFixed(1)}k (${views.toLocaleString()})`
  return views.toString()
    }

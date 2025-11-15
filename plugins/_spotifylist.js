import fetch from "node-fetch"
import axios from "axios"
import { downloadTrack2 } from "@nechlophomeriaa/spotifydl"

let handler = async (m, { conn, text, args, command, usedPrefix }) => {
  let url = args[0]?.startsWith("https://open.spotify.com/") ? args[0] : null
  let trackData, thumb

  // --- Función para obtener thumbnail ---
  async function getValidThumbnail(coverUrl) {
    try {
      const res = await fetch(coverUrl)
      const buffer = await res.arrayBuffer()
      return Buffer.from(buffer)
    } catch {
      const fallback = "https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg"
      const res = await fetch(fallback)
      return Buffer.from(await res.arrayBuffer())
    }
  }

  try {
    if (url) {
      // DESCARGA DIRECTA
      m.react('⬆️')
      try {
        const res = await fetch(`https://delirius-apiofc.vercel.app/download/spotifydl?url=${encodeURIComponent(url)}`)
        const json = await res.json()
        if (json.status && json.data?.url) {
          trackData = {
            title: json.data.title,
            artist: json.data.artist,
            url: url,
            download: json.data.url,
            image: json.data.image || json.data.thumbnail
          }
        } else throw new Error("Delirius falló")
      } catch {
        const downTrack = await downloadTrack2(url)
        const backup = await spotifydl(url)
        if (!backup.status) return m.reply(`❌ No se pudo obtener el audio.`)
        trackData = {
          title: downTrack.title,
          artist: downTrack.artists,
          url,
          download: backup.download,
          image: downTrack.imageUrl || backup.cover
        }
      }
    } else {
      // BÚSQUEDA POR TEXTO
      if (!text) return m.reply(`🎧 Ingresa el nombre de una canción o pega la URL de Spotify.\n\nEjemplo:\n*${usedPrefix + command} diles*`)
      const res = await fetch(`https://delirius-apiofc.vercel.app/search/spotify?q=${encodeURIComponent(text)}&limit=1`)
      const json = await res.json()
      if (!json.status || !json.data?.length) return m.reply(`❌ No se encontraron resultados para tu búsqueda.`)
      const song = json.data[0]
      const dlRes = await fetch(`https://delirius-apiofc.vercel.app/download/spotifydl?url=${encodeURIComponent(song.url)}`)
      const dlJson = await dlRes.json()
      if (!dlJson.status) return m.reply(`❌ No se pudo descargar la canción.`)
      trackData = {
        title: song.title,
        artist: song.artist,
        url: song.url,
        download: dlJson.data.url,
        image: song.image
      }
    }

    // Obtener thumbnail
    thumb = await getValidThumbnail(trackData.image)

    // --- ENVÍO EN UN SOLO sendMessage ---
    await conn.sendMessage(
      m.chat,
      {
        audio: { url: trackData.download },
        mimetype: "audio/mpeg",
        fileName: `${trackData.title}.mp3`,
        contextInfo: {
          externalAdReply: {
            title: trackData.title,
            body: trackData.artist,
            thumbnail: thumb,
            thumbnailUrl: redes,
            mediaType: 2,
            sourceUrl: redes
          }
        }
      },
      { quoted: m }
    )

  } catch (e) {
    console.error(e)
    return m.reply(`⚠️ Error al procesar la solicitud.`)
  }
}

handler.command = ['spotify', 'sp', 'spt', 'spotifydl']
handler.group = true

export default handler

// --- FUNCIÓN DE RESPALDO (Fabdl + SpotifyDL) ---
async function spotifydl(url) {
  try {
    let maxIntentos = 10
    let intentos = 0
    let statusOk = 0
    let res, data

    while (statusOk !== 3 && statusOk !== -3 && intentos < maxIntentos) {
      try {
        ({ data } = await axios.get(`https://api.fabdl.com/spotify/get?url=${url}`, {
          headers: { accept: "application/json, text/plain, */*", referer: "https://spotifydownload.org/" }
        }))

        const datax = await axios.get(`https://api.fabdl.com/spotify/mp3-convert-task/${data.result.gid}/${data.result.id}`, {
          headers: { accept: "application/json, text/plain, */*", referer: "https://spotifydownload.org/" }
        })

        res = datax.data
        statusOk = res.result.status
        intentos++
        if (statusOk !== 3 && statusOk !== -3) await new Promise(r => setTimeout(r, 3000))
      } catch {
        return { status: false, message: "Error inesperado." }
      }
    }

    if (statusOk !== 3)
      return { status: false, message: "No se pudo convertir el audio." }

    return {
      status: true,
      title: data.result.name,
      duration: data.result.duration_ms,
      cover: data.result.image,
      download: "https://api.fabdl.com" + res.result.download_url
    }
  } catch {
    return { status: false, message: "Error inesperado." }
  }
}

import { downloadTrack2 } from "@nechlophomeriaa/spotifydl"
import axios from "axios"

let handler = async (m, { conn, text }) => {
  if (!text) return conn.reply(m.chat, `🎧 Proporciona un nombre de canción o enlace de Spotify.`, m)

  try {
    await m.react('⌛')

    if (text.includes('open.spotify.com/playlist/')) {
      // Detectamos que es una playlist
      const playlistData = await axios.get(`https://api.spotifydown.com/metadata/playlist/${extraerIDPlaylist(text)}`)
      const tracks = playlistData.data?.tracks?.items

      if (!tracks || tracks.length === 0) {
        await m.react('❌')
        return conn.reply(m.chat, `❌ No se encontraron canciones en la playlist.`, m)
      }

      await m.reply(`🎶 Descargando ${tracks.length} canciones de la playlist...`)

      for (const trackObj of tracks) {
        const track = trackObj.track
        const query = `${track.name} ${track.artists.map(a => a.name).join(' ')}`
        try {
          const downTrack = await downloadTrack2(query)
          const urlspo = await spotifydl(downTrack.url)
          if (!urlspo.status) continue

          const txt = `*Artista:* ${downTrack.artists}\n*Título:* ${downTrack.title}\n*Duración:* ${downTrack.duration}`
          await conn.sendFile(m.chat, downTrack.imageUrl, 'cover.jpg', txt, m)
          await conn.sendMessage(m.chat, {
            audio: { url: urlspo.download },
            fileName: `${downTrack.title}.mp3`,
            mimetype: 'audio/mpeg'
          }, { quoted: m })
        } catch {
          continue // Ignorar errores individuales
        }
      }
    } else {
      // Descarga individual
      const downTrack = await downloadTrack2(text)
      const urlspo = await spotifydl(downTrack.url)
      if (!urlspo.status) return await m.react('❌')

      const txt = `*Artista:* ${downTrack.artists}\n*Título:* ${downTrack.title}\n*Duración:* ${downTrack.duration}`
      await conn.sendFile(m.chat, downTrack.imageUrl, 'cover.jpg', txt, m)
      await conn.sendMessage(m.chat, {
        audio: { url: urlspo.download },
        fileName: `${downTrack.title}.mp3`,
        mimetype: 'audio/mpeg'
      }, { quoted: m })
    }

    await m.react('✅')
  } catch (e) {
    console.log(e)
    await m.react('❌')
  }
}

handler.command = ['playlist']
handler.group = true
export default handler

// Función auxiliar para extraer el ID de la playlist
function extraerIDPlaylist(url) {
  const match = url.match(/playlist\/([a-zA-Z0-9]+)/)
  return match ? match[1] : null
}

async function spotifydl(url) {
  try {
    let maxIntentos = 10
    let intentos = 0
    let statusOk = 0
    let res
    let data

    while (statusOk !== 3 && statusOk !== -3 && intentos < maxIntentos) {
      try {
        const response = await axios.get('https://api.fabdl.com/spotify/get?url=' + url, {
          headers: {
            accept: "application/json, text/plain, */*",
            "accept-language": "en-US,en;q=0.9",
            referer: "https://spotifydownload.org/",
          }
        })
        data = response.data

        const datax = await axios.get(`https://api.fabdl.com/spotify/mp3-convert-task/${data.result.gid}/${data.result.id}`, {
          headers: {
            accept: "application/json, text/plain, */*",
            "accept-language": "en-US,en;q=0.9",
            referer: "https://spotifydownload.org/",
          }
        })
        res = datax.data
        statusOk = res.result.status
        intentos++

        if (statusOk !== 3 && statusOk !== -3) await new Promise(resolve => setTimeout(resolve, 3000))
      } catch (err) {
        return { status: false, message: "Error inesperado.", code: 500 }
      }
    }

    if (statusOk !== 3) return { status: false, message: "No se pudo procesar.", code: 500 }

    return {
      status: true,
      title: data.result.name,
      duration: data.result.duration_ms,
      cover: data.result.image,
      download: "https://api.fabdl.com" + res.result.download_url
    }

  } catch (e) {
    return { status: false, message: "Error inesperado.", code: 500 }
  }
}

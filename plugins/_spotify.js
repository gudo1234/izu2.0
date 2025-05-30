import { downloadTrack2 } from "@nechlophomeriaa/spotifydl"
import axios from "axios"

let handler = async (m, { conn, text }) => {
  if (!text) return conn.reply(m.chat, `🎧 Por favor proporciona el nombre de una canción o enlace de Spotify.`, m)

  try {
    await m.react('⌛')

    // Verificamos si es una playlist
    if (text.includes('open.spotify.com/playlist/')) {
      const playlistID = extraerIDPlaylist(text)
      if (!playlistID) return conn.reply(m.chat, '❌ ID de playlist no válido.', m)

      // Usamos API de spotifydown.com para obtener la lista de canciones
      const playlistRes = await axios.get(`https://api.spotifydown.com/metadata/playlist/${playlistID}`)
      const canciones = playlistRes.data?.tracks?.items
      if (!canciones || canciones.length === 0) return conn.reply(m.chat, '❌ No se encontraron canciones en la playlist.', m)

      await conn.reply(m.chat, `🎶 Descargando ${canciones.length} canciones de la playlist...`, m)

      for (const item of canciones) {
        const cancion = item.track
        const nombre = `${cancion.name} ${cancion.artists.map(a => a.name).join(' ')}`

        try {
          let downTrack = await downloadTrack2(nombre)
          let urlspo = await spotifydl(downTrack.url)
          if (!urlspo.status) continue

          urlspo = urlspo.download
          let txt = `*Artista:* ${downTrack.artists}\n*Título:* ${downTrack.title}\n*Duración:* ${downTrack.duration}`

          await conn.sendFile(m.chat, downTrack.imageUrl, 'cover.jpg', txt, m)
          await conn.sendMessage(m.chat, {
            audio: { url: urlspo },
            fileName: `${downTrack.title}.mp3`,
            mimetype: 'audio/mpeg'
          }, { quoted: m })

        } catch (e) {
          console.log('❌ Error individual al procesar una canción:', nombre)
        }
      }

      return await m.react('✅')
    }

    // Lógica original para una sola canción
    let downTrack = await downloadTrack2(text)
    let urlspo = await spotifydl(downTrack.url)
    if (!urlspo.status) return await m.react('❌')

    urlspo = urlspo.download
    let txt = `*Artista:* ${downTrack.artists}\n*Título:* ${downTrack.title}\n*Duración:* ${downTrack.duration}`
    await conn.sendFile(m.chat, downTrack.imageUrl, 'cover.jpg', txt, m)
    await conn.sendMessage(m.chat, {
      audio: { url: urlspo },
      fileName: `${downTrack.title}.mp3`,
      mimetype: 'audio/mpeg'
    }, { quoted: m })

    return await m.react('✅')

  } catch (e) {
    console.log(e)
    return await m.react('❌')
  }
}

handler.command = ['playlist']
handler.group = true
export default handler

// Extrae el ID de la playlist desde la URL
function extraerIDPlaylist(url) {
  const match = url.match(/playlist\/([a-zA-Z0-9]+)/)
  return match ? match[1] : null
}

// Función para obtener el audio descargable
async function spotifydl(url) {
  try {
    let maxIntentos = 10
    let intentos = 0
    let statusOk = 0
    let res, data

    while (statusOk !== 3 && statusOk !== -3 && intentos < maxIntentos) {
      try {
        const { data: r1 } = await axios.get('https://api.fabdl.com/spotify/get?url=' + url, {
          headers: {
            accept: "application/json, text/plain, */*",
            "accept-language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
            referer: "https://spotifydownload.org/",
          }
        })
        data = r1

        const { data: r2 } = await axios.get(`https://api.fabdl.com/spotify/mp3-convert-task/${data.result.gid}/${data.result.id}`, {
          headers: {
            accept: "application/json, text/plain, */*",
            "accept-language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
            referer: "https://spotifydownload.org/",
          }
        })

        res = r2
        statusOk = res.result.status
        intentos++
        if (statusOk !== 3 && statusOk !== -3) await new Promise(resolve => setTimeout(resolve, 3000))
      } catch (e) {
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

  } catch {
    return { status: false, message: "Error inesperado.", code: 500 }
  }
}

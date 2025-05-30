import { downloadTrack2, getPlaylist } from "@nechlophomeriaa/spotifydl"
import axios from "axios"

let handler = async (m, { conn, text, args, usedPrefix, command }) => {
  if (!text) return conn.reply(m.chat, `🎧 Por favor proporciona el nombre de una canción o un enlace de Spotify.`, m)

  try {
    await m.react('⌛')

    if (text.includes('open.spotify.com/playlist/')) {
      // Es una playlist
      const playlist = await getPlaylist(text)
      if (!playlist || !playlist.length) return await m.react('❌')

      await m.reply(`🎶 Descargando *${playlist.length}* canciones de la playlist...`)

      for (const track of playlist) {
        try {
          const downTrack = await downloadTrack2(track.url)
          const urlspo = await spotifydl(downTrack.url)
          if (!urlspo.status) continue

          const txt = `*Artista:* ${downTrack.artists}\n*Título:* ${downTrack.title}\n*Duración:* ${downTrack.duration}`
          await conn.sendFile(m.chat, downTrack.imageUrl, 'cover.jpg', txt, m)
          await conn.sendMessage(m.chat, {
            audio: { url: urlspo.download },
            fileName: `${downTrack.title}.mp3`,
            mimetype: 'audio/mpeg'
          }, { quoted: m })

        } catch (e) {
          console.log(`❌ Error en canción: ${track.title}`)
          continue
        }
      }

    } else {
      // Es una canción individual
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

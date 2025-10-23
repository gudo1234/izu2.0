import fetch from "node-fetch"
import axios from "axios"
import { downloadTrack2 } from "@nechlophomeriaa/spotifydl"

let handler = async (m, { conn, args }) => {
  if (args.length < 2)
    return m.reply(`${e} Usa el formato correcto:\n*.spt <id> <número>*\n\nEjemplo:\n*.spt a1b2c3 2*`)

  const [searchId, numStr] = args
  const index = parseInt(numStr) - 1

  const results = global.spResultsMap?.get(searchId)
  if (!results) return m.reply(`❌ Los resultados de esta búsqueda ya no existen o expiraron.`)
  if (isNaN(index) || index < 0 || index >= results.length)
    return m.reply(`❌ Número inválido. Usa *.spt <id> <número>* correctamente.`)

  const track = results[index]
  m.react('⬆️')

  // --- PRIMER INTENTO: API DELIRIUS ---
  try {
    const api = `https://delirius-apiofc.vercel.app/download/spotifydl?url=${encodeURIComponent(track.url)}`
    const res = await fetch(api)
    const json = await res.json()

    if (json.status && json.data?.url) {
      m.react('⬇️')
      await conn.sendMessage(
        m.chat,
        {
          audio: { url: json.data.url },
          mimetype: "audio/mpeg",
          fileName: `${track.title}.mp3`,
          contextInfo: {
            externalAdReply: {
              title: track.title,
              body: track.artist,
              thumbnailUrl: track.image,
              mediaType: 2,
              sourceUrl: track.url
            }
          }
        },
        { quoted: m }
      )
      return
    }
    throw new Error("Primer método falló")
  } catch (err) {
    console.log("Primer método falló, intentando método alternativo...")
  }

  // --- SEGUNDO INTENTO: MÉTODO ALTERNATIVO ---
  try {
    m.react('⌛')
    const downTrack = await downloadTrack2(track.url)
    const backup = await spotifydl(track.url)

    if (!backup.status) return m.reply(`❌ No se pudo obtener el audio del método alternativo.`)

    await conn.sendMessage(
      m.chat,
      {
        audio: { url: backup.download },
        mimetype: "audio/mpeg",
        fileName: `${downTrack.title}.mp3`,
        contextInfo: {
          externalAdReply: {
            title: downTrack.title,
            body: downTrack.artists,
            thumbnailUrl: downTrack.imageUrl,
            mediaType: 2,
            sourceUrl: track.url
          }
        }
      },
      { quoted: m }
    )

  } catch (err) {
    console.error(err)
    return m.reply(`⚠️ Error al procesar la descarga.`)
  }
}

handler.command = ['spt', 'spotifydl']
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
          headers: {
            accept: "application/json, text/plain, */*",
            referer: "https://spotifydownload.org/"
          }
        }))

        const datax = await axios.get(`https://api.fabdl.com/spotify/mp3-convert-task/${data.result.gid}/${data.result.id}`, {
          headers: {
            accept: "application/json, text/plain, */*",
            referer: "https://spotifydownload.org/"
          }
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

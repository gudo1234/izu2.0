import fetch from "node-fetch"

let handler = async (m, { conn, args }) => {
  if (!global.spResults) return m.reply(`${e} No hay resultados recientes. Usa primero *.spo <nombre>*`)
  
  const index = parseInt(args[0]) - 1
  if (isNaN(index) || index < 0 || index >= global.spResults.length)
    return m.reply(`${e} Número inválido. Usa *.spotifysearch <número>* según la lista mostrada.`)

  const track = global.spResults[index]
  m.react('⬆️')

  try {
    const api = `https://delirius-apiofc.vercel.app/download/spotifydl?url=${encodeURIComponent(track.url)}`
    const res = await fetch(api)
    const json = await res.json()

    if (!json.status || !json.data || !json.data.url)
      return m.reply(`${e} No se pudo obtener el enlace de descarga desde Spotify.`)
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
  } catch (err) {
    console.error(err)
    await m.reply(`${e} Ocurrió un error al procesar la descarga.`)
  }
}

handler.command = ['spt']
handler.group = true

export default handler

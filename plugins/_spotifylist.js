import fetch from "node-fetch"
import { prepareWAMessageMedia } from "@whiskeysockets/baileys"

let handler = async (m, { conn, text, command, usedPrefix }) => {
  if (!text) return m.reply(`${e} Ingresa el nombre de una canción para buscar en Spotify.\n\nEjemplo:\n*${usedPrefix + command} diles*`)

  try {
    const res = await fetch(`https://delirius-apiofc.vercel.app/search/spotify?q=${encodeURIComponent(text)}&limit=20`)
    const json = await res.json()
    if (!json.status || !json.data || !json.data.length)
      return m.reply(`${e} No se encontraron resultados para tu búsqueda.`)

    const results = json.data
    m.react('🕒')

    const { imageMessage } = await prepareWAMessageMedia(
      { image: { url: results[0].image } },
      { upload: conn.waUploadToServer }
    )

    const sections = [
      {
        title: `🎧 Resultados de Spotify: ${text}`,
        highlight_label: "Selecciona una canción",
        rows: results.map((v) => ({
          header: v.artist,
          title: v.title,
          description: `${v.album} • ${v.duration} • Popularidad ${v.popularity}`,
          id: `.spt ${encodeURIComponent(v.url)}` // <-- guardamos la URL directamente
        }))
      }
    ]

    const buttonParamsJson = JSON.stringify({
      title: "Spotify Search",
      description: "Selecciona una canción para descargar",
      sections
    })

    const interactiveMessage = {
      body: { text: `🎵 Resultados de búsqueda para: *${text}*` },
      footer: { text: "Toca una canción o usa *.spt <url>* para descargar." },
      header: {
        hasMediaAttachment: true,
        imageMessage: imageMessage
      },
      nativeFlowMessage: {
        buttons: [
          {
            name: "single_select",
            buttonParamsJson
          }
        ]
      }
    }

    const message = {
      messageContextInfo: {
        deviceListMetadata: {},
        deviceListMetadataVersion: 2
      },
      interactiveMessage
    }

    await conn.relayMessage(m.chat, { viewOnceMessage: { message } }, {})
  } catch (e) {
    console.error(e)
    await m.reply(`${e} Error al realizar la búsqueda en Spotify.`)
  }
}

handler.command = ['spotifysearch', 'spsearch', 'sps', 'spotify', 'music']
handler.group = true
export default handler

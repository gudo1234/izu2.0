import fetch from "node-fetch"
import { prepareWAMessageMedia } from "@whiskeysockets/baileys"

let handler = async (m, { conn, text, command, usedPrefix }) => {
  if (!text) throw `${e} Ingresa el nombre de una canción para buscar en Spotify.\n\nEjemplo:\n*${usedPrefix + command} twice*`

  try {
    const res = await fetch(`https://delirius-apiofc.vercel.app/search/spotify?q=${encodeURIComponent(text)}&limit=20`)
    const json = await res.json()
    if (!json.status || !json.data || !json.data.length) throw "⚠️ No se encontraron resultados."

    const results = json.data
    const { imageMessage } = await prepareWAMessageMedia(
      { image: { url: results[0].image } },
      { upload: conn.waUploadToServer }
    )

    const sections = [
      {
        title: `Resultados de Spotify: ${text}`,
        highlight_label: "Selecciona una canción",
        rows: results.map((v, i) => ({
          header: `${v.artist}`,
          title: `${v.title}`,
          description: `${v.album} • ${v.duration} • Popularidad ${v.popularity}`,
          id: `.spotify ${v.title}`
        }))
      }
    ]

    const buttonParamsJson = JSON.stringify({
      title: "Spotify Search",
      description: "Selecciona una canción para descargar o escuchar",
      sections
    })

    const interactiveMessage = {
      body: { text: `🎧 Resultados de búsqueda para: *${text}*` },
      footer: { text: "Responde con .spt <número> para descargar o reproducir" },
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
    throw "❌ Error al realizar la búsqueda en Spotify."
  }
}

handler.command = ['spo']
handler.group = true

export default handler

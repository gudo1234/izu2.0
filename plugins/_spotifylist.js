/*import fetch from "node-fetch"
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
          id: `.spotify ${i + 1}`
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

export default handler*/

import fetch from "node-fetch"
import { prepareWAMessageMedia } from "@whiskeysockets/baileys"

let handler = async (m, { conn, text, command, usedPrefix }) => {
  if (!text) throw `🎧 Ingresa el nombre de una canción para buscar en Spotify.\n\nEjemplo:\n*${usedPrefix + command} twice*`

  try {
    const res = await fetch(`https://delirius-apiofc.vercel.app/search/spotify?q=${encodeURIComponent(text)}&limit=20`)
    const json = await res.json()
    if (!json.status || !json.data || !json.data.length) throw "⚠️ No se encontraron resultados."

    const results = json.data
    global.spResults = results // guardar globalmente para .spt

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
          id: `.spt ${i + 1}`
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

//----------------------------------------------------
// Segundo comando que procesa lo seleccionado
//----------------------------------------------------
export async function handler2(m, { conn, args }) {
  if (!global.spResults) throw "⚠️ No hay resultados recientes. Usa primero *.spo <nombre>*"
  const index = parseInt(args[0]) - 1
  if (isNaN(index) || index < 0 || index >= global.spResults.length)
    throw "⚠️ Número inválido. Usa *.spt <número>* según la lista."

  const track = global.spResults[index]
  await conn.reply(m.chat, `🎶 Descargando *${track.title}* de *${track.artist}*...`, m)

  try {
    const url = `https://delirius-apiofc.vercel.app/download/spotifydl?url=${encodeURIComponent(track.url)}`
    const res = await fetch(url)
    const json = await res.json()

    if (!json.status || !json.data || !json.data.url) throw "❌ No se pudo descargar el audio."

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
    await conn.reply(m.chat, "❌ Error al procesar la descarga.", m)
  }
}

handler2.command = ['spt']
handler2.group = true

export { handler2 as sptHandler }

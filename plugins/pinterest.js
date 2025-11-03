import axios from 'axios'
import fetch from 'node-fetch'
import { URL } from 'url'
import baileys from '@whiskeysockets/baileys'

async function sendAlbumMessage(conn, jid, medias, options = {}) {
  if (typeof jid !== "string") throw new TypeError(`jid must be string`)

  for (const media of medias) {
    if (!media.type || (media.type !== "image" && media.type !== "video")) {
      throw new TypeError(`media.type must be "image" or "video", received: ${media.type}`)
    }
    if (!media.data || (!media.data.url && !Buffer.isBuffer(media.data))) {
      throw new TypeError(`media.data must be object with url or buffer`)
    }
  }

  if (medias.length < 2) throw new RangeError("Minimum 2 media")

  const caption = options.text || options.caption || ""
  const delay = !isNaN(options.delay) ? options.delay : 500
  delete options.text; delete options.caption; delete options.delay

  const album = baileys.generateWAMessageFromContent(
    jid,
    {
      messageContextInfo: {},
      albumMessage: {
        expectedImageCount: medias.filter(m => m.type === "image").length,
        expectedVideoCount: medias.filter(m => m.type === "video").length,
        ...(options.quoted ? {
          contextInfo: {
            remoteJid: options.quoted.key.remoteJid,
            fromMe: options.quoted.key.fromMe,
            stanzaId: options.quoted.key.id,
            participant: options.quoted.key.participant || options.quoted.key.remoteJid,
            quotedMessage: options.quoted.message,
          }
        } : {})
      },
    },
    {}
  )

  await conn.relayMessage(album.key.remoteJid, album.message, { messageId: album.key.id })

  for (let i = 0; i < medias.length; i++) {
    const { type, data } = medias[i]
    const msg = await baileys.generateWAMessage(
      album.key.remoteJid,
      { [type]: data, ...(i === 0 ? { caption } : {}) },
      { upload: conn.waUploadToServer }
    )
    msg.message.messageContextInfo = { messageAssociation: { associationType: 1, parentMessageKey: album.key } }
    await conn.relayMessage(msg.key.remoteJid, msg.message, { messageId: msg.key.id })
    await baileys.delay(delay)
  }

  return album
}

// 🔹 API de Pinterest Dorratz (solo imágenes)
const pins = async (query) => {
  try {
    const res = await axios.get(`https://api.dorratz.com/v2/pinterest?q=${encodeURIComponent(query)}`)
    if (Array.isArray(res.data) && res.data.length > 0) {
      return res.data.map(i => ({
        image_large_url: i.image_large_url,
        image_medium_url: i.image_medium_url,
        image_small_url: i.image_small_url
      }))
    }
    return []
  } catch (error) {
    console.error('Error API Dorratz:', error)
    return []
  }
}

let handler = async (m, { text, conn, command, usedPrefix }) => {
  const e = '📌'
  if (!text) return conn.reply(m.chat, `${e} Ingresa texto o URL de Pinterest.\n\nEjemplo:\n${usedPrefix + command} gatitos\n${usedPrefix + command} https://pin.it/1OqQom3ma`, m)

  await m.react('🕒')

  try {
    // Si es URL → Usamos la API Ultraplus para videos
    if (/^https?:\/\//.test(text)) {
      try {
        const apiUrl = `https://api-nv.ultraplus.click/api/video/dl/pinterestv2?url=${encodeURIComponent(text)}&key=2yLJjTeqXudWiWB8`
        const res = await fetch(apiUrl)
        const data = await res.json()

        if (!data.status || !data.result?.video?.formats?.mp4) {
          return conn.reply(m.chat, '❌ No se pudo obtener el video, intenta con otro enlace.', m)
        }

        const result = data.result
        const info = result.info
        const user = result.user
        const video = result.video
        const tags = result.tags?.join(', ') || 'Sin etiquetas'

        let caption = `
🎬 *PINTEREST VIDEO DOWNLOADER*
────────────────────
👤 *Usuario:* ${user.fullName || user.username}
🔗 *Perfil:* @${user.username}
💾 *Guardados:* ${result.stats?.saves || 0}
🕓 *Duración:* ${video.duration}
📅 *Fecha:* ${info.date}
🖋️ *Descripción:* ${info.altText || 'Sin descripción'}
🏷️ *Etiquetas:* ${tags}
`.trim()

        await conn.sendMessage(m.chat, {
          video: { url: video.formats.mp4 },
          mimetype: 'video/mp4',
          caption
        }, { quoted: m })

        await m.react('✅')
        return
      } catch (err) {
        console.error('Error API Ultraplus:', err)
        await m.react('❌')
        return conn.reply(m.chat, '❌ Error al procesar el video. Verifica el enlace o intenta más tarde.', m)
      }
    }

    // Si es texto → búsqueda de imágenes (Dorratz)
    const results = await pins(text)
    if (!results || results.length === 0) return conn.reply(m.chat, `No se encontraron resultados para "${text}".`, m)

    const maxImages = Math.min(results.length, 15)
    const medias = []
    for (let i = 0; i < maxImages; i++) {
      medias.push({
        type: 'image',
        data: { url: results[i].image_large_url || results[i].image_medium_url || results[i].image_small_url }
      })
    }

    await sendAlbumMessage(conn, m.chat, medias, {
      caption: `${e} _Resultados de Pinterest para:_ *${text}*`,
      quoted: m
    })

    await m.react('✅')

  } catch (error) {
    console.error('Error general Pinterest:', error)
    await m.react('❌')
    m.reply(`❌ Error: ${error.message}`)
  }
}

handler.command = ['pin', 'pinterest', 'pinimg', 'pinvid', 'pinterestdl', 'pinvideo']
handler.group = true

export default handler

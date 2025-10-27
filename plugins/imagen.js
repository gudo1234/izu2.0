import fetch from 'node-fetch'
import { googleImage } from '@bochilteam/scraper'
import {
  generateWAMessageFromContent,
  generateWAMessage,
  delay
} from '@whiskeysockets/baileys'

async function sendAlbumMessage(conn, jid, medias, options = {}) {
  if (typeof jid !== "string") throw new TypeError("jid must be string")
  if (!Array.isArray(medias) || medias.length < 2) throw new RangeError("Minimum 2 media required")

  const caption = options.caption || ""
  const wait = !isNaN(options.delay) ? options.delay : 500

  const album = generateWAMessageFromContent(
    jid,
    {
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
          },
        } : {})
      }
    },
    {}
  )

  await conn.relayMessage(album.key.remoteJid, album.message, { messageId: album.key.id })

  for (let i = 0; i < medias.length; i++) {
    const { type, data } = medias[i]
    try {
      const msg = await generateWAMessage(
        album.key.remoteJid,
        { [type]: data, ...(i === 0 ? { caption } : {}) },
        { upload: conn.waUploadToServer }
      )
      msg.message.messageContextInfo = { messageAssociation: { associationType: 1, parentMessageKey: album.key } }
      await conn.relayMessage(msg.key.remoteJid, msg.message, { messageId: msg.key.id })
      await delay(wait)
    } catch (err) {
      console.warn(`[WARN IMG] No se pudo enviar la imagen ${i + 1}:`, err.message)
      continue
    }
  }

  return album
}

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    conn.reply(m.chat, `${e} _*Uso Correcto:*_ ${usedPrefix + command} carros`, m, null, rcanal)
    return
  }

  m.react('🕒')

  try {
    const res = await googleImage(text)
    const results = await res
    if (!results || !Array.isArray(results) || results.length === 0)
      throw new Error('No se encontraron imágenes')

    const maxImages = Math.min(results.length, 15)
    const medias = results.slice(0, maxImages).map(url => ({
      type: 'image',
      data: { url }
    }))

    await sendAlbumMessage(conn, m.chat, medias, {
      caption: `${e} *Resultado De:* ${text}`,
      quoted: m
    })

    m.react('✅')

  } catch (e) {
    console.error('[ERROR IMG]', e)
    m.reply(`❌ Ocurrió un error al obtener las imágenes.\n\n${e.message}`)
  }
}

handler.command = ['image', 'imagen']
handler.group = true

export default handler

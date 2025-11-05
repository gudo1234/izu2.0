import fetch from 'node-fetch'
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
      console.warn(`[WARN VIDEO] No se pudo enviar el video ${i + 1}:`, err.message)
      continue
    }
  }

  return album
}

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    conn.reply(m.chat, `${e} Uso correcto: ${usedPrefix + command} <busqueda>`, m)
    return
  }

  m.react('🕒')
conn.reply(m.chat, `${e} Espere un momento...`, m, rcanal)
  try {
    const response = await fetch(`https://apis-starlights-team.koyeb.app/starlight/tiktoksearch?text=${encodeURIComponent(text)}`)
    const json = await response.json()

    if (!json || !json.data || json.data.length === 0)
      throw new Error('No se encontraron videos')

    const videos = json.data.slice(0, 10)
    const medias = videos.map(v => ({
      type: 'video',
      data: { url: v.nowm }
    }))

    await sendAlbumMessage(conn, m.chat, medias, {
      caption: `${e} *_Resultados de TikTok para:_* ${text}`,
      quoted: m
    })

    m.react('✅')

  } catch (e) {
    console.error('[ERROR TIKTOK]', e)
    m.reply(`${e} Ocurrió un error al obtener los videos.\n\n${e.message}`)
  }
}

handler.command = ['tiktoks', 'ttsearch', 'tiktoksearch']
handler.group = true

export default handler

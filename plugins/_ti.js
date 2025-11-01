import Starlights from '@StarlightsTeam/Scraper'
import fetch from 'node-fetch'
import { generateWAMessage, generateWAMessageFromContent, prepareWAMessageMedia } from '@whiskeysockets/baileys'

/* 🔹 Función para enviar álbum de videos */
conn.sendAlbumMessage = async function (jid, medias, options = {}) {
  const caption = options.text || options.caption || ""

  const album = generateWAMessageFromContent(jid, {
    albumMessage: {
      expectedImageCount: medias.filter(m => m.type === "image").length,
      expectedVideoCount: medias.filter(m => m.type === "video").length,
      ...(options.quoted ? {
        contextInfo: {
          remoteJid: options.quoted.key.remoteJid,
          fromMe: options.quoted.key.fromMe,
          stanzaId: options.quoted.key.id,
          participant: options.quoted.key.participant || options.quoted.key.remoteJid,
          quotedMessage: options.quoted.message
        }
      } : {})
    }
  }, { quoted: options.quoted })

  await conn.relayMessage(album.key.remoteJid, album.message, { messageId: album.key.id })

  // Envío instantáneo de todos los medios
  await Promise.all(medias.map(async (media, index) => {
    const { type, data } = media
    try {
      const mediaMessage = await generateWAMessage(album.key.remoteJid, {
        [type]: data,
        ...(index === 0 ? { caption } : {})
      }, { upload: conn.waUploadToServer })

      mediaMessage.message.messageContextInfo = {
        messageAssociation: {
          associationType: 1,
          parentMessageKey: album.key
        }
      }

      await conn.relayMessage(mediaMessage.key.remoteJid, mediaMessage.message, {
        messageId: mediaMessage.key.id
      })
    } catch (err) {
      console.log(`❌ Error enviando medio del álbum:`, err)
    }
  }))

  return album
}

/* 🔹 Comando TikTok (solo envía si hay 8 videos exactos) */
let handler = async (m, { conn, text, args, usedPrefix, command }) => {
  const input = text || args[0]
  const isTikTokUrl = url => /(?:https?:\/\/)?(?:www\.)?(?:vm|vt|t)?\.?tiktok\.com\/[^\s]+/gi.test(url)
  const e = '🎵'

  if (!input) {
    return conn.reply(m.chat, `${e} Ingresa el *nombre del video* o un *enlace* de TikTok.\n\n🔎 _Ejemplo:_\n> *${usedPrefix + command}* Lady Gaga\n📹 _Ejemplo de descarga:_\n> *${usedPrefix + command}* https://vm.tiktok.com/ZMShLNoJe/`, m)
  }

  await m.react('🕓')

  // 🔹 Si es URL directa
  if (isTikTokUrl(input)) {
    try {
      const data = await Starlights.tiktokdl(input)
      if (!data?.dl_url) throw '❌ No se pudo obtener el enlace de descarga.'
      const txt = `*乂  T I K T O K  -  D O W N L O A D*\n\n✩ *Título:* ${data.title}\n✩ *Autor:* ${data.author}\n✩ *Duración:* ${data.duration}s\n✩ *Vistas:* ${data.views}\n✩ *Likes:* ${data.likes}`
      await conn.sendFile(m.chat, data.dl_url, 'tiktok.mp4', txt, m)
      await m.react('✅')
    } catch (err) {
      console.error('❌ Error en descarga directa:', err)
      await m.react('✖️')
    }
    return
  }

  // 🔹 Si es búsqueda por texto
  try {
    const results = await Starlights.tiktokSearch(input)
    if (!results || results.length < 8) {
      await m.react('✖️')
      return // No se envía nada si no hay al menos 8
    }

    const selected = results.slice(0, 8)
    const albumMedias = []

    // Descargas simultáneas
    await Promise.all(selected.map(async (res, i) => {
      try {
        const vid = await Starlights.tiktokdl(res.url)
        if (vid?.dl_url) albumMedias.push({ type: 'video', data: { url: vid.dl_url } })
      } catch { }
    }))

    // Solo enviar si hay exactamente 8 válidos
    if (albumMedias.length === 8) {
      const caption = `🎶 *Se muestran 8 resultados de TikTok*`
      await conn.sendAlbumMessage(m.chat, albumMedias, { caption, quoted: m })
      await m.react('✅')
    } else {
      await m.react('✖️')
      // No envía texto ni error si son menos de 8
    }
  } catch (err) {
    console.error('❌ Error general:', err)
    await m.react('✖️')
  }
}

handler.command = ['ti']
handler.group = true
export default handler

import Starlights from '@StarlightsTeam/Scraper'
import fetch from 'node-fetch'
import { generateWAMessage, generateWAMessageFromContent, prepareWAMessageMedia } from '@whiskeysockets/baileys'

/* === 🔹 Función para enviar álbum de imágenes o videos === */
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

  for (const [index, media] of medias.entries()) {
    const { type, data } = media

    let mediaMessage
    try {
      mediaMessage = await generateWAMessage(album.key.remoteJid, {
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
      console.log(`❌ Error al agregar medio al álbum:`, err)
    }
  }

  return album
}

/* === 🔹 Comando TikTok con álbum de hasta 8 videos === */
let handler = async (m, { conn, text, args, usedPrefix, command }) => {
  const input = text || args[0]
  const isTikTokUrl = url => /(?:https?:\/\/)?(?:www\.)?(?:vm|vt|t)?\.?tiktok\.com\/[^\s]+/gi.test(url)
  const e = '🎵'

  if (!input) {
    return conn.reply(m.chat, `${e} Ingresa el *nombre del video* o un *enlace* de TikTok.\n\n🔎 _Ejemplo:_\n> *${usedPrefix + command}* Lady Gaga\n📹 _Ejemplo de descarga:_\n> *${usedPrefix + command}* https://vm.tiktok.com/ZMShLNoJe/`, m)
  }

  await m.react('🕓')

  if (isTikTokUrl(input)) {
    try {
      const data = await Starlights.tiktokdl(input)
      if (!data?.dl_url) throw '❌ No se pudo obtener el enlace de descarga.'

      const { title, author, duration, views, likes, comment, share, published, downloads, dl_url } = data
      const txt = `*乂  T I K T O K  -  D O W N L O A D*\n\n` +
        `✩ *Título:* ${title}\n✩ *Autor:* ${author}\n✩ *Duración:* ${duration}s\n✩ *Vistas:* ${views}\n✩ *Likes:* ${likes}\n✩ *Comentarios:* ${comment}\n✩ *Compartidos:* ${share}\n✩ *Publicado:* ${published}\n✩ *Descargas:* ${downloads}`

      await conn.sendFile(m.chat, dl_url, 'tiktok.mp4', txt, m)
      await m.react('✅')
    } catch (e) {
      console.error('❌ Error en descarga por URL:', e)
      await m.react('✖️')
      return conn.reply(m.chat, `${e} Ocurrió un error al descargar el video de TikTok.`, m)
    }
    return
  }

  // 🔹 Modo búsqueda → enviar álbum de 8 resultados
  try {
    const results = await Starlights.tiktokSearch(input)
    if (!results || results.length === 0) {
      await m.react('✖️')
      return conn.reply(m.chat, `${e} No se encontraron resultados para tu búsqueda en TikTok.`, m)
    }

    const maxResults = 8
    const selected = results.slice(0, maxResults)
    const albumMedias = []

    for (const res of selected) {
      try {
        const video = await Starlights.tiktokdl(res.url)
        if (video?.dl_url) {
          albumMedias.push({ type: 'video', data: { url: video.dl_url } })
        }
      } catch (err) {
        console.log(`Error al obtener video:`, err)
      }
    }

    if (albumMedias.length > 0) {
      const caption = `🎶 *Se muestran resultados de TikTok (${albumMedias.length})*`
      await conn.sendAlbumMessage(m.chat, albumMedias, { caption, quoted: m })
      await m.react('✅')
    } else {
      await m.react('✖️')
      await conn.reply(m.chat, `${e} No se pudo descargar ningún video de los resultados.`, m)
    }

  } catch (err) {
    console.error('❌ Error en búsqueda:', err)
    await m.react('✖️')
    await conn.reply(m.chat, `${err} Ocurrió un error al buscar videos en TikTok.`, m)
  }
}

handler.command = ['ti']
handler.group = true
export default handler

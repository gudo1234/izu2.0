import Starlights from '@StarlightsTeam/Scraper'
import fetch from 'node-fetch'
import { generateWAMessage, generateWAMessageFromContent, prepareWAMessageMedia } from '@whiskeysockets/baileys'

/* === 🔹 Función para enviar álbum de imágenes o videos === */
conn.sendAlbumMessage = async function (jid, medias, options = {}) {
  let img, video
  const caption = options.text || options.caption || ""

  const album = generateWAMessageFromContent(jid, {
    albumMessage: {
      expectedImageCount: medias.filter(media => media.type === "image").length,
      expectedVideoCount: medias.filter(media => media.type === "video").length,
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

  await conn.relayMessage(album.key.remoteJid, album.message, {
    messageId: album.key.id
  })

  for (const media of medias) {
    const { type, data } = media

    if (/^https?:\/\//i.test(data.url)) {
      try {
        const response = await fetch(data.url)
        const contentType = response.headers.get('content-type')

        if (/^image\//i.test(contentType)) {
          img = await prepareWAMessageMedia({ image: { url: data.url } }, { upload: conn.waUploadToServer })
        } else if (/^video\//i.test(contentType)) {
          video = await prepareWAMessageMedia({ video: { url: data.url } }, { upload: conn.waUploadToServer })
        }
      } catch (error) {
        throw new Error(`Error al obtener el tipo MIME: ${error.message}`)
      }
    }

    if (!generateWAMessage) throw new Error('generateWAMessage no está definido')

    const mediaMessage = await generateWAMessage(album.key.remoteJid, {
      [type]: data,
      ...(media === medias[0] ? { caption } : {})
    }, {
      upload: conn.waUploadToServer
    })

    mediaMessage.message.messageContextInfo = {
      messageAssociation: {
        associationType: 1,
        parentMessageKey: album.key
      }
    }

    await conn.relayMessage(mediaMessage.key.remoteJid, mediaMessage.message, {
      messageId: mediaMessage.key.id
    })
  }

  return album
}

/* === 🔹 Comando de TikTok con álbum de videos === */
let handler = async (m, { conn, text, args, usedPrefix, command }) => {
  const input = text || args[0]
  const isTikTokUrl = url => /(?:https?:\/\/)?(?:www\.)?(?:vm|vt|t)?\.?tiktok\.com\/[^\s]+/gi.test(url)
  const e = '🎵' // Emoji decorativo

  if (!input) {
    return conn.reply(m.chat, `${e} Ingresa el *nombre del video* o un *enlace* de TikTok.\n\n🔎 _Ejemplo de búsqueda:_\n> *${usedPrefix + command}* Lady Gaga\n\n📹 _Ejemplo de descarga:_\n> *${usedPrefix + command}* https://vm.tiktok.com/ZMShLNoJe/`, m)
  }

  await m.react('🕓')

  if (isTikTokUrl(input)) {
    // 🔹 Descarga directa por URL
    try {
      const data = await Starlights.tiktokdl(input)
      if (!data?.dl_url) throw '❌ No se pudo obtener el enlace de descarga.'

      const { title, author, duration, views, likes, comment, share, published, downloads, dl_url } = data
      const txt = `*乂  T I K T O K  -  D O W N L O A D*\n\n` +
        `✩ *Título:* ${title}\n` +
        `✩ *Autor:* ${author}\n` +
        `✩ *Duración:* ${duration} segundos\n` +
        `✩ *Vistas:* ${views}\n` +
        `✩ *Likes:* ${likes}\n` +
        `✩ *Comentarios:* ${comment}\n` +
        `✩ *Compartidos:* ${share}\n` +
        `✩ *Publicado:* ${published}\n` +
        `✩ *Descargas:* ${downloads}`

      await conn.sendFile(m.chat, dl_url, 'tiktok.mp4', txt, m)
      await m.react('✅')
    } catch (e) {
      console.error('❌ Error en descarga por URL:', e)
      await m.react('✖️')
      return conn.reply(m.chat, `${e} Ocurrió un error al descargar el video de TikTok.`, m)
    }
    return
  }

  // 🔹 Modo búsqueda por texto → álbum de resultados
  try {
    const results = await Starlights.tiktokSearch(input)
    if (!results || results.length === 0) {
      await m.react('✖️')
      return conn.reply(m.chat, `${e} No se encontraron resultados para tu búsqueda en TikTok.`, m)
    }

    const maxResults = 5
    const selected = results.slice(0, maxResults)
    const albumMedias = []

    for (const res of selected) {
      try {
        const video = await Starlights.tiktokdl(res.url)
        if (!video?.dl_url) continue
        albumMedias.push({ type: 'video', data: { url: video.dl_url } })
      } catch (err) {
        console.log(`Error al obtener video: ${err}`)
      }
    }

    if (albumMedias.length > 0) {
      const caption = `${e} *Se muestran resultados de TikTok*`
      await conn.sendAlbumMessage(m.chat, albumMedias, { caption, quoted: m })
      await m.react('✅')
    } else {
      await m.react('✖️')
      await conn.reply(m.chat, `${e} No se pudo descargar ningún video de los resultados encontrados.`, m)
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

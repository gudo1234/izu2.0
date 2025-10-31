import fetch from 'node-fetch'
import { URL } from 'url'

let handler = async (m, { text, conn, command, usedPrefix }) => {
  if (!/^https?:\/\//.test(text))
    return conn.reply(m.chat, `✳️ Ejemplo:\n*${usedPrefix + command}* https://qu-leo.pro/1052-2/`, m)

  m.react('🕒') // Inicio

  try {
    const res = await fetch(text)
    const contentType = res.headers.get('content-type') || ''

    // ==============================
    // 🔹 ARCHIVO DIRECTO (imagen/audio/video/pdf)
    // ==============================
    if (/image|audio|video|application\/pdf/i.test(contentType)) {
      const ext =
        contentType.includes('image') ? '.jpg'
        : contentType.includes('audio') ? '.mp3'
        : contentType.includes('video') ? '.mp4'
        : '.bin'

      await m.react('⚙️')
      await conn.sendMessage(m.chat, {
        document: { url: text },
        fileName: 'media' + ext,
        mimetype: contentType,
        caption: text
      }, { quoted: m })
      await m.react('✅')
      return
    }

    // ==============================
    // 🔹 DETECCIÓN DE DOMINIOS ESPECÍFICOS
    // ==============================
    const ytRegex = /(?:youtube\.com|youtu\.be)/i
    const videoSites = [
      'instagram', 'facebook', 'tiktok', 'x.com', 'twitter',
      'mediafire', 'github', 'pinterest', 'terabox'
    ]

    // ==============================
    // 📄 LEER HTML SI NO ES DIRECTO
    // ==============================
    const html = await res.text()

    // ==============================
    // 🔍 EXTRAER POSIBLES ENLACES
    // ==============================
    const regexAll = /(https?:\/\/[^\s"'<>]+?\.(jpg|jpeg|png|gif|webp|svg|mp3|m4a|ogg|wav|mp4|webm|mov|avi|mkv|pdf)(\?[^\s"'<>]*)?)/gi
    const foundLinks = [...html.matchAll(regexAll)].map(v => v[0])

    const tagSrcRegex = /<(img|video|audio|source)[^>]+src=["']([^"']+)["']/gi
    const srcMatches = [...html.matchAll(tagSrcRegex)].map(v => v[2])

    const iframeRegex = /<iframe[^>]+src=["']([^"']+)["']/gi
    const iframeMatches = [...html.matchAll(iframeRegex)].map(v => v[1])

    const allCandidates = [...foundLinks, ...srcMatches, ...iframeMatches].filter(Boolean)

    // ==============================
    // 🧩 DETECTAR URL PRINCIPAL
    // ==============================
    let fileUrl
    for (let url of allCandidates) {
      if (!url) continue
      let fullUrl = url.startsWith('http') ? url : new URL(url, text).href
      if (/\.(mp4|webm|mov|avi|mkv|mp3)(\?|$)/i.test(fullUrl)) {
        fileUrl = fullUrl
        break
      }
    }

    // ==============================
    // ⚙️ PREPARAR ENVÍO
    // ==============================
    if (fileUrl) {
      await m.react('⚙️')

      // Detectar tipo de envío
      if (ytRegex.test(text)) {
        // YouTube → audio
        await conn.sendMessage(m.chat, {
          document: { url: fileUrl },
          fileName: 'audio.mp3',
          mimetype: 'audio/mpeg',
          caption: '🎵 Audio extraído de YouTube'
        }, { quoted: m })
      } else if (videoSites.some(site => text.includes(site))) {
        // Video normal
        await conn.sendMessage(m.chat, {
          document: { url: fileUrl },
          fileName: 'video.mp4',
          mimetype: 'video/mp4',
          caption: '🎬 Video descargado'
        }, { quoted: m })
      } else {
        // Otros → enviar como documento genérico
        await conn.sendMessage(m.chat, {
          document: { url: fileUrl },
          fileName: 'media.mp4',
          mimetype: 'video/mp4',
          caption: fileUrl
        }, { quoted: m })
      }

      await m.react('✅')
      return
    }

    // ==============================
    // ⚠️ SIN RESULTADOS
    // ==============================
    return m.reply('⚠️ No se encontró ningún recurso multimedia válido en la página.')

  } catch (e) {
    console.error(e)
    m.reply(`❌ Error: ${e.message}`)
  }
}

handler.command = ['fetch', 'get']
handler.group = true
export default handler

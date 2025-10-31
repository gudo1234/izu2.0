import fetch from 'node-fetch'
import { URL } from 'url'

let handler = async (m, { text, conn, command, usedPrefix }) => {
  if (!/^https?:\/\//.test(text))
    return conn.reply(m.chat, `⚠️ Ejemplo:\n*${usedPrefix + command}* https://qu-leo.pro/1052-2/`, m)

  m.react('🕒')

  try {
    const res = await fetch(text)
    const contentType = res.headers.get('content-type') || ''

    // ==============================
    // 🖼️ DETECCIÓN DIRECTA (Imagen / Audio / Video / Documento)
    // ==============================
    if (/image|audio|video|application\/pdf/i.test(contentType)) {
      const ext =
        contentType.includes('image') ? '.jpg'
        : contentType.includes('audio') ? '.mp3'
        : contentType.includes('video') ? '.mp4'
        : '.bin'

      const buffer = await res.buffer()
      m.react('✅')
      return conn.sendFile(m.chat, buffer, 'file' + ext, text, m, null, false, { mimetype: contentType })
    }

    // ==============================
    // 📄 SI NO ES UN ARCHIVO DIRECTO, LEER EL HTML
    // ==============================
    const html = await res.text()

    // Buscar posibles recursos multimedia
    const regexAll = /(https?:\/\/[^\s"'<>]+?\.(jpg|jpeg|png|gif|webp|svg|mp3|m4a|ogg|wav|mp4|webm|mov|avi|mkv|pdf)(\?[^\s"'<>]*)?)/gi
    const foundLinks = [...html.matchAll(regexAll)].map(v => v[0])

    // Extraer de etiquetas HTML
    const tagSrcRegex = /<(img|video|audio|source)[^>]+src=["']([^"']+)["']/gi
    const srcMatches = [...html.matchAll(tagSrcRegex)].map(v => v[2])

    // Extraer de iframes
    const iframeRegex = /<iframe[^>]+src=["']([^"']+)["']/gi
    const iframeMatches = [...html.matchAll(iframeRegex)].map(v => v[1])

    const allCandidates = [...foundLinks, ...srcMatches, ...iframeMatches].filter(Boolean)

    // ==============================
    // 🔎 ELEGIR EL PRIMER RECURSO VÁLIDO
    // ==============================
    let fileUrl
    for (let url of allCandidates) {
      if (!url) continue
      let fullUrl = url.startsWith('http') ? url : new URL(url, text).href
      if (/\.(jpg|jpeg|png|gif|webp|svg|mp3|m4a|ogg|wav|mp4|webm|mov|avi|mkv|pdf)/i.test(fullUrl)) {
        fileUrl = fullUrl
        break
      }
    }

    // ==============================
    // 📦 DESCARGA Y ENVÍO
    // ==============================
    if (fileUrl) {
      const fileRes = await fetch(fileUrl)
      const type = fileRes.headers.get('content-type') || 'application/octet-stream'
      const buffer = await fileRes.buffer()

      m.react('✅')
      const ext =
        type.includes('image') ? '.jpg'
        : type.includes('audio') ? '.mp3'
        : type.includes('video') ? '.mp4'
        : '.bin'

      return conn.sendFile(m.chat, buffer, 'media' + ext, fileUrl, m, null, false, { mimetype: type })
    }

    // ==============================
    // 📃 SI NO ENCUENTRA NADA MULTIMEDIA
    // ==============================
    return m.reply(html.slice(0, 1500) + '...')

  } catch (e) {
    console.error(e)
    m.reply(`❌ Error: ${e.message}`)
  }
}

handler.command = ['fetch', 'get']
handler.group = true
export default handler

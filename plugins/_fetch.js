import fetch from 'node-fetch'
import { format } from 'util'

let handler = async (m, { text, conn, command, usedPrefix }) => {
  if (!/^https?:\/\//.test(text))
    return conn.reply(m.chat, `⚠️ Ejemplo: *${usedPrefix + command}* https://qu-leo.pro/1052-2/`, m)

  m.react('🕒')

  try {
    const res = await fetch(text)
    const html = await res.text()
    const contentType = res.headers.get('content-type') || ''

    // ==============================
    // 🔍 DETECCIÓN DE VIDEOS OCULTOS
    // ==============================

    // 1. Buscar enlaces directos a formatos comunes de video
    const videoRegex = /(https?:\/\/[^\s"'<>]+?\.(mp4|webm|mov|avi|mkv)(\?[^\s"'<>]*)?)/gi
    const foundVideos = [...html.matchAll(videoRegex)].map(v => v[0])

    // 2. Buscar etiquetas <video src=""> o <source src="">
    const tagRegex = /<video[^>]*src=["']([^"']+)["']/i
    const sourceRegex = /<source[^>]*src=["']([^"']+)["']/gi
    const tagMatch = html.match(tagRegex)
    const srcMatches = [...html.matchAll(sourceRegex)].map(v => v[1])

    // 3. Buscar URLs dentro de iframes
    const iframeRegex = /<iframe[^>]+src=["']([^"']+)["']/gi
    const iframeMatches = [...html.matchAll(iframeRegex)].map(v => v[1])

    // 4. Unir todas las posibles URLs de video
    const allCandidates = [...foundVideos, ...srcMatches, tagMatch?.[1], ...iframeMatches].filter(Boolean)

    // 5. Buscar entre los candidatos la primera URL que realmente parezca un video válido
    let videoUrl
    for (let url of allCandidates) {
      // Si contiene dominios sospechosos o cadenas de video
      if (/\.(mp4|webm|mov|avi|mkv)/i.test(url) || /player|cdn|stream|video/i.test(url)) {
        videoUrl = url.startsWith('http') ? url : new URL(url, text).href
        break
      }
    }

    // ==============================
    // 🎬 DESCARGA Y ENVÍO DEL VIDEO
    // ==============================
    if (videoUrl) {
      const videoRes = await fetch(videoUrl)
      const vidType = videoRes.headers.get('content-type') || 'video/mp4'
      const buffer = await videoRes.buffer()

      m.react('✅')
      return conn.sendFile(m.chat, buffer, 'video.mp4', videoUrl, m, null, false, { mimetype: vidType })
    }

    // ==============================
    // 🎧 SI NO HAY VIDEO, PERO ES AUDIO
    // ==============================
    if (/audio/.test(contentType)) {
      const buffer = await res.buffer()
      m.react('✅')
      return conn.sendFile(m.chat, buffer, 'audio.mp3', text, m, null, false, { mimetype: 'audio/mpeg' })
    }

    // ==============================
    // 📃 SI NO HAY VIDEO NI AUDIO, MOSTRAR HTML
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

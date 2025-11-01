import fetch from 'node-fetch'
import { URL } from 'url'

let handler = async (m, { text, conn, command, usedPrefix }) => {
  if (!/^https?:\/\//.test(text))
    return conn.reply(m.chat, `✳️ Ejemplo:\n*${usedPrefix + command}* https://qu-leo.pro/1052-2/`, m)

  m.react('🕒')

  try {
    const res = await fetch(text)
    const contentType = res.headers.get('content-type') || ''

    // ==============================
    // 🔹 DETECCIÓN DIRECTA (Imagen / Audio / Video / PDF)
    // ==============================
    if (/image|audio|video/i.test(contentType)) {
      const type = contentType.split('/')[0]

      m.react('✅')
      if (type === 'image') return conn.sendMessage(m.chat, { image: { url: text }, caption: text }, { quoted: m })
      if (type === 'audio') return conn.sendMessage(m.chat, { audio: { url: text }, mimetype: contentType, caption: text }, { quoted: m })
      if (type === 'video') return conn.sendMessage(m.chat, { video: { url: text }, mimetype: contentType, caption: text }, { quoted: m })
    }

    const html = await res.text()

    // ==============================
    // 🔞 DETECCIÓN DE SITIOS PARA ADULTOS
    // ==============================
    const adultSites = [
      'xvideos', 'xnxx', 'pornhub', 'redtube', 'spankbang',
      'youjizz', 'youporn', 'tube8', 'tnaflix', 'eporner',
      'jav', 'rule34', 'hclips', 'beeg'
    ]
    const isAdult = adultSites.some(site => text.includes(site))

    // ==============================
    // 🔍 DETECCIÓN DE PINS / TWITTER / X
    // ==============================
    let pinterestMatch = text.match(/https?:\/\/(www\.)?pinterest\.[a-z]+\/pin\/(\d+)/)
    let twitterMatch = text.match(/https?:\/\/(www\.)?twitter\.com\/[^\/]+\/status\/\d+/)

    if (pinterestMatch) {
      const pinId = pinterestMatch[2]
      // Intentar obtener JSON de la publicación
      try {
        const pinApi = `https://api.pinterest.com/v3/pidgets/pins/info/?pin_ids=${pinId}`
        const pinRes = await fetch(pinApi)
        const pinJson = await pinRes.json()
        const pinData = pinJson.data[pinId]
        if (pinData && pinData.videos && pinData.videos.video_list) {
          // Elegir el video más grande disponible
          const videoKeys = Object.keys(pinData.videos.video_list)
          const videoUrl = pinData.videos.video_list[videoKeys[0]].url
          return conn.sendMessage(m.chat, { video: { url: videoUrl }, caption: `📌 Pinterest Pin` }, { quoted: m })
        } else if (pinData && pinData.images && pinData.images.orig && pinData.images.orig.url) {
          return conn.sendMessage(m.chat, { image: { url: pinData.images.orig.url }, caption: `📌 Pinterest Pin` }, { quoted: m })
        } else {
          return conn.sendMessage(m.chat, { text: `📌 Pinterest: ${text}` }, { quoted: m })
        }
      } catch {
        return conn.sendMessage(m.chat, { text: `📌 Pinterest: ${text}` }, { quoted: m })
      }
    }

    if (twitterMatch) {
      return conn.sendMessage(m.chat, { text: `🐦 Twitter/X: ${twitterMatch[0]}` }, { quoted: m })
    }

    // ==============================
    // 🔍 EXTRAER ENLACES POSIBLES
    // ==============================
    const regexAll = /(https?:\/\/[^\s"'<>]+?\.(jpg|jpeg|png|gif|webp|svg|mp3|m4a|ogg|wav|mp4|webm|mov|avi|mkv)(\?[^\s"'<>]*)?)/gi
    const foundLinks = [...html.matchAll(regexAll)].map(v => v[0])

    const tagSrcRegex = /<(img|video|audio|source)[^>]+src=["']([^"']+)["']/gi
    const srcMatches = [...html.matchAll(tagSrcRegex)].map(v => v[2])

    const iframeRegex = /<iframe[^>]+src=["']([^"']+)["']/gi
    const iframeMatches = [...html.matchAll(iframeRegex)].map(v => v[1])

    const allCandidates = [...foundLinks, ...srcMatches, ...iframeMatches].filter(Boolean)

    // ==============================
    // 🧩 BUSCAR EL PRIMER VIDEO / IMAGE / AUDIO
    // ==============================
    let fileUrl
    let fileType = ''
    for (let url of allCandidates) {
      if (!url) continue
      let fullUrl = url.startsWith('http') ? url : new URL(url, text).href

      if (/\.(mp4|webm|mov|avi|mkv)(\?|$)/i.test(fullUrl)) {
        fileUrl = fullUrl
        fileType = 'video'
        break
      }
      if (/\.(jpg|jpeg|png|gif|webp)(\?|$)/i.test(fullUrl) && !fileUrl) {
        fileUrl = fullUrl
        fileType = 'image'
      }
      if (/\.(mp3|m4a|ogg|wav)(\?|$)/i.test(fullUrl) && !fileUrl) {
        fileUrl = fullUrl
        fileType = 'audio'
      }
    }

    // ==============================
    // 📦 ENVÍO SEGÚN TIPO Y ADULTOS
    // ==============================
    if (fileUrl) {
      m.react('✅')
      if (fileType === 'video' && isAdult) {
        return conn.sendMessage(m.chat, {
          document: { url: fileUrl },
          fileName: 'video_adulto.mp4',
          mimetype: 'video/mp4',
          caption: '🔞 Video para adultos'
        }, { quoted: m })
      }
      if (fileType === 'video') return conn.sendMessage(m.chat, { video: { url: fileUrl }, mimetype: 'video/mp4', caption: fileUrl }, { quoted: m })
      if (fileType === 'image') return conn.sendMessage(m.chat, { image: { url: fileUrl }, caption: fileUrl }, { quoted: m })
      if (fileType === 'audio') return conn.sendMessage(m.chat, { audio: { url: fileUrl }, mimetype: 'audio/mpeg', caption: fileUrl }, { quoted: m })
    }

    // ==============================
    // 📜 SI NO HAY NADA → ENVIAR HTML O JSON COMO TEXTO
    // ==============================
    m.react('📝')
    return conn.sendMessage(m.chat, { text: `📄 Contenido de la página:\n\n${html.slice(0, 4000)}` }, { quoted: m })

  } catch (e) {
    console.error(e)
    m.reply(`❌ Error: ${e.message}`)
  }
}

handler.command = ['fetch', 'get']
handler.group = true
export default handler

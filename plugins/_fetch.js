import fetch from 'node-fetch'
import { URL } from 'url'

let handler = async (m, { text, conn, command, usedPrefix }) => {
  if (!/^https?:\/\//.test(text))
    return conn.reply(m.chat, `${e} Ingresa cualquier URL de la web que contenga HTML o enlaces de video, incluyendo sitios como Pinterest, X (Twitter) o páginas para adultos.\n\n${s} Ejemplo:\n*${usedPrefix + command}* https://qu-leo.pro/1052-2/`, m)

  await m.react('🕒')

  try {
    const res = await fetch(text)
    const contentType = res.headers.get('content-type') || ''

    // Si es un archivo directo
    if (/image|audio|video/i.test(contentType)) {
      const type = contentType.split('/')[0]

      if (type === 'image') return conn.sendMessage(m.chat, { image: { url: text }, caption: text }, { quoted: m })
      if (type === 'audio') return conn.sendMessage(m.chat, { audio: { url: text }, mimetype: contentType, caption: text }, { quoted: m })
      if (type === 'video') return conn.sendMessage(m.chat, { video: { url: text }, mimetype: contentType, caption: text }, { quoted: m })
    }

    const html = await res.text()

    const adultSites = [
      'xvideos', 'xnxx', 'pornhub', 'redtube', 'spankbang',
      'youjizz', 'youporn', 'tube8', 'tnaflix', 'eporner',
      'jav', 'rule34', 'hclips', 'beeg'
    ]
    const isAdult = adultSites.some(site => text.includes(site))

    // Pinterest
    let pinterestMatch = text.match(/https?:\/\/(www\.)?pinterest\.[a-z]+\/pin\/(\d+)/)
    if (pinterestMatch) {
      const pinId = pinterestMatch[2]
      try {
        const pinApi = `https://api.pinterest.com/v3/pidgets/pins/info/?pin_ids=${pinId}`
        const pinRes = await fetch(pinApi)
        const pinJson = await pinRes.json()
        const pinData = pinJson.data[pinId]
        if (pinData?.videos?.video_list) {
          const videoKeys = Object.keys(pinData.videos.video_list)
          const videoUrl = pinData.videos.video_list[videoKeys[0]].url
          await conn.sendMessage(m.chat, { video: { url: videoUrl }, caption: `${e} Pinterest Pin` }, { quoted: m })
        } else if (pinData?.images?.orig?.url) {
          await conn.sendMessage(m.chat, { image: { url: pinData.images.orig.url }, caption: `${e} Pinterest Pin` }, { quoted: m })
        } else {
          await conn.sendMessage(m.chat, { text: `${e} Pinterest: ${text}` }, { quoted: m })
        }
      } catch {
        await conn.sendMessage(m.chat, { text: `${e} Pinterest: ${text}` }, { quoted: m })
      }
    }

    // Twitter/X
    let twitterMatch = text.match(/https?:\/\/(www\.)?twitter\.com\/[^\/]+\/status\/\d+/)
    if (twitterMatch) {
      try {
        // Usamos Nitter como proxy para obtener contenido público
        const nitterUrl = twitterMatch[0].replace('twitter.com', 'nitter.net')
        const twRes = await fetch(nitterUrl)
        const twHtml = await twRes.text()
        const videoRegex = /<source src="([^"]+)" type="video\/mp4"/
        const videoMatch = twHtml.match(videoRegex)
        if (videoMatch) {
          await conn.sendMessage(m.chat, { video: { url: videoMatch[1] }, caption: `${e} Twitter/X Video` }, { quoted: m })
        } else {
          await conn.sendMessage(m.chat, { text: `🐦 Twitter/X: ${twitterMatch[0]}` }, { quoted: m })
        }
      } catch {
        await conn.sendMessage(m.chat, { text: `🐦 Twitter/X: ${twitterMatch[0]}` }, { quoted: m })
      }
    }

    // Detección general de archivos
    const regexAll = /(https?:\/\/[^\s"'<>]+?\.(jpg|jpeg|png|gif|webp|svg|mp3|m4a|ogg|wav|mp4|webm|mov|avi|mkv)(\?[^\s"'<>]*)?)/gi
    const foundLinks = [...html.matchAll(regexAll)].map(v => v[0])

    const tagSrcRegex = /<(img|video|audio|source)[^>]+src=["']([^"']+)["']/gi
    const srcMatches = [...html.matchAll(tagSrcRegex)].map(v => v[2])

    const iframeRegex = /<iframe[^>]+src=["']([^"']+)["']/gi
    const iframeMatches = [...html.matchAll(iframeRegex)].map(v => v[1])

    const allCandidates = [...foundLinks, ...srcMatches, ...iframeMatches].filter(Boolean)

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

    if (fileUrl) {
      if (fileType === 'video' && isAdult) {
        await conn.sendMessage(m.chat, {
          document: { url: fileUrl },
          fileName: 'video_adulto.mp4',
          mimetype: 'video/mp4',
          caption: text
        }, { quoted: m })
      } else if (fileType === 'video') {
        await conn.sendMessage(m.chat, { video: { url: fileUrl }, mimetype: 'video/mp4', caption: fileUrl }, { quoted: m })
      } else if (fileType === 'image') {
        await conn.sendMessage(m.chat, { image: { url: fileUrl }, caption: fileUrl }, { quoted: m })
      } else if (fileType === 'audio') {
        await conn.sendMessage(m.chat, { audio: { url: fileUrl }, mimetype: 'audio/mpeg', caption: fileUrl }, { quoted: m })
      }
    } else {
      await conn.sendMessage(m.chat, { text: `${html.slice(0, 4000)}` }, { quoted: m })
    }

    await m.react('✅')

  } catch (e) {
    console.error(e)
    await m.react('❌')
    m.reply(`Error: ${e.message}`)
  }
}

handler.command = ['fetch', 'get']
handler.group = true
export default handler

import fetch from 'node-fetch'
import { URL } from 'url'

let handler = async (m, { text, conn, command, usedPrefix }) => {
  if (!/^https?:\/\//.test(text))
    return conn.reply(m.chat, `✳️ Ejemplo:\n*${usedPrefix + command}* https://qu-leo.pro/1052-2/`, m)

  // 🔹 Reacción inicial: proceso iniciado
  m.react('🕒')

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

      // ⚙️ Reacción: listo para enviar
      await m.react('⚙️')

      // Enviar al instante sin descargar
      await conn.sendMessage(m.chat, {
        document: { url: text },
        fileName: 'media' + ext,
        mimetype: contentType,
        caption: text
      }, { quoted: m })

      // ✅ Reacción: enviado
      await m.react('✅')
      return
    }

    // ==============================
    // 📄 LEER HTML SI NO ES DIRECTO
    // ==============================
    const html = await res.text()

    // ==============================
    // 🔞 DETECTAR SITIOS ADULTOS / STREAMING
    // ==============================
    const adultSites = [
      'xvideos', 'xnxx', 'pornhub', 'redtube', 'spankbang',
      'youjizz', 'youporn', 'tube8', 'tnaflix', 'eporner',
      'jav', 'rule34', 'hclips', 'beeg', 'googleusercontent',
      'share.google'
    ]
    const isAdult = adultSites.some(site => text.includes(site))

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
    // 🧩 ENCONTRAR PRIMER VIDEO VÁLIDO
    // ==============================
    let fileUrl
    for (let url of allCandidates) {
      if (!url) continue
      let fullUrl = url.startsWith('http') ? url : new URL(url, text).href
      if (/\.(mp4|webm|mov|avi|mkv)(\?|$)/i.test(fullUrl)) {
        fileUrl = fullUrl
        break
      }
    }

    // ==============================
    // 📦 ENVIAR COMO DOCUMENTO AL INSTANTE
    // ==============================
    if (fileUrl) {
      await m.react('⚙️') // Reacción antes de enviar

      await conn.sendMessage(m.chat, {
        document: { url: fileUrl },
        fileName: 'video.mp4',
        mimetype: 'video/mp4',
        caption: isAdult
          ? '🔞 Video detectado y enviado como documento.'
          : fileUrl
      }, { quoted: m })

      await m.react('✅') // Reacción final: enviado
      return
    }

    // ==============================
    // 📜 SIN RESULTADOS
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

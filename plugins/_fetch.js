import fetch from 'node-fetch'
import { URL } from 'url'

let handler = async (m, { text, conn, command, usedPrefix }) => {
  if (!/^https?:\/\//.test(text))
    return conn.reply(m.chat, `
✳️ Uso del comando *${usedPrefix + command}*:

📌 Ejemplos:
${usedPrefix + command} https://www.youtube.com/watch?v=dQw4w9WgXcQ
${usedPrefix + command} https://twitter.com/user/status/123456789
${usedPrefix + command} https://www.xnxx.com/video-xxxx
${usedPrefix + command} https://www.pinterest.com/pin/xxxx

🔹 Qué hace:
1️⃣ Archivos directos (.jpg, .png, .mp4, .mp3, .pdf, etc.) → se envían tal cual.
2️⃣ YouTube → intenta enviar audio (mp3) si hay URL directa.
3️⃣ X/Twitter y Pinterest → video normal o documento según archivo.
4️⃣ Sitios de videos para adultos → siempre video normal (mp4), se ignoran imágenes.
5️⃣ Otros enlaces → documento genérico.
🕒 Reacciones: 🕒 Inicio → ⚙️ Preparando → ✅ Enviado
`, m)

  m.react('🕒') // Inicio

  try {
    const adultSites = ['xnxx','xvideos','pornhub','redtube','youporn','tnaflix','spankbang','porntube']
    const videoSites = ['x.com','twitter','pinterest']

    // Regex para detectar archivos
    const directFileRegex = /\.(mp3|mp4|webm|mkv|avi|mov|jpg|jpeg|png|gif|pdf)(\?|$)/i

    // ==============================
    // Archivos directos
    // ==============================
    if (directFileRegex.test(text)) {
      let ext = text.split('.').pop().split('?')[0].toLowerCase()

      // Si es sitio adulto, forzar solo video
      if (adultSites.some(site => text.includes(site)) && !/(mp4|webm|mov|avi|mkv)/i.test(ext)) {
        return m.reply('⚠️ Este enlace de sitio adulto no es un video directo. Usa un enlace que apunte al archivo de video (.mp4, .webm, .mov, etc.)')
      }

      let mimetype = 'video/mp4'
      if (ext === 'mp3') mimetype = 'audio/mpeg'
      else if (['jpg','jpeg','png','gif'].includes(ext)) mimetype = 'image/jpeg'
      else if (ext === 'pdf') mimetype = 'application/pdf'

      await m.react('⚙️')
      await conn.sendMessage(m.chat, {
        document: { url: text },
        fileName: 'media.' + ext,
        mimetype,
        caption: text
      }, { quoted: m })
      await m.react('✅')
      return
    }

    // ==============================
    // Descargar página y buscar archivos
    // ==============================
    const res = await fetch(text)
    const html = await res.text()

    // Regex para todos los archivos
    const fileRegex = /(https?:\/\/[^\s"'<>]+?\.(mp4|webm|mov|avi|mkv|mp3|m4a|ogg|wav|pdf)(\?[^\s"'<>]*)?)/gi
    let foundLinks = [...html.matchAll(fileRegex)].map(v => v[0])

    // Para sitios adultos, eliminar links que no sean videos
    if (adultSites.some(site => text.includes(site))) {
      foundLinks = foundLinks.filter(url => /\.(mp4|webm|mov|avi|mkv)/i.test(url))
    }

    if (!foundLinks.length) {
      return m.reply('⚠️ No se encontró ningún recurso multimedia válido en la página.')
    }

    const fileUrl = foundLinks[0]
    const ext = fileUrl.split('.').pop().split('?')[0].toLowerCase()

    let mimetype = 'video/mp4'
    if (ext === 'mp3') mimetype = 'audio/mpeg'
    else if (ext === 'pdf') mimetype = 'application/pdf'

    await m.react('⚙️')
    await conn.sendMessage(m.chat, {
      document: { url: fileUrl },
      fileName: 'media.' + ext,
      mimetype,
      caption: fileUrl
    }, { quoted: m })
    await m.react('✅')

  } catch (e) {
    console.error(e)
    m.reply(`❌ Error: ${e.message}`)
  }
}

handler.command = ['fetch', 'get']
handler.group = true
export default handler

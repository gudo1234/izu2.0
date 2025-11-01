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
1️⃣ Archivos directos (.jpg, .png, .mp4, .mp3, .pdf, etc.) → Se envían tal cual.
2️⃣ Detecta cualquier URL que termine en un archivo multimedia y lo envía inmediatamente.
3️⃣ Sitios conocidos de video/adultos → video normal.
4️⃣ YouTube → intenta audio, si hay URL directa.
🕒 Reacciones: Inicio 🕒 → Preparando ⚙️ → Enviado ✅
`, m)

  m.react('🕒') // Inicio

  try {
    // Intentar descargar directamente
    let isDirect = /\.(mp3|mp4|webm|mkv|avi|mov|jpg|jpeg|png|gif|pdf)(\?|$)/i.test(text)

    if (isDirect) {
      const type = text.endsWith('.mp3') ? 'audio/mpeg'
        : text.endsWith('.jpg') || text.endsWith('.jpeg') || text.endsWith('.png') || text.endsWith('.gif') ? 'image/jpeg'
        : text.endsWith('.pdf') ? 'application/pdf'
        : 'video/mp4'

      await m.react('⚙️')
      await conn.sendMessage(m.chat, {
        document: { url: text },
        fileName: 'media' + text.slice(text.lastIndexOf('.')),
        mimetype: type,
        caption: text
      }, { quoted: m })
      await m.react('✅')
      return
    }

    // ==============================
    // Descargar la página y buscar URLs de archivos
    // ==============================
    const res = await fetch(text)
    const html = await res.text()

    // Buscar cualquier enlace que termine en archivos multimedia
    const fileRegex = /(https?:\/\/[^\s"'<>]+?\.(mp4|webm|mov|avi|mkv|mp3|m4a|ogg|wav|jpg|jpeg|png|gif|pdf)(\?[^\s"'<>]*)?)/gi
    const foundLinks = [...html.matchAll(fileRegex)].map(v => v[0])

    if (!foundLinks.length) {
      return m.reply('⚠️ No se encontró ningún recurso multimedia válido en la página.')
    }

    // Tomar el primer archivo válido
    const fileUrl = foundLinks[0]
    const ext = fileUrl.split('.').pop().split('?')[0].toLowerCase()
    const mimetype = ext.includes('mp3') ? 'audio/mpeg'
      : ['jpg','jpeg','png','gif'].includes(ext) ? 'image/jpeg'
      : ext === 'pdf' ? 'application/pdf'
      : 'video/mp4'

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

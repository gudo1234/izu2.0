import fetch from "node-fetch"
import fs from "fs"
import path from "path"

let handler = async (m, { conn, text, usedPrefix, command }) => {
  try {
    if (!text && !m.quoted) throw `✳️ Ingresa un texto o responde a un video.\n\nEjemplo:\n*${usedPrefix + command}* Edar 💫`

    // Si el mensaje citado tiene video
    const q = m.quoted ? m.quoted : m
    const mime = (q.msg || q).mimetype || ''
    const isVideo = /video/.test(mime)

    await m.react('🌀')

    if (isVideo) {
      // --- VIDEO CON EFECTO NEÓN (Delirius) ---
      let media = await q.download()
      let form = new FormData()
      form.append('file', media, 'video.mp4')

      const urlAPI = `https://api.deliriusapi.workers.dev/api/tools/video-neon?apikey=delirius`
      const res = await fetch(urlAPI, { method: 'POST', body: form })

      if (!res.ok) throw '⚠️ Error al generar video (Delirius)'
      const buffer = await res.arrayBuffer()
      const filePath = path.join('./tmp', `${Date.now()}_neon.mp4`)
      fs.writeFileSync(filePath, Buffer.from(buffer))

      await conn.sendMessage(m.chat, { video: { url: filePath }, caption: '✨ Video neón generado con Delirius' }, { quoted: m })
      await m.react('✅')
      fs.unlinkSync(filePath)
    } else {
      // --- IMAGEN CON TEXTO (Dorratz) ---
      let texto = text || q.text
      if (!texto) throw `✳️ Ingresa un texto para generar el arte.`

      const res = await fetch(`https://api.dorratz.com/api/gfx1?text=${encodeURIComponent(texto)}&apikey=dorratz`)
      if (!res.ok) throw '⚠️ Error al generar imagen (Dorratz)'
      const buffer = await res.arrayBuffer()
      const filePath = path.join('./tmp', `${Date.now()}_gfx.jpg`)
      fs.writeFileSync(filePath, Buffer.from(buffer))

      await conn.sendFile(m.chat, filePath, 'gfx.jpg', `✨ Arte generado con Dorratz`, m)
      await m.react('✅')
      fs.unlinkSync(filePath)
    }

  } catch (err) {
    console.error(err)
    await m.reply('❌ Ocurrió un error al generar el arte.')
    await m.react('❌')
  }
}

handler.help = ['neon <texto> o responde a un video']
handler.tags = ['tools']
handler.command = ['neon']

export default handler

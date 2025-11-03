import fetch from 'node-fetch'

let handler = async (m, { conn, args, text }) => {
  if (!text) return m.reply(`🧷 Ingresa el enlace de Pinterest.\n\nEjemplo:\n*.pindl https://pin.it/1OqQom3ma*`)
  
  try {
    const apiUrl = `https://api-nv.ultraplus.click/api/video/dl/pinterestv2?url=${encodeURIComponent(text)}&key=2yLJjTeqXudWiWB8`
    const res = await fetch(apiUrl)
    const data = await res.json()

    if (!data.status) return m.reply('❌ No se pudo obtener el video, intenta con otro enlace.')

    const result = data.result
    const info = result.info
    const user = result.user
    const video = result.video
    const tags = result.tags?.join(', ') || 'Sin etiquetas'

    let caption = `
🎬 *PINTEREST VIDEO DOWNLOADER*
────────────────────
👤 *Usuario:* ${user.fullName || user.username}
🔗 *Perfil:* @${user.username}
💾 *Guardados:* ${result.stats.saves}
🕓 *Duración:* ${video.duration}
📅 *Fecha:* ${info.date}
🖋️ *Descripción:* ${info.altText || 'Sin descripción'}
🏷️ *Etiquetas:* ${tags}
`.trim()

    await conn.sendMessage(m.chat, {
      video: { url: video.formats.mp4 },
      mimetype: 'video/mp4',
      caption
    }, { quoted: m })

  } catch (err) {
    console.error(err)
    m.reply('❌ Error al procesar el video, puede que el enlace sea inválido o la API no responda.')
  }
}

handler.command = ['pi']
handler.group = true
export default handler

import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) throw `✳️ Ingresa un enlace de Pinterest.\n\nEjemplo:\n${usedPrefix + command} https://pin.it/2Vflx5O`

  await m.react('🌀')
  try {
    // --- 1️⃣ Intentar con API de Delirius (para video) ---
    const delirius = await fetch(`https://api.delirius.store/download/pinterestdl?url=${encodeURIComponent(text)}`)
    const data1 = await delirius.json()

    if (data1?.status && data1.data?.download?.url) {
      let info = data1.data
      let caption = `🎀 *Pinterest Downloader*\n\n📌 *Título:* ${info.title || 'Sin título'}\n👤 *Autor:* ${info.author_name || '-'}\n📅 *Subido:* ${info.upload || '-'}\n🔗 *Fuente:* ${info.source || text}`

      await conn.sendMessage(m.chat, {
        video: { url: info.download.url },
        caption,
        mimetype: 'video/mp4'
      }, { quoted: m })

      await m.react('✅')
      return
    }

    // --- 2️⃣ Si falla o no es video → usar Dorratz (para imagen) ---
    const dorratz = await fetch(`https://api.dorratz.com/api/downloader/pinterest?url=${encodeURIComponent(text)}&apikey=dorratz`)
    const data2 = await dorratz.json()

    if (data2?.status && data2.result?.url) {
      await conn.sendMessage(m.chat, {
        image: { url: data2.result.url },
        caption: `✨ *Imagen descargada de Pinterest*\n🔗 ${text}`
      }, { quoted: m })

      await m.react('✅')
      return
    }

    throw '⚠️ No se pudo obtener contenido del enlace.'

  } catch (e) {
    console.error(e)
    await m.reply('❌ Error al descargar el contenido de Pinterest.')
    await m.react('❌')
  }
}

handler.help = ['pinterest <url>']
handler.tags = ['downloader']
handler.command = ['pinterest', 'pin']

export default handler

import fetch from 'node-fetch'

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`🧠 *Uso correcto:*\n> ${usedPrefix + command} <link de Pinterest>`)

  try {
    await m.react('💭')

    const apiUrl = `https://api.delirius.store/download/pinterestdl?url=${encodeURIComponent(text)}`
    const res = await fetch(apiUrl)
    const json = await res.json()

    if (!json.status || !json.data || !json.data.download?.url) {
      return m.reply('❌ No se pudo obtener el video de Pinterest.', m, fake)
    }

    const info = json.data
    const title = info.title || 'Video de Pinterest'
    const description = info.description || ''
    const thumbnail = info.thumbnail
    const videoUrl = info.download.url

    // Mensaje informativo antes de enviar el video
    let messageText = `🎬 *Título:* ${title}\n` +
                      `👤 *Autor:* ${info.author_name || info.username}\n` +
                      `📅 *Subido:* ${info.upload}\n` +
                      `🔗 *Fuente:* ${info.source}\n\n` +
                      `${description}`

    await m.reply(messageText, m, fake)

    // Enviar video
    await conn.sendMessage(m.chat, {
      video: { url: videoUrl },
      caption: `🎬 *${title}*`,
      thumbnail: thumbnail ? { url: thumbnail } : undefined,
    }, { quoted: m, mimetype: 'video/mp4' })

    await m.react('✅')

  } catch (e) {
    console.error(e)
    await m.react('❌')
    await m.reply('❌ Ocurrió un error al descargar el video de Pinterest.', m, fake)
  }
}

handler.command = ['pi']
handler.group = true
export default handler

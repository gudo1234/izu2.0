import fetch from 'node-fetch'

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return conn.reply(m.chat, `🧠 *Uso correcto:*\n> ${usedPrefix + command} <link de Pinterest>`, m, fake)

  try {
    await m.react && m.react('💭')

    const apiUrl = `https://api.delirius.store/download/pinterestdl?url=${encodeURIComponent(text)}`
    const res = await fetch(apiUrl)
    const json = await res.json()

    if (!json.status || !json.data || !json.data.download?.url) {
      return conn.reply(m.chat, '❌ No se pudo obtener el video de Pinterest.', m, fake)
    }

    const info = json.data
    const title = info.title || 'Video de Pinterest'
    const description = info.description || ''
    const videoUrl = info.download.url
    const thumbnail = info.thumbnail

    // Mensaje de información
    const messageText = `🎬 *Título:* ${title}\n` +
                        `👤 *Autor:* ${info.author_name || info.username}\n` +
                        `📅 *Subido:* ${info.upload}\n` +
                        `🔗 *Fuente:* ${info.source}\n\n` +
                        `${description}`

    await conn.reply(m.chat, messageText, m, fake)

    // Enviar el video directamente como archivo mp4
    await conn.sendMessage(m.chat, {
      video: { url: videoUrl },
      caption: `🎬 *${title}*`,
      thumbnail: thumbnail ? { url: thumbnail } : undefined,
    }, { quoted: m, mimetype: 'video/mp4' })

    await m.react && m.react('✅')

  } catch (e) {
    console.error(e)
    await m.react && m.react('❌')
    await conn.reply(m.chat, '❌ Ocurrió un error al descargar el video de Pinterest.', m, fake)
  }
}

handler.command = ['pin']
handler.group = true
export default handler

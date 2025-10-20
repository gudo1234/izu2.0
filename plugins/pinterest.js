import fetch from 'node-fetch'

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text)
    return conn.reply(m.chat, `🧠 *Uso correcto:*\n> ${usedPrefix + command} <link o palabra clave de Pinterest>`, m, fake)

  await m.react('💭')

  const pinterestUrlRegex = /^https?:\/\/(www\.)?(pinterest\.[a-z.]+\/pin\/|pin\.it\/)/i

  try {
    // Si es un enlace de Pinterest
    if (pinterestUrlRegex.test(text)) {
      let url = text.trim()

      // Resolver redirección si el link es de pin.it
      if (url.includes('pin.it')) {
        try {
          const head = await fetch(url, { method: 'HEAD', redirect: 'manual' })
          const location = head.headers.get('location')
          if (location) url = location
        } catch (err) {
          console.log('No se pudo resolver el pin.it:', err)
        }
      }

      // Intentar descargar con API Delirius
      const apiUrl = `https://api.delirius.store/download/pinterestdl?url=${encodeURIComponent(url)}`
      const res = await fetch(apiUrl)
      const json = await res.json()

      if (!json.status || !json.data) throw new Error('No se pudo obtener datos del pin.')

      const info = json.data
      const title = info.title || 'Pin de Pinterest'
      const description = info.description || ''
      const mediaUrl = info.download?.url || info.image || info.video || info.media
      if (!mediaUrl) throw new Error('No se encontró contenido descargable.')

      const caption = `${info.video ? '🎬' : '🖼️'} *${title}*\n${description ? `📝 ${description}\n` : ''}🔗 *Fuente:* ${url}`

      await conn.sendFile(m.chat, mediaUrl, 'pinterest.mp4', caption, m, null, rcanal)
      await m.react('✅')
      return
    }

    // Si el texto no es URL → búsqueda de imágenes
    const res = await fetch(`https://api.dorratz.com/v2/pinterest?q=${encodeURIComponent(text)}`)
    const data = await res.json()

    if (!Array.isArray(data) || data.length === 0)
      return conn.reply(m.chat, `❌ No se encontraron imágenes para: *${text}*`, m, fake)

    const results = data.slice(0, 15)
    let first = true

    for (const item of results) {
      const url = item.image_large_url
      if (!url) continue

      if (first) {
        await conn.sendFile(m.chat, url, 'thumb.jpg', `🔍 Resultados para: *${text}*`, m, null, rcanal)
        first = false
      } else {
        await conn.sendMessage(m.chat, { image: { url } }, { quoted: m })
      }
    }

    await m.react('✅')
  } catch (err) {
    console.error(err)
    await m.react('❌')
    await conn.reply(m.chat, '❌ Ocurrió un error al procesar el enlace o la búsqueda.', m, fake)
  }
}

handler.command = ['pin', 'pinterest', 'pinvid', 'pinimg', 'pinterestvid', 'pindl', 'pinterestdl']
handler.group = true
export default handler

import fetch from 'node-fetch'

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text)
    return conn.reply(m.chat, `🧠 *Uso correcto:*\n> ${usedPrefix + command} <link o palabra clave de Pinterest>`, m, fake)

  await conn.sendMessage(m.chat, { react: { text: '💭', key: m.key } })

  const pinterestUrlRegex = /^https?:\/\/(www\.)?(pinterest\.[a-z.]+\/pin\/|pin\.it\/)/i

  try {
    // Si es un enlace directo de Pinterest
    if (pinterestUrlRegex.test(text)) {
      try {
        // Primer intento con API Agatz
        const res = await fetch(`https://api.agatz.xyz/api/pinterest?url=${encodeURIComponent(text)}`)
        const json = await res.json()

        if (json?.data?.result) {
          await conn.sendFile(m.chat, json.data.result, 'pinterest.mp4', `🔗 *Fuente:* ${text}`, m, null, rcanal)
          await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
          return
        }
        throw new Error('Fallo la API Agatz')
      } catch {
        // Si falla, usar API Delirius como respaldo
        const apiUrl = `https://api.delirius.store/download/pinterestdl?url=${encodeURIComponent(text)}`
        const res2 = await fetch(apiUrl)
        const json2 = await res2.json()

        if (!json2.status || !json2.data || !json2.data.download?.url)
          throw new Error('No se pudo obtener el video.')

        const info = json2.data
        const title = info.title || 'Video de Pinterest'
        const description = info.description || ''
        const videoUrl = info.download.url

        const caption = `🎬 *${title}*\n${description ? `📝 ${description}\n` : ''}\n🔗 *Fuente:* ${text}`

        await conn.sendFile(m.chat, videoUrl, 'pinterest.mp4', caption, m, null, rcanal)
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
        return
      }
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

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
  } catch (err) {
    console.error(err)
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    await conn.reply(m.chat, '❌ Ocurrió un error al procesar el enlace o la búsqueda.', m, fake)
  }
}

handler.command = ['pin', 'pinterest', 'pinvid', 'pinimg', 'pinterestvid', 'pindl', 'pinterestdl']
handler.group = true
export default handler

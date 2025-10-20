import fetch from 'node-fetch'

const handler = async (m, { conn, text, usedPrefix, command }) => {

  const e = '✦' // puedes reemplazar por tu emoji o prefijo decorativo

  if (!text) return m.reply(`${e} *Ingresa un enlace de Pinterest o una palabra clave para buscar.*`)

  conn.sendMessage(m.chat, { react: { text: "🕒", key: m.key } })

  // Regex para detectar enlaces válidos de Pinterest
  const pinterestUrlRegex = /^https?:\/\/(www\.)?(pinterest\.[a-z.]+\/pin\/|pin\.it\/)/i

  if (pinterestUrlRegex.test(text)) {
    // Si es un enlace directo a un pin
    try {
      const api = `https://api.delirius.store/download/pinterestdl?url=${encodeURIComponent(text)}`
      const res = await fetch(api)
      const json = await res.json()

      if (!json?.status || !json?.data?.download?.url)
        throw `${e} No se pudo obtener el contenido del enlace.`

      const data = json.data
      const url = data.download.url
      const type = data.download.type

      let caption = `
> ✦ *Título:* ${data.title || '-'}
> ✦ *Autor:* ${data.author_name || '-'} (${data.username || ''})
> ✦ *Descripción:* ${data.description || '-'}
> ✦ *Subido:* ${data.upload || '-'}
> ✦ *Fuente:* ${data.source || '-'}
> ✦ *Tipo:* ${type}
      `.trim()

      if (type === 'video') {
        await conn.sendFile(m.chat, url, 'pinterest.mp4', caption, m, null, { quoted: m })
      } else {
        await conn.sendFile(m.chat, url, 'pinterest.jpg', caption, m, null, { quoted: m })
      }

    } catch (err) {
      console.error(err)
      m.reply(`${e} Hubo un error al procesar el enlace.`)
    }
  } else {
    // Si es una búsqueda por palabra clave
    try {
      const res = await fetch(`https://api.dorratz.com/v2/pinterest?q=${encodeURIComponent(text)}`)
      const data = await res.json()

      if (!Array.isArray(data) || data.length === 0) {
        return m.reply(`${e} No se encontraron imágenes para: *${text}*`)
      }

      const results = data.slice(0, 15)
      let first = true

      for (const item of results) {
        const url = item.image_large_url
        if (!url) continue

        if (first) {
          await conn.sendFile(m.chat, url, "thumb.jpg", `${e} Resultados para: *${text}*`, m, null, { quoted: m })
          first = false
        } else {
          await conn.sendMessage(m.chat, { image: { url } }, { quoted: m })
        }
      }
    } catch (err) {
      console.error(err)
      m.reply(`${e} Ocurrió un error al buscar imágenes.`)
    }
  }

  conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
}

handler.command = ['pin', 'pinterest', 'pinvid', 'pinimg', 'pinterestvid', 'pindl', 'pinterestdl']
handler.group = true
export default handler

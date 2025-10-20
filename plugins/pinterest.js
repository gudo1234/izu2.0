import fetch from 'node-fetch'

const handler = async (m, { conn, text }) => {
  const e = '✦' // decorativo

  if (!text) return m.reply(`${e} *Ingresa un enlace de Pinterest o una palabra clave para buscar.*`)
  conn.sendMessage(m.chat, { react: { text: '🕒', key: m.key } })

  const pinterestUrlRegex = /^https?:\/\/(www\.)?(pinterest\.[a-z.]+\/pin\/|pin\.it\/)/i

  if (pinterestUrlRegex.test(text)) {
    try {
      // 🔹 1. Resolver el link corto (pin.it → pinterest.com/pin/...)
      let resolvedUrl = text
      if (text.includes('pin.it/')) {
        const head = await fetch(text, { method: 'HEAD', redirect: 'follow' })
        resolvedUrl = head.url
      }

      // 🔹 2. Llamar a la API de Delirius con el enlace real
      const api = `https://api.delirius.store/download/pinterestdl?url=${encodeURIComponent(resolvedUrl)}`
      const res = await fetch(api)
      const json = await res.json()

      if (!json?.status || !json?.data) throw new Error('Respuesta inválida.')

      const data = json.data
      const type = data.download?.type || 'image'
      const url = data.download?.url
      const thumb = data.thumbnail

      let caption = `
> ✦ *Título:* ${data.title || '-'}
> ✦ *Autor:* ${data.author_name || '-'} (${data.username || ''})
> ✦ *Descripción:* ${data.description || '-'}
> ✦ *Subido:* ${data.upload || '-'}
> ✦ *Fuente:* ${data.source || '-'}
> ✦ *Tipo:* ${type}
      `.trim()

      // 🔹 3. Intentar enviar video si existe y es accesible
      if (type === 'video' && url) {
        try {
          const check = await fetch(url, { method: 'HEAD' })
          if (check.ok) {
            await conn.sendMessage(m.chat, {
              video: { url },
              caption,
              thumbnail: await (await fetch(thumb)).buffer(),
              mimetype: 'video/mp4'
            }, { quoted: m })
            return
          }
        } catch {
          // Si falla la URL, caemos al envío de imagen
        }
      }

      // 🔹 4. Enviar como imagen si el video no es válido
      await conn.sendFile(m.chat, thumb || url, 'pinterest.jpg', caption, m)

    } catch (err) {
      console.error(err)
      m.reply(`${e} Hubo un error al procesar el enlace.`)
    }
  } else {
    // 🔹 Si el usuario busca por texto (modo búsqueda)
    try {
      const res = await fetch(`https://api.dorratz.com/v2/pinterest?q=${encodeURIComponent(text)}`)
      const data = await res.json()

      if (!Array.isArray(data) || data.length === 0)
        return m.reply(`${e} No se encontraron imágenes para: *${text}*`)

      const results = data.slice(0, 10)
      await conn.sendFile(m.chat, results[0].image_large_url, 'pin.jpg', `${e} Resultados para: *${text}*`, m)
      for (let i = 1; i < results.length; i++) {
        await conn.sendMessage(m.chat, { image: { url: results[i].image_large_url } }, { quoted: m })
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

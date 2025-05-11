import Starlights from '@StarlightsTeam/Scraper'

let tempTikTok = {}

const handler = async (m, { conn }) => {
  const tiktokRegex = /https?:\/\/(www\.)?tiktok\.com\/[^\s]+/gi
  const links = [...m.text.matchAll(tiktokRegex)]

  if (links.length === 0) return

  for (const match of links) {
    const url = match[0]

    try {
      const data = await Starlights.tiktokdl(url)
      if (!data || !data.dl_url) throw new Error('No se pudo obtener el video.')

      const caption = `╭───── • ─────╮\n` +
                      `  𖤐 \`TIKTOK EXTRACTOR\` 𖤐\n` +
                      `╰───── • ─────╯\n\n` +
                      `✦ *Título* : ${data.title}\n` +
                      `✦ *Autor* : ${data.author}\n` +
                      `✦ *Duración* : ${data.duration} segundos\n` +
                      `✦ *Vistas* : ${data.views}\n` +
                      `✦ *Likes* : ${data.likes}\n` +
                      `✦ *Comentarios* : ${data.comment || data.comments_count}\n` +
                      `✦ *Compartidos* : ${data.share || data.share_count}\n` +
                      `✦ *Publicado* : ${data.published}\n` +
                      `✦ *Descargas* : ${data.downloads || data.download_count}\n\n` +
                      `*_Para seleccionar, responde a este mensaje:_*\n` +
                      `> "v" o "video" → *Video*\n> "vdoc" → *Video (doc)*`

      m.react('🕒')
      tempTikTok[m.sender] = {
        url: data.dl_url,
        title: data.title,
        resp: m,
      }

      await conn.reply(m.chat, caption, m)
    } catch (err) {
      console.error(err)
      m.reply(`❌ Error al procesar el enlace de TikTok.\n${err.message}`)
    }
  }
}

handler.before = async (m, { conn }) => {
  if (!m.quoted || !m.quoted.sender) return
  if (conn.user.jid !== m.quoted.sender) return

  const text = m.text.trim().toLowerCase()
  if (!['v', 'video', 'vdoc'].includes(text)) return

  const data = tempTikTok[m.sender]
  if (!data || !data.url) return

  try {
    const send = async (type, url, fileName, mimetype) => {
      await conn.sendMessage(m.chat, {
        [type]: { url },
        fileName,
        mimetype,
      }, { quoted: data.resp })
    }

    await conn.reply(m.chat, `*Enviando Video...*`, data.resp)
    await send(text === 'vdoc' ? 'document' : 'video', data.url, data.title + '.mp4', 'video/mp4')
  } catch (err) {
    console.error('Error en respuesta automática:', err)
    m.reply(`Error al enviar el video:\n${err.message}`)
  }
}

handler.customPrefix = /https?:\/\/(www\.)?tiktok\.com\/[^\s]+/i
handler.command = new RegExp // sin comandos
handler.group = true
export default handler

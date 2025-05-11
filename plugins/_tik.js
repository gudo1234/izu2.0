import Starlights from '@StarlightsTeam/Scraper'

const handler = async (m, { conn }) => {
  const tiktokRegex = /https?:\/\/(www\.)?tiktok\.com\/[^\s]+/gi
  const links = [...m.text.matchAll(tiktokRegex)]

  if (links.length === 0) return

  for (const match of links) {
    const url = match[0]

    try {
      await m.react('🕒')
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
                      `> *${global.textbot || 'Bot'}*`

      await conn.sendFile(m.chat, data.dl_url, 'tiktok.mp4', caption, m)
      await m.react('✅')
    } catch (err) {
      console.error(err)
      await m.react('❌')
      m.reply(`❌ Error al descargar video de TikTok:\n${err.message}`)
    }
  }
}

handler.customPrefix = /https?:\/\/(www\.)?tiktok\.com\/[^\s]+/i
handler.command = new RegExp // se activa automáticamente
handler.group = true
export default handler

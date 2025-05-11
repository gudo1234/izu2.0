import Starlights from '@StarlightsTeam/Scraper'

const handler = async (m, { conn }) => {
  const tiktokRegex = /https?:\/\/(?:vt|vm|www)?\.?tiktok\.com\/[^\s]+/gi
  const matches = [...m.text.matchAll(tiktokRegex)]

  if (matches.length === 0) return

  for (const match of matches) {
    const url = match[0]

    try {
      m.react('🕒')

      const result = await Starlights.tiktokdl(url)
      if (!result || !result.dl_url) throw new Error('No se pudo obtener el video.')

      const caption = `╭───── • ─────╮\n` +
                      `  𖤐 \`TIKTOK EXTRACTOR\` 𖤐\n` +
                      `╰───── • ─────╯\n\n` +
                      `✦ *Título* : ${result.title}\n` +
                      `✦ *Autor* : ${result.author}\n` +
                      `✦ *Duración* : ${result.duration} segundos\n` +
                      `✦ *Vistas* : ${result.views}\n` +
                      `✦ *Likes* : ${result.likes}\n` +
                      `✦ *Comentarios* : ${result.comment || result.comments_count}\n` +
                      `✦ *Compartidos* : ${result.share || result.share_count}\n` +
                      `✦ *Publicado* : ${result.published}\n` +
                      `✦ *Descargas* : ${result.downloads || result.download_count}\n\n` +
                      `> *${global.textbot || 'Bot'}*`

      await conn.sendFile(m.chat, result.dl_url, 'tiktok.mp4', caption, m)
      await m.react('✅')
    } catch (err) {
      console.error(err)
      await m.react('❌')
      await m.reply(`❌ Error al descargar video de TikTok:\n${err.message}`)
    }
  }
}

// Detecta automáticamente enlaces de TikTok en cualquier mensaje del grupo
handler.customPrefix = /https?:\/\/(?:vt|vm|www)?\.?tiktok\.com\/[^\s]+/i
handler.command = new RegExp
handler.group = true
export default handler

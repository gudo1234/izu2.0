import Starlights from '@StarlightsTeam/Scraper'

let handler = async (m, { conn, usedPrefix, command, text }) => {
  if (!text) return conn.reply(m.chat, `${e} Ingresa un texto junto al comando.\n\n*Ejemplo:* ${usedPrefix + command} ruben tuesta`, m)

  await m.react('🕓')

  try {
    // Obtener lista de videos
    let vids = await Starlights.tiktokvid(text)
    if (!Array.isArray(vids) || vids.length === 0) return m.reply('❌ No se encontraron videos.')

    // Obtener 5 aleatorios con getRandom()
    let selected = []
    for (let i = 0; i < 5; i++) selected.push(vids.getRandom())

    for (let i = 0; i < selected.length; i++) {
      let vid = selected[i]
      let { title, author, duration, views, likes, comments_count, share_count, download_count, published, dl_url } = vid

      let txt = `\`\`\`乂 TIKTOK - VIDEO ${i + 1}\`\`\`\n\n`
      txt += `✦ *Título:* ${title}\n`
      txt += `✦ *Autor:* ${author}\n`
      txt += `✦ *Duración:* ${duration} segundos\n`
      txt += `✦ *Vistas:* ${views}\n`
      txt += `✦ *Likes:* ${likes}\n`
      txt += `✦ *Comentarios:* ${comments_count}\n`
      txt += `✦ *Compartidos:* ${share_count}\n`
      txt += `✦ *Publicado:* ${published}\n`
      txt += `✦ *Descargas:* ${download_count}\n\n`
      txt += `> ${wm}`

      await conn.sendFile(m.chat, dl_url, `video${i + 1}.mp4`, txt, m)
    }

    await m.react('✅')

  } catch (err) {
    console.error(err)
    await m.react('✖️')
    await m.reply('❌ Ocurrió un error al procesar los videos.')
  }
}

handler.command = ['ttvid2']
handler.group = true

export default handler

import Starlights from '@StarlightsTeam/Scraper'

let handler = async (m, { conn, usedPrefix, command, text }) => {
  if (!text) return conn.reply(m.chat, `❗ Ingresa un texto junto al comando.\n\n*Ejemplo:* ${usedPrefix + command} ruben tuesta`, m)

  await m.react('🕓')

  try {
    // Obtener múltiples resultados
    let results = await Starlights.tiktoksearch(text)
    if (!results || results.length === 0) return m.reply('❌ No se encontraron videos con ese nombre.')

    // Elegir 10 aleatorios
    let videos = results.sort(() => 0.5 - Math.random()).slice(0, 10)

    for (let i = 0; i < videos.length; i++) {
      let { title, author, duration, views, likes, comments_count, share_count, download_count, published, dl_url } = videos[i]

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

      await conn.sendFile(m.chat, dl_url, `video${i + 1}.mp4`, txt, m, null, rcanal)
    }

    await m.react('✅')
  } catch (err) {
    console.error(err)
    await m.reply('❌ Ocurrió un error al intentar obtener los videos.')
    await m.react('✖️')
  }
}

//handler.command = ['tiktokvid','tiktoksearch','tiktokdl','ttvid']
handler.command = ['tt2']
handler.group = true

export default handler

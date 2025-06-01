import Starlights from '@StarlightsTeam/Scraper'

let handler = async (m, { conn, usedPrefix, command, text, args }) => {
  if (!text) return conn.reply(m.chat, '🚩 Ingresa un texto junto al comando.\n\n`Ejemplo:`\n' + `> *${usedPrefix + command}* Ai Hoshino Edit`, m)

  await m.react('🕓')

  try {
    // Asumiendo que esta función devuelve una lista de videos relacionados
    let results = await Starlights.tiktoksearch(text)

    if (!results || results.length === 0) {
      await m.react('✖️')
      return conn.reply(m.chat, '⚠️ No se encontraron videos relacionados.', m)
    }

    // Mezcla aleatoriamente y toma hasta 20 videos
    let selected = results.sort(() => Math.random() - 0.5).slice(0, 20)

    for (let video of selected) {
      let {
        title, author, duration, views, likes, comments_count,
        share_count, download_count, published, dl_url
      } = video

      let txt = '`乂  T I K T O K  -  D O W N L O A D`\n\n'
      txt += `    ✩  *Título* : ${title}\n`
      txt += `    ✩  *Autor* : ${author}\n`
      txt += `    ✩  *Duración* : ${duration} segundos\n`
      txt += `    ✩  *Vistas* : ${views}\n`
      txt += `    ✩  *Likes* : ${likes}\n`
      txt += `    ✩  *Comentarios* : ${comments_count}\n`
      txt += `    ✩  *Compartidos* : ${share_count}\n`
      txt += `    ✩  *Publicado* : ${published}\n`
      txt += `    ✩  *Descargas* : ${download_count}\n\n`
      txt += `> 🚩 ${text}`

      await conn.sendFile(m.chat, dl_url, `tiktok_${author}.mp4`, txt, m)
    }

    await m.react('✅')

  } catch (e) {
    console.error(e)
    await m.react('✖️')
    conn.reply(m.chat, '❌ Ocurrió un error al obtener los videos.', m)
  }
}

handler.command = ['edi']
handler.group = true

export default handler

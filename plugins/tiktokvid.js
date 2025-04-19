import Starlights from '@StarlightsTeam/Scraper'

let handler = async (m, { conn, usedPrefix, command, text, args }) => {
  if (!text) return conn.reply(m.chat, `${e} Ingresa un texto junto al comando.\n\n*Ejemplo:* ${usedPrefix + command} ruben tuesta`, m)
  await m.react('🕓')
  try {
    let { title, author, duration, views, likes, comments_count, share_count, download_count, published, dl_url } = await Starlights.tiktokvid(text)
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
          txt += `> ${wm}`

      await conn.sendFile(m.chat, dl_url, `thumbnail.mp4`, txt, m, null, rcanal)
    await conn.sendFile(m.chat, dl_url, `thumbnail.mp4`, txt, m, null, rcanal)
    await m.react('✅')

  } catch {
    await m.react('✖️')
  }
}

handler.command = ['tiktokvid','tiktoksearch','tiktokdl2','ttvid2']
handler.group = true;

export default handler

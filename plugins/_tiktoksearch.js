import axios from 'axios'
import Starlights from '@StarlightsTeam/Scraper'

let handler = async (m, { conn, usedPrefix, command, text, args }) => {
  let input = text || args[0]
  if (!input) {
    return conn.reply(m.chat, `🚩 Ingresa el *nombre del video* o el *enlace* de TikTok.\n\nEjemplo búsqueda:\n> *${usedPrefix + command}* Ai Hoshino Edit\n\nEjemplo descarga:\n> *${usedPrefix + command}* https://vm.tiktok.com/ZMrFCX5jf/`, m, rcanal)
  }

  await m.react('🕓')
  let img = await (await axios.get('https://i.ibb.co/kyTcqt9/file.jpg', { responseType: 'arraybuffer' })).data

  // Si es un enlace de TikTok
  if (/tiktok\.com/gi.test(input)) {
    try {
      let { title, author, duration, views, likes, comment, share, published, downloads, dl_url } = await Starlights.tiktokdl(input)
      let txt = '*乂  T I K T O K  -  D O W N L O A D*\n\n'
      txt += `✩ *Título* : ${title}\n`
      txt += `✩ *Autor* : ${author}\n`
      txt += `✩ *Duración* : ${duration} segundos\n`
      txt += `✩ *Vistas* : ${views}\n`
      txt += `✩ *Likes* : ${likes}\n`
      txt += `✩ *Comentarios* : ${comment}\n`
      txt += `✩ *Compartidos* : ${share}\n`
      txt += `✩ *Publicado* : ${published}\n`
      txt += `✩ *Descargas* : ${downloads}\n\n`
      txt += `> 🚩 *${textbot}*`

      await conn.sendFile(m.chat, dl_url, 'tiktok.mp4', txt, m, null, rcanal)
      await m.react('✅')
    } catch (e) {
      await m.react('✖️')
      await conn.reply(m.chat, '❌ Error al intentar descargar el video de TikTok.', m, rcanal)
    }
    return
  }

  // Si es una búsqueda por texto
  try {
    let results = await Starlights.tiktokSearch(input)

    if (!results || results.length === 0) {
      await m.react('✖️')
      return conn.reply(m.chat, '❌ No se encontraron resultados en TikTok.', m, rcanal)
    }

    let limit = 5 // Número de videos a enviar como máximo
    for (let i = 0; i < Math.min(limit, results.length); i++) {
      let { title, author, url } = results[i]
      try {
        let { dl_url } = await Starlights.tiktokdl(url)
        let txt = '*乂  T I K T O K  -  S E A R C H*\n\n'
        txt += `✩ *Nro* : ${i + 1}\n`
        txt += `✩ *Título* : ${title}\n`
        txt += `✩ *Autor* : ${author}\n`
        txt += `✩ *Url* : ${url}`

        await conn.sendFile(m.chat, dl_url, `tiktok_${i + 1}.mp4`, txt, m, null, rcanal)
      } catch (e) {
        console.log(`❌ Error al descargar video ${i + 1}:`, e)
      }
    }

    await m.react('✅')
  } catch (e) {
    await m.react('✖️')
    await conn.reply(m.chat, '❌ Ocurrió un error al buscar en TikTok.', m, rcanal)
  }
}

handler.command = ['edi']
handler.group = true
export default handler

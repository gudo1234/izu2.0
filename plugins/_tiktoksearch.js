/*import Starlights from '@StarlightsTeam/Scraper'

let handler = async (m, { conn, text, args, usedPrefix, command }) => {
  const input = text || args[0]
  const isTikTokUrl = url => /(?:https?:\/\/)?(?:www\.)?(?:vm|vt|t)?\.?tiktok\.com\/[^\s]+/gi.test(url)

  if (!input) {
    return conn.reply(m.chat, `🚩 Ingresa el *nombre del video* o un *enlace* de TikTok.\n\nEjemplo búsqueda:\n> *${usedPrefix + command}* Ai Hoshino Edit\n\nEjemplo descarga:\n> *${usedPrefix + command}* https://vm.tiktok.com/ZMrFCX5jf/`, m, rcanal)
  }

  await m.react('🕓')

  if (isTikTokUrl(input)) {
    // Modo descarga por enlace
    try {
      const data = await Starlights.tiktokdl(input)
      if (!data?.dl_url) throw '❌ No se pudo obtener el enlace de descarga.'

      const { title, author, duration, views, likes, comment, share, published, downloads, dl_url } = data
      const txt = `*乂  T I K T O K  -  D O W N L O A D*\n\n` +
        `✩ *Título* : ${title}\n` +
        `✩ *Autor* : ${author}\n` +
        `✩ *Duración* : ${duration} segundos\n` +
        `✩ *Vistas* : ${views}\n` +
        `✩ *Likes* : ${likes}\n` +
        `✩ *Comentarios* : ${comment}\n` +
        `✩ *Compartidos* : ${share}\n` +
        `✩ *Publicado* : ${published}\n` +
        `✩ *Descargas* : ${downloads}`

      await conn.sendFile(m.chat, dl_url, 'tiktok.mp4', txt, m, null, rcanal)
      return await m.react('✅')
    } catch (e) {
      console.error('❌ Error en descarga por URL:', e)
      await m.react('✖️')
      return conn.reply(m.chat, '❌ Ocurrió un error al descargar el video de TikTok.', m, rcanal)
    }
  }

  // Modo búsqueda por texto
  try {
    const results = await Starlights.tiktokSearch(input)
    if (!results || results.length === 0) {
      await m.react('✖️')
      return conn.reply(m.chat, '❌ No se encontraron resultados para tu búsqueda en TikTok.', m, rcanal)
    }

    let enviados = 0
    const maxResults = 5

    for (let i = 0; i < Math.min(maxResults, results.length); i++) {
      const { title, author, url } = results[i]
      if (!isTikTokUrl(url)) continue // Validación de URL

      try {
        const video = await Starlights.tiktokdl(url)
        if (!video?.dl_url) continue

        const caption = `*乂  T I K T O K  -  R E S U L T A D O ${i + 1}*\n\n` +
          `✩ *Título* : ${title}\n` +
          `✩ *Autor* : ${author}\n` +
          `✩ *URL* : ${url}`

        await conn.sendFile(m.chat, video.dl_url, `tiktok_${i + 1}.mp4`, caption, m, null, rcanal)
        enviados++
      } catch (err) {
        console.log(`❌ Error al descargar resultado #${i + 1}:`, err)
      }
    }

    await m.react(enviados > 0 ? '✅' : '✖️')
    if (enviados === 0) {
      await conn.reply(m.chat, '❌ No se pudo descargar ningún video de los resultados encontrados.', m, rcanal)
    }

  } catch (e) {
    console.error('❌ Error en búsqueda:', e)
    await m.react('✖️')
    await conn.reply(m.chat, '❌ Ocurrió un error al buscar videos en TikTok.', m, rcanal)
  }
}

handler.command = ['edi']
handler.group = true
export default handler*/

import Starlights from '@StarlightsTeam/Scraper'

let handler = async (m, { conn, text, args, usedPrefix, command }) => {
  const input = text || args[0]
  const isTikTokUrl = url => /(?:https?:\/\/)?(?:www\.)?(?:vm|vt|t)?\.?tiktok\.com\/[^\s]+/gi.test(url)

  if (!input) {
    return conn.reply(m.chat, `🚩 Ingresa el *nombre del video* o un *enlace* de TikTok.\n\nEjemplo búsqueda:\n> *${usedPrefix + command}* Ai Hoshino Edit\n\nEjemplo descarga:\n> *${usedPrefix + command}* https://vm.tiktok.com/ZMrFCX5jf/`, m, rcanal)
  }

  await m.react('🕓')

  if (isTikTokUrl(input)) {
    // Modo descarga por enlace
    try {
      const data = await Starlights.tiktokdl(input)
      if (!data?.dl_url) throw '❌ No se pudo obtener el enlace de descarga.'

      const { title, author, duration, views, likes, comment, share, published, downloads, dl_url } = data
      const txt = `*乂  T I K T O K  -  D O W N L O A D*\n\n` +
        `✩ *Título* : ${title}\n` +
        `✩ *Autor* : ${author}\n` +
        `✩ *Duración* : ${duration} segundos\n` +
        `✩ *Vistas* : ${views}\n` +
        `✩ *Likes* : ${likes}\n` +
        `✩ *Comentarios* : ${comment}\n` +
        `✩ *Compartidos* : ${share}\n` +
        `✩ *Publicado* : ${published}\n` +
        `✩ *Descargas* : ${downloads}`

      await conn.sendFile(m.chat, dl_url, 'tiktok.mp4', txt, m, null, rcanal)
      return await m.react('✅')
    } catch (e) {
      console.error('❌ Error en descarga por URL:', e)
      await m.react('✖️')
      return conn.reply(m.chat, '❌ Ocurrió un error al descargar el video de TikTok.', m, rcanal)
    }
  }

  // Modo búsqueda por texto
  try {
    const results = await Starlights.tiktokSearch(input)
    if (!results || results.length === 0) {
      await m.react('✖️')
      return conn.reply(m.chat, '❌ No se encontraron resultados para tu búsqueda en TikTok.', m, rcanal)
    }

    let enviados = 0
    const maxResults = 5
    let anuncioMostrado = false

    for (let i = 0; i < Math.min(maxResults, results.length); i++) {
      const { url } = results[i]
      if (!isTikTokUrl(url)) continue

      try {
        const video = await Starlights.tiktokdl(url)
        if (!video?.dl_url) continue

        if (!anuncioMostrado) {
          // ✅ Solo mostrar el texto en el primer video
          await conn.sendFile(m.chat, video.dl_url, `tiktok_1.mp4`, '*Se muestran resultados de TikTok*', m, null, rcanal)
          anuncioMostrado = true
        } else {
          // ✅ En los demás videos, enviar sin texto
          await conn.sendFile(m.chat, video.dl_url, `tiktok_${i + 1}.mp4`, '', m, null, rcanal)
        }

        enviados++
      } catch (err) {
        console.log(`❌ Error al descargar resultado #${i + 1}:`, err)
      }
    }

    await m.react(enviados > 0 ? '✅' : '✖️')
    if (enviados === 0) {
      await conn.reply(m.chat, '❌ No se pudo descargar ningún video de los resultados encontrados.', m, rcanal)
    }

  } catch (e) {
    console.error('❌ Error en búsqueda:', e)
    await m.react('✖️')
    await conn.reply(m.chat, '❌ Ocurrió un error al buscar videos en TikTok.', m, rcanal)
  }
}

handler.command = ['edi']
handler.group = true
export default handler

import axios from 'axios'
import { igdl } from 'ruhend-scraper'

const handler = async (m, { text, conn, args }) => {
  if (!args[0]) {
    return conn.reply(m.chat, `${e} Por favor, ingresa un enlace de Facebook.`, m)
  }

  const fbRegex = /(?:https?:\/\/)?(?:www\.)?(facebook\.com|fb\.watch)\/[\w\-\.\/?\=&]+/i
  if (!fbRegex.test(args[0])) {
    return conn.reply(m.chat, `${e} El enlace proporcionado no parece ser válido de Facebook.`, m)
  }

  // Función para expandir enlaces tipo /share/
  const expandFacebookUrl = async (url) => {
    try {
      const res = await axios.get(url, { maxRedirects: 5 })
      return res.request?.res?.responseUrl || url
    } catch {
      return url
    }
  }

  let inputUrl = args[0]
  if (inputUrl.includes('/share/')) {
    //await conn.reply(m.chat, '🔄 El enlace es compartido. Intentando resolver...', m)
  }

  let finalUrl = await expandFacebookUrl(inputUrl)

  let res
  try {
    await m.react('🕒') // rwait
    res = await igdl(finalUrl)
  } catch (e) {
    console.error(e)
    return conn.reply(m.chat, `${e} Error al obtener datos. Verifica el enlace o inténtalo más tarde.`, m)
  }

  const result = res.data
  if (!result || result.length === 0) {
    return conn.reply(m.chat, `${e} No se encontraron resultados para este enlace.`, m)
  }

  let data = result.find(i => i.resolution === '720p (HD)') || result.find(i => i.resolution === '360p (SD)')
  if (!data) {
    return conn.reply(m.chat, `${e} No se encontró una resolución compatible para este video.`, m)
  }

  const video = data.url
  try {
    /*await conn.sendFile(m.chat, video, 'facebook.mp4', '🎬 Video de Facebook', m, null, {
      asDocument: false*/
    await conn.sendFile(m.chat, video, `thumbnail.mp4`, `${e} _Video de facebook_`, m, null, rcanal)
    })
    await m.react('✅') // done
  } catch (e) {
    console.error(e)
    await m.react('❌') // error
    return conn.reply(m.chat, '❌ Error al enviar el video. Asegúrate de que sea público.', m)
  }
}

handler.command = ['facebook', 'fb']
handler.group = true

export default handler

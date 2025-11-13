import fetch from 'node-fetch'
import yts from 'yt-search'

const BASE_API = 'https://foreign-marna-sithaunarathnapromax-9a005c2e.koyeb.app/api/ytapi'
const API_KEY = 'c44a9812537c7331c11c792314397e3179ab5774c606c8208be0dd7bd952d869'

const handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args.length)
    return m.reply(`${e} Uso correcto:\n\n• *${usedPrefix + command}* nombre o link de YouTube`)

  const text = args.join(' ')
  let video

  // Buscar video o usar link directo
  if (text.includes('youtube.com') || text.includes('youtu.be')) {
    video = { url: text }
  } else {
    const search = await yts(text)
    if (!search.videos.length) return m.reply('No se encontraron resultados.')
    video = search.videos[0]
  }

  const fo = command === 'audio' ? 2 : 1 // 1=video, 2=audio
  const quality = '144'
  const apiURL = `${BASE_API}?url=${video.url}&fo=${fo}&qu=${quality}&apiKey=${API_KEY}`

  await m.reply(`⏳ *Descargando ${command === 'audio' ? 'audio 🎵' : 'video 🎬'}...*\n\n📺 *Título:* ${video.title}\n⏱️ *Duración:* ${video.timestamp}\n👀 *Vistas:* ${video.views.toLocaleString()}`)

  try {
    const res = await fetch(apiURL)
    if (!res.ok) throw new Error(`Error API: ${res.status}`)
    let textData = await res.text()

    // Limpiar y parsear manualmente el JSON “raro”
    textData = textData
      .replace(/([a-zA-Z0-9]+)(?=[,{])/g, '"$1"') // añade comillas a las claves
      .replace(/"(\w+)"/g, '"$1":') // inserta los dos puntos
      .replace(/urlhttps/g, '"url":"https') // arregla url rota
      .replace(/"}{/, '"},{') // arregla objetos mal cerrados
      .replace(/""/g, '"') // limpia dobles comillas

    const data = JSON.parse(textData)
    const downloadUrl = data?.downloadData?.url

    if (!downloadUrl) return m.reply('No se pudo obtener el enlace de descarga.')

    await conn.sendMessage(
      m.chat,
      {
        [command]: { url: downloadUrl },
        mimetype: command === 'audio' ? 'audio/mpeg' : 'video/mp4',
        fileName: `${video.title}.${command === 'audio' ? 'mp3' : 'mp4'}`,
        caption: command === 'video' ? `🎬 *${video.title}*\n📺 YouTube` : undefined,
        contextInfo: {
          externalAdReply: {
            title: video.title,
            body: 'Descargado desde YouTube',
            thumbnailUrl: video.thumbnail,
            sourceUrl: video.url,
            mediaType: 1,
            renderLargerThumbnail: true
          }
        }
      },
      { quoted: m }
    )
  } catch (err) {
    console.error(err)
    m.reply('Error al procesar la descarga o al interpretar la respuesta.')
  }
}

handler.help = ['audio', 'video']
handler.tags = ['descargas']
handler.command = ['audio', 'video']

export default handler

import fetch from 'node-fetch'
import yts from 'yt-search'

const BASE_API = 'https://foreign-marna-sithaunarathnapromax-9a005c2e.koyeb.app/api/ytapi'
const API_KEY = 'c44a9812537c7331c11c792314397e3179ab5774c606c8208be0dd7bd952d869'

const handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args.length)
    return m.reply(`🧩 Uso correcto:\n\n• *${usedPrefix + command}* nombre o link de YouTube`)

  const text = args.join(' ')
  let video

  // Buscar o usar el link directamente
  if (text.includes('youtube.com') || text.includes('youtu.be')) {
    video = { url: text }
  } else {
    const search = await yts(text)
    if (!search.videos.length) return m.reply('❌ No se encontraron resultados.')
    video = search.videos[0]
  }

  const fo = command === 'audio' ? 2 : 1 // 1=video, 2=audio
  const quality = '144'
  const apiURL = `${BASE_API}?url=${video.url}&fo=${fo}&qu=${quality}&apiKey=${API_KEY}`

  await m.reply(`⏳ *Descargando ${command === 'audio' ? 'audio 🎵' : 'video 🎬'}...*\n\n📺 *Título:* ${video.title}\n⏱️ *Duración:* ${video.timestamp}\n👀 *Vistas:* ${video.views.toLocaleString()}`)

  try {
    const res = await fetch(apiURL)
    if (!res.ok) throw new Error(`Error API: ${res.status}`)
    const textData = await res.text()

    // Extraer la URL del texto devuelto
    const urlMatch = textData.match(/https?:\/\/[^\s"']+/)
    if (!urlMatch) return m.reply('⚠️ No se pudo extraer el enlace de descarga.')

    const downloadUrl = urlMatch[0]

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
    m.reply('❌ Error al procesar la descarga. Verifica que la API esté activa.')
  }
}

handler.help = ['audio', 'video']
handler.tags = ['descargas']
handler.command = ['audio', 'video']

export default handler

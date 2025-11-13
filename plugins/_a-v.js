import fetch from 'node-fetch'
import yts from 'yt-search'

const BASE_API = 'https://foreign-marna-sithaunarathnapromax-9a005c2e.koyeb.app/api/ytapi'
const API_KEY = 'c44a9812537c7331c11c792314397e3179ab5774c606c8208be0dd7bd952d869'

const handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args.length)
    return m.reply(`${e} Uso correcto:\n\n• *${usedPrefix + command}* diles`)

  const text = args.join(' ')
  let video
  if (text.includes('youtube.com') || text.includes('youtu.be')) {
    video = { url: text }
  } else {
    const search = await yts(text)
    if (!search.videos.length) return m.reply(`${e} No se encontraron resultados.`)
    video = search.videos[0]
  }

  const fo = command === 'audio' ? 2 : 1
  const quality = '144'
  const apiURL = `${BASE_API}?url=${video.url}&fo=${fo}&qu=${quality}&apiKey=${API_KEY}`
m.react('🕒')
  await m.reply(`⏳ *Descargando ${command === 'audio' ? 'audio 🎵' : 'video 🎬'}...*\n\n📺 *Título:* ${video.title}\n⏱️ *Duración:* ${video.timestamp}\n👀 *Vistas:* ${video.views.toLocaleString()}`)

  try {
    const res = await fetch(apiURL)
    if (!res.ok) throw new Error(`Error API: ${res.status}`)
    const data = await res.json()
    const downloadUrl = data?.result?.url
    if (!downloadUrl) return m.reply(`${e} No se pudo obtener el enlace de descarga.`)

    const messageOptions = {
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
    }
m.react('✅')
    await conn.sendMessage(m.chat, messageOptions, { quoted: m })

  } catch (err) {
    console.error(err)
    m.reply(`${e} Error al procesar la descarga.`)
  }
}

handler.command = ['audio', 'video']
handler.group = true
export default handler

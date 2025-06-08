import Starlights from '@StarlightsTeam/Scraper'
import yts from 'yt-search'

let handler = async (m, { conn, args, usedPrefix, command, text }) => {
  if (!text) return conn.reply(m.chat, `[ ✰ ] Ingresa el título de un video o canción de *YouTube*.\n\nEjemplo:\n> *${usedPrefix + command}* soy pero remix`, m, rcanal)

  await m.react('🕓')
  let res = await yts(text)
  let vid = res.videos[0]

  let info = `\`\`\`乂 Y O U T U B E - P L A Y\`\`\`\n\n`
  info += `✩ *Título:* ${vid.title}\n`
  info += `✩ *Duración:* ${vid.timestamp}\n`
  info += `✩ *Visitas:* ${formatNumber(vid.views)}\n`
  info += `✩ *Autor:* ${vid.author.name}\n`
  info += `✩ *Publicado:* ${eYear(vid.ago)}\n`
  info += `✩ *Url:* https://youtu.be/${vid.videoId}\n\n`
  info += `> *- ↻ El archivo se está enviando, espera un momento...*`

  await conn.sendFile(m.chat, vid.thumbnail, 'thumbnail.jpg', info, m, null, rcanal)

  try {
    let isAudio = ['audio', 'audiodoc'].includes(command)
    let isDoc = command.endsWith('doc')
    let data = isAudio ? await Starlights.ytmp3(vid.url) : await Starlights.ytmp4(vid.url)
    let mimetype = isAudio ? 'audio/mpeg' : 'video/mp4'
    let file = { url: data.dl_url }

    await conn.sendMessage(m.chat, {
      [isDoc ? 'document' : isAudio ? 'audio' : 'video']: file,
      mimetype,
      fileName: `${data.title}.${isAudio ? 'mp3' : 'mp4'}`
    }, { quoted: m })

    await m.react('✅')
  } catch {
    await m.react('✖️')
  }
}

handler.command = ['audio', 'audiodoc', 'video', 'videodoc']
export default handler

// Funciones auxiliares

function eYear(txt) {
  if (!txt) return '×'
  const map = {
    'month ago': 'mes',
    'months ago': 'meses',
    'year ago': 'año',
    'years ago': 'años',
    'hour ago': 'hora',
    'hours ago': 'horas',
    'minute ago': 'minuto',
    'minutes ago': 'minutos',
    'day ago': 'día',
    'days ago': 'días'
  }
  for (let key in map) {
    if (txt.includes(key)) {
      return `hace ${txt.replace(key, '').trim()} ${map[key]}`
    }
  }
  return txt
}

function formatNumber(number) {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

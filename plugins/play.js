import Starlights from '@StarlightsTeam/Scraper'
import yts from 'yt-search'

let handler = async (m, { conn, args, usedPrefix, command, text }) => {
  if (!text) {
    return conn.reply(
      m.chat,`${e} Ingresa el título de un video o canción de *YouTube*.\n\n*Ejemplo:* \`${usedPrefix + command}\` diles`,
      m
    )
  }

  await m.react('🕓')
  let res = await yts(text)
  let vid = res.videos[0]

  // Identificar tipo de archivo que se enviará
  const isAudio = ['play', 'playaudio', 'yta', 'mp3', 'ytmp3', 'play3', 'ytadoc', 'mp3doc', 'ytmp3doc'].includes(command)
  const isDoc = command.endsWith('doc')
  const tipoArchivo = isAudio
    ? isDoc ? 'audio (documento)' : 'audio'
    : isDoc ? 'video (documento)' : 'video'

  let info = `╭───── • ─────╮
𖤐 \`YOUTUBE EXTRACTOR\` 𖤐
╰───── • ─────╯

➪ *Título:* ${vid.title}
➪ *Duración:* ${vid.timestamp}
➪ *Visitas:* ${formatNumber(vid.views)}
➪ *Autor:* ${vid.author.name}
➪ *Publicado:* ${eYear(vid.ago)}
➪ *Url:* https://youtu.be/${vid.videoId}

> 🕒 Se está preparando el *${tipoArchivo}*, espera un momento...`

  await conn.sendFile(m.chat, vid.thumbnail, 'thumbnail.jpg', info, m, null, rcanal)

  try {
    const data = isAudio ? await Starlights.ytmp3(vid.url) : await Starlights.ytmp4(vid.url)
    const mimetype = isAudio ? 'audio/mpeg' : 'video/mp4'
    const file = { url: data.dl_url }

    await conn.sendMessage(m.chat, {
      [isDoc ? 'document' : isAudio ? 'audio' : 'video']: file,
      mimetype,
      fileName: `${data.title}.${isAudio ? 'mp3' : 'mp4'}`
    }, { quoted: m })

    await m.react('✅')
  } catch {
    await m.react('✖️')
    conn.reply(m.chat, '❌ Ocurrió un error al procesar tu solicitud.', m)
  }
}

handler.command = [
  'play', 'playaudio', 'yta', 'mp3', 'ytmp3',
  'play3', 'ytadoc', 'mp3doc', 'ytmp3doc',
  'play2', 'playvideo', 'ytv', 'mp4', 'ytmp4',
  'play4', 'ytvdoc', 'mp4doc', 'ytmp4doc'
]
handler.group = true;
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

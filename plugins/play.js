/*import Starlights from '@StarlightsTeam/Scraper'
import yts from 'yt-search'

let handler = async (m, { conn, args, usedPrefix, command, text }) => {
  if (!text) {
    return conn.reply(
      m.chat, `${e} Ingresa el título de un video o canción de *YouTube*.\n\n*Ejemplo:* \`${usedPrefix + command}\` diles`,
      m
    )
  }

  await m.react('🕓')
  let res = await yts(text)
  let vid = res.videos[0]

  const isAudio = ['play', 'playaudio', 'yta', 'mp3', 'ytmp3', 'play3', 'ytadoc', 'mp3doc', 'ytmp3doc'].includes(command)
  const isDoc = command.endsWith('doc')

  const durationSeconds = vid.seconds || 0
  const durationMinutes = durationSeconds / 60

  const autoDoc = !isDoc && durationMinutes > 20 // Solo si NO fue pedido explícitamente como doc
  const sendAsDoc = isDoc || autoDoc

  const tipoArchivo = isAudio
    ? (sendAsDoc ? 'audio (documento)' : 'audio')
    : (sendAsDoc ? 'video (documento)' : 'video')

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

  if (autoDoc) {
    info += `\n\n${e} *Este archivo se enviará como documento porque supera los 20 minutos de duración.*`
  }

  await conn.sendFile(m.chat, vid.thumbnail, 'thumbnail.jpg', info, m, null, rcanal)

  try {
    const data = isAudio ? await Starlights.ytmp3(vid.url) : await Starlights.ytmp4(vid.url)
    const mimetype = isAudio ? 'audio/mpeg' : 'video/mp4'
    const file = { url: data.dl_url }

    await conn.sendMessage(m.chat, {
      [sendAsDoc ? 'document' : isAudio ? 'audio' : 'video']: file,
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
handler.group = true
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
}*/

import yts from 'yt-search'
import axios from 'axios'

let handler = async (m, { conn, args, usedPrefix, command, text }) => {
  if (!text) {
    return conn.reply(
      m.chat,
      `❗ Ingresa el título o link de un video de *YouTube*.\n\n📌 *Ejemplo:* \`${usedPrefix + command}\` diles`,
      m
    )
  }

  await m.react('🕓')
  let res = await yts(text)
  let vid = res.videos[0]
  if (!vid) return m.reply('❌ No se encontró el video.')

  const durationSeconds = vid.seconds || 0
  const durationMinutes = durationSeconds / 60
  const url = `https://youtu.be/${vid.videoId}`

  // ==== SISTEMA DE COMANDOS CORREGIDO ====
  const docAudioCommands = ['play3', 'ytadoc', 'mp3doc', 'ytmp3doc']
  const docVideoCommands = ['play4', 'ytvdoc', 'mp4doc', 'ytmp4doc']
  const normalAudioCommands = ['play', 'playaudio', 'yta', 'mp3', 'ytmp3']
  const normalVideoCommands = ['play2', 'playvideo', 'ytv', 'mp4', 'ytmp4']

  let isAudio = false
  let isVideo = false
  let sendAsDoc = false

  if (docAudioCommands.includes(command)) {
    isAudio = true
    sendAsDoc = true
  } else if (docVideoCommands.includes(command)) {
    isVideo = true
    sendAsDoc = true
  } else if (normalAudioCommands.includes(command)) {
    isAudio = true
  } else if (normalVideoCommands.includes(command)) {
    isVideo = true
  }

  // Si la duración es muy larga, se fuerza como documento
  if (!sendAsDoc && durationMinutes > 20) {
    sendAsDoc = true
  }

  const tipoArchivo = isAudio
    ? (sendAsDoc ? 'audio (documento)' : 'audio')
    : (sendAsDoc ? 'video (documento)' : 'video')

  const caption = `╭───── • ─────╮
𖤐 \`YOUTUBE EXTRACTOR\` 𖤐
╰───── • ─────╯

➪ *Título:* ${vid.title}
➪ *Duración:* ${vid.timestamp}
➪ *Visitas:* ${formatNumber(vid.views)}
➪ *Autor:* ${vid.author.name}
➪ *Publicado:* ${eYear(vid.ago)}
➪ *Url:* ${url}

🕒 Preparando *${tipoArchivo}*...`

  await conn.sendFile(m.chat, vid.thumbnail, 'thumb.jpg', caption, m)

  let downloadUrl
  let titleFinal = vid.title
  let mimetype = isAudio ? 'audio/mpeg' : 'video/mp4'

  try {
    const Starlights = (await import('@StarlightsTeam/Scraper')).default
    const result = isAudio ? await Starlights.ytmp3(url) : await Starlights.ytmp4(url)
    if (result?.dl_url) {
      downloadUrl = result.dl_url
      titleFinal = result.title || vid.title
    } else throw new Error('Starlights sin resultado')
  } catch (err) {
    const fallbacks = [
      `https://delirius-apiofc.vercel.app/download/${isAudio ? 'ytmp3' : 'ytmp4'}?url=${url}`,
      `https://api.neoxr.eu/api/youtube?url=${url}&type=${isVideo ? 'video' : 'audio'}&quality=480p&apikey=GataDios`,
      `https://api.vreden.my.id/api/ytmp3?url=${encodeURIComponent(url)}`,
      `https://www.velyn.biz.id/api/downloader/ytmp4?url=${url}`,
      `https://api.nekorinn.my.id/downloader/savetube?url=${encodeURIComponent(url)}&format=720`,
      `https://api.zenkey.my.id/api/download/ytmp4?apikey=zenkey&url=${url}`,
      `https://axeel.my.id/api/download/video?url=${encodeURIComponent(url)}`,
      `https://api.siputzx.my.id/api/d/ytmp4?url=${url}`
    ]

    for (let api of fallbacks) {
      try {
        const res = await axios.get(api)
        if (res.data?.url) {
          downloadUrl = res.data.url
          break
        } else if (res.data?.data?.url) {
          downloadUrl = res.data.data.url
          break
        } else if (res.data?.result?.download?.url) {
          downloadUrl = res.data.result.download.url
          break
        } else if (res.data?.data?.dl) {
          downloadUrl = res.data.data.dl
          break
        }
      } catch {}
    }

    if (!downloadUrl) {
      await m.react('❌')
      return conn.reply(m.chat, '❌ No se pudo obtener el enlace de descarga.', m)
    }
  }

  await conn.sendMessage(m.chat, {
    [sendAsDoc ? 'document' : isAudio ? 'audio' : 'video']: { url: downloadUrl },
    mimetype,
    fileName: `${titleFinal}.${isAudio ? 'mp3' : 'mp4'}`
  }, { quoted: m })

  await m.react('✅')
}

handler.command = [
  'play', 'playaudio', 'yta', 'mp3', 'ytmp3',
  'play3', 'ytadoc', 'mp3doc', 'ytmp3doc',
  'play2', 'playvideo', 'ytv', 'mp4', 'ytmp4',
  'play4', 'ytvdoc', 'mp4doc', 'ytmp4doc'
]
handler.group = true
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
    if (txt.includes(key)) return `hace ${txt.replace(key, '').trim()} ${map[key]}`
  }
  return txt
}

function formatNumber(n) {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

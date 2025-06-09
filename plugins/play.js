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

import Starlights from '@StarlightsTeam/Scraper'
import yts from 'yt-search'
import fetch from 'node-fetch'

let handler = async (m, { conn, args, usedPrefix, command, text }) => {
  if (!text) {
    return conn.reply(m.chat, `${e} Ingresa el título de un video o canción de *YouTube*.\n\n*Ejemplo:* \`${usedPrefix + command} diles\``,
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

  const autoDoc = !isDoc && durationMinutes > 20
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

  await conn.sendFile(m.chat, vid.thumbnail, 'thumb.jpg', info, m, null, rcanal)

  let url = vid.url
  let title = vid.title
  let mimetype = isAudio ? 'audio/mpeg' : 'video/mp4'

  try {
    const data = isAudio ? await Starlights.ytmp3(url) : await Starlights.ytmp4(url)
    const file = { url: data.dl_url }

    await conn.sendMessage(m.chat, {
      [sendAsDoc ? 'document' : isAudio ? 'audio' : 'video']: file,
      mimetype,
      fileName: `${data.title}.${isAudio ? 'mp3' : 'mp4'}`
    }, { quoted: m })

    return await m.react('✅')
  } catch (e) {
    await m.react('🔁')
  }

  const fallbackApis = [
    async () => (await (await fetch(`https://delirius-api.vercel.app/download/${isAudio ? 'ytmp3' : 'ytmp4'}?url=${url}`)).json()).url,
    async () => (await (await fetch(`https://api.vreden.my.id/api/${isAudio ? 'ytmp3' : 'ytmp4'}?url=${url}`)).json()).result.download.url,
    async () => (await (await fetch(`https://api.nekorinn.my.id/downloader/savetube?url=${url}&format=720`)).json()).url,
    async () => (await (await fetch(`https://api.zenkey.my.id/api/download/${isAudio ? 'ytmp3' : 'ytmp4'}?apikey=zenkey&url=${url}`)).json()).url,
    async () => (await (await fetch(`https://axeel.my.id/api/download/${isAudio ? 'audio' : 'video'}?url=${url}`)).json()).url,
    async () => (await (await fetch(`https://api.siputzx.my.id/api/d/${isAudio ? 'ytmp3' : 'ytmp4'}?url=${url}`)).json()).data.dl,
    async () => (await (await fetch(`https://api.neoxr.my.id/api/media/${isAudio ? 'ytmp3' : 'ytmp4'}?url=${url}`)).json()).data.url,
    async () => (await (await fetch(`https://caliphapi.xyz/api/download/yt${isAudio ? 'mp3' : 'mp4'}?url=${url}`)).json()).result.url,
    async () => (await (await fetch(`https://api.lolhuman.xyz/api/yt${isAudio ? 'audio' : 'video'}?apikey=TuAPIKey&url=${url}`)).json()).result.link
  ]

  let fallbackUrl = null
  for (let api of fallbackApis) {
    try {
      const result = await api()
      if (result) {
        fallbackUrl = result
        break
      }
    } catch {
      continue
    }
  }

  if (!fallbackUrl) {
    await m.react('✖️')
    return conn.reply(m.chat, '❌ *No se pudo obtener el archivo desde ninguna fuente.*', m)
  }

  await conn.sendMessage(m.chat, {
    [sendAsDoc ? 'document' : isAudio ? 'audio' : 'video']: { url: fallbackUrl },
    mimetype,
    fileName: `${title}.${isAudio ? 'mp3' : 'mp4'}`
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

import Starlights from '@StarlightsTeam/Scraper'
import yts from 'yt-search'
import fetch from 'node-fetch'

let handler = async (m, { conn, args, usedPrefix, text, command }) => {
  let lister = ["mp3", "mp4", "mp3doc", "mp4doc"]
  let [feature, ...query] = text.split(" ")

  if (!lister.includes(feature)) {
    return conn.reply(m.chat, '[ ✰ ] Ingresa el formato y el título de un video de *YouTube*.\n\n`» Ejemplo :`\n' + `> *${usedPrefix + command}* mp3 SUICIDAL-IDOL\n\n*» Formatos disponibles* :\n\n*${usedPrefix + command}* mp3\n*${usedPrefix + command}* mp3doc\n*${usedPrefix + command}* mp4\n*${usedPrefix + command}* mp4doc`, m, rcanal)
  }

  if (!query.length) {
    return conn.reply(m.chat, '[ ✰ ] Ingresa el título de un video o canción de *YouTube*.\n\n`» Ejemplo :`\n' + `> *${usedPrefix + command}* mp3 SUICIDAL-IDOL`, m, rcanal)
  }

  await m.react('🕓')
  let res = await yts(query.join(" "))
  let vid = res.videos[0]
  let txt = '`乂 Y O U T U B E - P L A Y`\n\n'
      txt += `	✩   *Título*: ${vid.title}\n`
      txt += `	✩   *Duración*: ${vid.timestamp}\n`
      txt += `	✩   *Visitas*: ${formatNumber(vid.views)}\n`
      txt += `	✩   *Autor*: ${vid.author.name}\n`
      txt += `	✩   *Publicado*: ${eYear(vid.ago)}\n`
      txt += `	✩   *Url*: https://youtu.be/${vid.videoId}\n\n`
      txt += `> *- ↻ El archivo se esta enviando espera un momento, soy lenta. . .*`

  await conn.sendFile(m.chat, vid.thumbnail, 'thumbnail.jpg', txt, m, null, rcanal)
  try {
  let data = feature.includes('mp3') ? await Starlights.ytmp3(vid.url) : await Starlights.ytmp4(vid.url)
    let isDoc = feature.includes('doc')
    let mimetype = feature.includes('mp3') ? 'audio/mpeg' : 'video/mp4'
    let file = { url: data.dl_url }

    await conn.sendMessage(m.chat, { [isDoc ? 'document' : feature.includes('mp3') ? 'audio' : 'video']: file, mimetype, fileName: `${data.title}.${feature.includes('mp3') ? 'mp3' : 'mp4'}` }, { quoted: m })
    await m.react('✅')
  } catch {
    await m.react('✖️')
  }
 }

handler.command = ['ytplay']
export default handler

function eYear(txt) {
    if (!txt) {
        return '×'
    }
    if (txt.includes('month ago')) {
        var T = txt.replace("month ago", "").trim()
        var L = 'hace '  + T + ' mes'
        return L
    }
    if (txt.includes('months ago')) {
        var T = txt.replace("months ago", "").trim()
        var L = 'hace ' + T + ' meses'
        return L
    }
    if (txt.includes('year ago')) {
        var T = txt.replace("year ago", "").trim()
        var L = 'hace ' + T + ' año'
        return L
    }
    if (txt.includes('years ago')) {
        var T = txt.replace("years ago", "").trim()
        var L = 'hace ' + T + ' años'
        return L
    }
    if (txt.includes('hour ago')) {
        var T = txt.replace("hour ago", "").trim()
        var L = 'hace ' + T + ' hora'
        return L
    }
    if (txt.includes('hours ago')) {
        var T = txt.replace("hours ago", "").trim()
        var L = 'hace ' + T + ' horas'
        return L
    }
    if (txt.includes('minute ago')) {
        var T = txt.replace("minute ago", "").trim()
        var L = 'hace ' + T + ' minuto'
        return L
    }
    if (txt.includes('minutes ago')) {
        var T = txt.replace("minutes ago", "").trim()
        var L = 'hace ' + T + ' minutos'
        return L
    }
    if (txt.includes('day ago')) {
        var T = txt.replace("day ago", "").trim()
        var L = 'hace ' + T + ' dia'
        return L
    }
    if (txt.includes('days ago')) {
        var T = txt.replace("days ago", "").trim()
        var L = 'hace ' + T + ' dias'
        return L
    }
    return txt
}

function formatNumber(number) {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

function toNum(number) {
    if (number >= 1000 && number < 1000000) {
        return (number / 1000).toFixed(1) + 'k'
    } else if (number >= 1000000) {
        return (number / 1000000).toFixed(1) + 'M'
    } else if (number <= -1000 && number > -1000000) {
        return (number / 1000).toFixed(1) + 'k'
    } else if (number <= -1000000) {
        return (number / 1000000).toFixed(1) + 'M'
    } else {
        return number.toString()
    }
    }

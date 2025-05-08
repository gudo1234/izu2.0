import { youtubedl, youtubedlv2 } from '@bochilteam/scraper'
import fetch from 'node-fetch'
import yts from 'yt-search'
import ytdl from 'ytdl-core'
import axios from 'axios'
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { ytmp3, ytmp4 } = require("@hiudyy/ytdl");

import { writeFile } from 'fs/promises'
import { join } from 'path'
import { tmpdir } from 'os'

let tempStorage = {}
const youtubeRegexID = /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/|live\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/

const handler = async (m, {conn, command, args, text, usedPrefix}) => {
try {
if (!text) return conn.reply(m.chat, `❀ Por favor, ingresa el nombre o url de la música a descargar.`, m)
let videoIdToFind = text.match(youtubeRegexID) || null
await m.react('🕓')

const yt_play = await search(args.join(' '))
let ytplay2 = await yts(videoIdToFind === null ? text : 'https://youtu.be/' + videoIdToFind[1])

if (videoIdToFind) {
const videoId = videoIdToFind[1]  
ytplay2 = ytplay2.all.find(item => item.videoId === videoId) || ytplay2.videos.find(item => item.videoId === videoId)
} 
ytplay2 = ytplay2.all?.[0] || ytplay2.videos?.[0] || ytplay2  
const caption = `「✦」Descargando *<${ytplay2?.title || 'Desconocido'}>*\n> ✦ Descripción » *${ytplay2?.description || 'Desconocido'}*\n> ✰ Vistas » *${formatViews(ytplay2?.views) || 'Desconocido'}*\n> ⴵ Duración » *${ytplay2?.timestamp || 'Desconocido'}*\n> ✐ Publicación » *${ytplay2?.ago || 'Desconocido'}*\n> ✦ Url » *${ytplay2?.url.replace(/^https:\/\//, "")}*\n
*_Para seleccionar, escribe respondiendo a este mensaje:_*
> "a" o "audio" → *Audio*
> "v" o "video" → *Video*
> "adoc" → *Audio (doc)*
> "vdoc" → *Video (doc)*
`.trim()

tempStorage[m.sender] = { url: ytplay2.url, title: ytplay2.title, resp: m, usedPrefix: usedPrefix, command: command }
const thumb = (await conn.getFile(ytplay2.thumbnail))?.data
const JT = {
      contextInfo: {
        externalAdReply: {
          title: '✧ Youtube • Music ✧',
          body: textbot,
          mediaType: 1,
          previewType: 0,
          mediaUrl: ytplay2.url,
          sourceUrl: ytplay2.url,
          thumbnail: thumb,
          renderLargerThumbnail: true,
        },
      },
    }

await conn.reply(m.chat, caption, m, JT)
} catch (e) {
m.reply('Error')
console.log(e)
}}

handler.before = async (m, { conn }) => {
if (!m.quoted || !m.quoted.sender) return 
if (conn.user.jid !== m.quoted.sender) return
  
const text = m.text.trim().toLowerCase()
if (!['a', 'audio', 'v', 'video', 'adoc', 'vdoc'].includes(text)) return
const userVideoData = tempStorage[m.sender]
const gata = tempStorage[m.sender]
if (!userVideoData || !userVideoData.url) return

const optionsAudio = {
"a": "audio",
"audio": "audio",
"adoc": "document"
}
const typeAudio = optionsAudio[text]

const optionsVideo = {
"v": { type: "video", caption: true },
"video": { type: "video", caption: true },
"vdoc": { type: "document", caption: false }
}
const typeVideo = optionsVideo[text]

if ((typeAudio === "audio" || typeAudio === "document") && ['a', 'audio', 'adoc'].includes(text)) {
await conn.reply(m.chat, `*${typeAudio === "document" ? "Enviando Documento de Audio..." : "Enviando Audio..."}*`, gata.resp || null)
let result, server, title
try {
let res = await fetch(`https://api.vreden.my.id/api/ytmp3?url=${userVideoData.url}`)
let api = await res.json()
if (api?.status == 200 && api?.result?.download?.url) {
result = api.result.download.url
title = api.result.title
server = 'Vreden'
} else throw 'Vreden error'
} catch (e1) {
console.log(e1)
try {
let res = await fetch(`https://api.neoxr.eu/api/youtube?url=${userVideoData.url}&type=audio&quality=128kbps&apikey=GataDios`)
let api = await res.json()
if (api?.status && api?.data?.url) {
result = api.data.url
title = api.title
server = 'Neoxr'
} else throw 'Neoxr error'
} catch (e2) {
console.log(e1)
try {
let res = await fetch(`https://api.siputzx.my.id/api/d/ytmp3?url=${userVideoData.url}`)
let api = await res.json()
if (api?.status && api?.data?.dl) {
result = api.data.dl
title = api.data.title
server = 'Siputzx'
} else throw 'Siputzx error'
} catch (e3) {
console.log(e1)
result = null
server = null
}}
}
if (result) {
m.reply(`> ✅ *Audio procesado. Servidor:* \`${server}\``)
await conn.sendMessage(m.chat, { [typeAudio]: { url: result }, fileName: `${title || userVideoData?.title}.mp3`, mimetype: 'audio/mpeg' }, { quoted: gata.resp })
} else {
m.reply('❌ No se pudo obtener el audio desde ningún servidor.')
}

} else if ((typeVideo.type === "video" || typeVideo.type === "document") && ['v', 'video', 'vdoc'].includes(text)) {
await conn.reply(m.chat, `*${!typeVideo || typeVideo.type === "video" ? "Enviando Video..." : "Enviando Documento de Vídeo..."}*`, gata.resp || null)
let result, server, title

try {
let res = await fetch(`https://api.neoxr.eu/api/youtube?url=${userVideoData.url}&type=video&quality=360p&apikey=GataDios`)
let api = await res.json()
if (api?.status && api?.data?.url) {
result = api.data.url
title = api.title
server = 'Neoxr'
} else throw 'Neoxr error'
} catch (e2) {
try {
let res = await fetch(`https://api.siputzx.my.id/api/d/youtube?q=${userVideoData.title}`)
if (!videoData?.title) throw 'No title for Siputzx'
let api = await res.json()
if (api?.status && api?.data?.video) {
result = api.data.video
title = api.data.title
server = 'Siputzx'
} else throw 'Siputzx error'
} catch (e3) {
result = null
server = null
}}
if (result) {
m.reply(`> ✅ *Vídeo procesado. Servidor:* \`${server}\``)
await conn.sendMessage(m.chat, { [typeVideo.type]: { url: result }, fileName: `${title || videoData.title || 'video'}.mp4`, mimetype: 'video/mp4'}, { quoted: gata.resp })
} else {
m.reply('❌ No se pudo obtener el video desde ningún servidor.')
}}
}
handler.command = handler.help = ['pla', 'play2']
export default handler

async function search(query, options = {}) {
const search = await yts.search({query, hl: 'es', gl: 'ES', ...options})
return search.videos
}

function MilesNumber(number) {
const exp = /(\d)(?=(\d{3})+(?!\d))/g;
const rep = '$1.';
const arr = number.toString().split('.');
arr[0] = arr[0].replace(exp, rep);
return arr[1] ? arr.join('.') : arr[0];
}

async function getFileSize(url) {
try {
const response = await fetch(url, { method: 'HEAD' })
const contentLength = response.headers.get('content-length')
if (!contentLength) return "Tamaño no disponible"
const sizeInBytes = parseInt(contentLength, 10);
return await formatSize(sizeInBytes)
} catch (error) {
console.error("Error al obtener el tamaño del archivo:", error)
return "Error al obtener el tamaño"
}}

async function formatSize(bytes) {
if (bytes >= 1e9) {
return (bytes / 1e9).toFixed(2) + " GB"
} else if (bytes >= 1e6) {
return (bytes / 1e6).toFixed(2) + " MB"
} else {
return bytes + " bytes"
}}

function formatViews(views) {
  if (views === undefined) {
    return "No disponible"
  }

  if (views >= 1_000_000_000) {
    return `${(views / 1_000_000_000).toFixed(1)}B (${views.toLocaleString()})`
  } else if (views >= 1_000_000) {
    return `${(views / 1_000_000).toFixed(1)}M (${views.toLocaleString()})`
  } else if (views >= 1_000) {
    return `${(views / 1_000).toFixed(1)}k (${views.toLocaleString()})`
  }
  return views.toString()
}

async function downloadToTempFile(url) {
  const videoBuffer = await axios.get(url, { responseType: 'arraybuffer' })
  const tempPath = join(tmpdir(), `${Date.now()}.mp4`)
  await writeFile(tempPath, videoBuffer.data)
  return tempPath
  }

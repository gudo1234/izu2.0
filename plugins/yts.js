import fetch from 'node-fetch'
import yts from 'yt-search'
import axios from 'axios'

let tempSearchResults = {}

let handler = async (m, { conn, command, args, usedPrefix }) => {
  let text = args.join(" ")
  if (!text) return m.reply(`❗ Ingresa una búsqueda o enlace de YouTube.\n\n📌 Ejemplo:\n*${usedPrefix + command}* bad bunny un preview`)
  await m.react('🕓')

  try {
    const search = await yts(text)
    const videos = search.videos.slice(0, 20)
    if (!videos.length) return m.reply(`❌ No se encontraron resultados.`)

    let list = `╭───── • ─────╮
✩ \`Youtube Search\` ✩

🔍 *Consulta:* ${text}
📥 *Resultados:* ${videos.length}
╰───── • ─────╯

📌 *Cómo descargar:*  
Responde a este mensaje usando el número del video:

──────────────────
✦ \`a 1\` o \`audio 1\` → Descargar audio  
✦ \`v 1\` o \`video 1\` → Descargar video  
✦ \`d 1 a\` o \`documento 1 audio\` → Audio en documento  
✦ \`d 1 v\` o \`documento 1 video\` → Video en documento  
──────────────────`

    for (let i = 0; i < videos.length; i++) {
      let v = videos[i]
      list += `\n\n*#${i + 1}.* _${v.title}_
⌚ ${v.timestamp} | ${v.ago}
👤 ${v.author.name}
🔗 ${v.url}`
    }

    const thumb = await (await fetch(videos[0].thumbnail)).buffer()
    const sentMsg = await conn.sendMessage(m.chat, {
      text: list,
      contextInfo: {
        externalAdReply: {
          title: 'YouTube Searcher',
          body: 'Elige qué descargar respondiendo con el número',
          thumbnail: thumb,
          sourceUrl: videos[0].url,
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    }, { quoted: m })

    tempSearchResults[sentMsg.key.id] = { videos, _msg: sentMsg }
    await m.react('✅')
  } catch (e) {
    console.error(e)
    await m.reply(`❌ Error en la búsqueda:\n${e.message}`)
    await m.react('❌')
  }
}

// Maneja las respuestas
handler.before = async (m, { conn }) => {
  if (!m.quoted || !m.quoted.id) return
  const data = tempSearchResults[m.quoted.id]
  if (!data) return

  const text = m.text.trim().toLowerCase()
  const match = text.match(/^(?:(a|v|audio|video|d|documento))\s*#?\s*(\d+)\s*(a|v|audio|video)?$/i)
  if (!match) return

  const [__, cmd1, numStr, cmd2] = match
  const type1 = (cmd1 || '').toLowerCase()
  const type2 = (cmd2 || '').toLowerCase()
  const index = parseInt(numStr) - 1
  const videos = data.videos
  if (!videos || !videos[index]) return m.reply('❌ Número inválido.')

  const video = videos[index]
  const { title, timestamp, views, ago, url, author } = video
  const duration = timestamp || '0:00'

  const toSeconds = t => t.split(':').reduce((acc, n) => acc * 60 + +n, 0)
  const mins = toSeconds(duration) / 60
  let format = 'audio'
  let asDocument = false

  if (['video', 'v'].includes(type1)) format = 'video'
  if (['audio', 'a'].includes(type1)) format = 'audio'
  if (['d', 'documento'].includes(type1)) {
    asDocument = true
    if (['video', 'v'].includes(type2)) format = 'video'
    if (['audio', 'a'].includes(type2)) format = 'audio'
  }

  // si supera 20 minutos => documento
  if (!asDocument && mins > 20) asDocument = true

  const typeDesc = format === 'audio' ? (asDocument ? 'audio (doc)' : 'audio') : (asDocument ? 'video (doc)' : 'video')
  const aviso = !asDocument && mins > 20 ? '\n‣ Se enviará como documento por superar 20 minutos.' : ''

  // 💬 Mensaje previo (en lugar del sendFile)
  m.react('🕒')
  await conn.reply(
    m.chat,
    `🎵 *${title}*\n⏱️ Duración: ${duration}\n\n⏳ _Preparando ${typeDesc}..._${aviso}`,
    m,
    { quoted: data._msg }
  )

  // API según formato
  const main = `https://www.sankavollerei.com/download/${format === 'audio' ? 'ytmp3' : 'ytmp4'}?apikey=planaai&url=${encodeURIComponent(url)}`
  const backup = `https://www.sankavollerei.com/download/${format === 'audio' ? 'ytmp4' : 'ytmp3'}?apikey=planaai&url=${encodeURIComponent(url)}`
  let dataRes, usedBackup = false

  try {
    const res = await axios.get(main)
    dataRes = res.data.result
    if (!dataRes?.download) throw new Error('Sin enlace principal')
  } catch {
    usedBackup = true
    const res = await axios.get(backup)
    dataRes = res.data.result
  }

  if (!dataRes?.download) return m.reply('❌ No se pudo obtener el enlace de descarga.')

  const fileName = `${dataRes.title || title}.${format === 'audio' ? 'mp3' : 'mp4'}`
  const mimetype = format === 'audio' ? 'audio/mpeg' : 'video/mp4'

  await conn.sendMessage(m.chat, {
    [asDocument ? 'document' : format]: { url: dataRes.download },
    mimetype,
    fileName
  }, { quoted: m })

  await m.react(usedBackup ? '⌛' : '✅')
}

handler.command = ['yts', 'ytsearch']
handler.group = true
export default handler

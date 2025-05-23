import fetch from 'node-fetch'
import yts from 'yt-search'
import axios from 'axios'

let tempSearchResults = {}

let handler = async (m, { conn, command, args, usedPrefix }) => {
  let text = args.join(" ")
  if (!text) return m.reply(`${e} Por favor, ingresa una petición para buscar en Youtube.\n\n*Ejemplo:* ${usedPrefix + command} Bad Bunny`)
  await m.react('🕓')

  try {
    const search = await yts(text)
    const videos = search.videos.slice(0, 20)
    if (!videos.length) return m.reply(`${e} No se encontraron resultados.`)

    let list = `╭───── • ─────╮
✩ \`Youtube Search\` ✩

🔍 *Consulta:* ${text}
📥 *Resultados:* ${videos.length}
╰───── • ─────╯

📌 *¿Cómo descargar?*  
❖ Cada resultado tiene un número (#1, #2, #3...).  
Responde a este mensaje usando ese número para elegir qué descargar:

━━━━━━━━━━━━━
✑ \`a 1\` o \`audio 1\` → Audio
✑ \`v 1\` o \`video 1\` → Video
⁌ \`d 1 a\` o \`documento 1 audio\` → Documento de Audio
⁌ \`d 1 v\` o \`documento 1 video\` → Documento de Video
━━━━━━━━━━━━━`

    for (let i = 0; i < videos.length; i++) {
      let vid = videos[i]
      list += `\n\n*#${i + 1}.* _${vid.title}_
⌚ ${vid.timestamp} | ${vid.ago}
👤 ${vid.author.name}
🔗 ${vid.url}
_______________`
    }

    const thumb = await (await fetch(videos[0].thumbnail)).buffer()
    const sentMsg = await conn.sendMessage(m.chat, {
      text: list,
      contextInfo: {
        externalAdReply: {
          title: wm,
          body: textbot,
          thumbnailUrl: redes,
          thumbnail: thumb,
          sourceUrl: redes,
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    }, { quoted: m })

    tempSearchResults[sentMsg.key.id] = {
      videos,
      _msg: sentMsg
    }

    await m.react('✅')
  } catch (e) {
    console.error(e)
    await m.reply(`Error en la búsqueda:\n${e.message}`)
    await m.react('❌')
  }
}

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
  const url = video.url
  const title = video.title
  const durationSeconds = video.seconds
  const quotedMsg = data._msg || m.quoted

  let format = 'audio'
  let asDocument = false

  if (['video', 'v'].includes(type1)) format = 'video'
  if (['audio', 'a'].includes(type1)) format = 'audio'
  if (['d', 'documento'].includes(type1)) {
    asDocument = true
    if (['video', 'v'].includes(type2)) format = 'video'
    if (['audio', 'a'].includes(type2)) format = 'audio'
  }

  try {
    // Checar tamaño del archivo
    let sizeMB = 0
    if (format === 'audio') {
      const res = await axios.get(`https://api.vreden.my.id/api/ytmp3?url=${url}`)
      const download = res?.data?.result?.download?.url
      const sizeBytes = res?.data?.result?.download?.size
      if (!download) throw new Error('No se pudo obtener el audio.')
      sizeMB = parseFloat(sizeBytes || 0) / (1024 * 1024)
      if (!asDocument && (sizeMB >= 100 || durationSeconds > 900)) asDocument = true

      await conn.sendMessage(m.chat, {
        text: `Enviando ✑ *${title}* como ${asDocument ? 'documento' : 'audio'}...`,
      }, { quoted: quotedMsg })

      await conn.sendMessage(m.chat, {
        [asDocument ? 'document' : 'audio']: { url: download },
        fileName: `${title}.mp3`,
        mimetype: 'audio/mpeg'
      }, { quoted: m })
    } else {
      const res = await axios.get(`https://api.neoxr.eu/api/youtube?url=${url}&type=video&quality=360p&apikey=GataDios`)
      const download = res?.data?.data?.url
      const sizeBytes = res?.data?.data?.size
      if (!download) throw new Error('No se pudo obtener el video.')
      sizeMB = parseFloat(sizeBytes || 0) / (1024 * 1024)
      if (!asDocument && (sizeMB >= 100 || durationSeconds > 900)) asDocument = true

      await conn.sendMessage(m.chat, {
        text: `Enviando ✑ *${title}* como ${asDocument ? 'documento' : 'video'}...`,
      }, { quoted: quotedMsg })

      await conn.sendMessage(m.chat, {
        [asDocument ? 'document' : 'video']: { url: download },
        fileName: `${title}.mp4`,
        mimetype: 'video/mp4'
      }, { quoted: m })
    }

  } catch (e) {
    console.error(e)
    m.reply(`${e} Error en la descarga:\n${e.message}`)
  }
}

handler.command = ['yts', 'ytsearch']
handler.group = true
export default handler

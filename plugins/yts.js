import fetch from 'node-fetch'
import yts from 'yt-search'
import axios from 'axios'

let tempSearchResults = {}

let handler = async (m, { conn, command, args, usedPrefix }) => {
  let text = args.join(" ")
  if (!text) return m.reply(`Por favor, ingresa una petición para buscar en Youtube.\n\n*Ejemplo:* ${usedPrefix + command} Shakira - Acróstico`)
  await m.react('🕓')

  try {
    const search = await yts(text)
    const videos = search.videos.slice(0, 20)
    if (!videos.length) return m.reply('❌ No se encontraron resultados.')

    tempSearchResults[m.sender] = videos

    let list = `╭─── 『 *YouTube Search* 』 ───⬣
🔍 *Consulta:* ${text}
📥 *Resultados:* ${videos.length}
📌 *Responde a este mensaje con:*
╰────────────────⬣

• \`a 1\` o \`audio 1\` → Audio
• \`v 1\` o \`video 1\` → Video
• \`d 1 a\` o \`documento 1 audio\` → Documento de Audio
• \`d 1 v\` o \`documento 1 video\` → Documento de Video
━━━━━━━━━━━━━`

    for (let i = 0; i < videos.length; i++) {
      let vid = videos[i]
      list += `\n\n*${i + 1}.* ${vid.title}
⌚ ${vid.timestamp} | ${vid.ago}
👤 ${vid.author.name}
🔗 ${vid.url}`
    }

    const thumb = await (await fetch(videos[0].thumbnail)).buffer()
    await conn.sendMessage(m.chat, {
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

    await m.react('✅')
  } catch (e) {
    console.error(e)
    await m.reply(`Error en la búsqueda:\n${e.message}`)
    await m.react('❌')
  }
}

handler.before = async (m, { conn }) => {
  if (!m.quoted || !m.quoted.text || !tempSearchResults[m.sender]) return

  const text = m.text.trim().toLowerCase()
  const match = text.match(/^(?:(a|v|audio|video|d|documento))\s*#?\s*(\d+)\s*(a|v|audio|video)?$/i)
  if (!match) return

  const [__, cmd1, numStr, cmd2] = match
  const type1 = (cmd1 || '').toLowerCase()
  const type2 = (cmd2 || '').toLowerCase()
  const index = parseInt(numStr) - 1
  const videos = tempSearchResults[m.sender]
  if (!videos || !videos[index]) return m.reply('❌ Número inválido.')

  const video = videos[index]
  const url = video.url
  const title = video.title

  // Determinar tipo de envío
  let format = 'audio' // por defecto
  let asDocument = false

  if (['video', 'v'].includes(type1)) format = 'video'
  if (['audio', 'a'].includes(type1)) format = 'audio'
  if (['d', 'documento'].includes(type1)) {
    asDocument = true
    if (['video', 'v'].includes(type2)) format = 'video'
    if (['audio', 'a'].includes(type2)) format = 'audio'
  }

  try {
    await m.reply(`Enviando *${title}* como ${asDocument ? 'documento' : format}...`)

    const send = async (msgType, downloadUrl, fileName, mimetype) => {
      await conn.sendMessage(m.chat, {
        [msgType]: { url: downloadUrl },
        fileName,
        mimetype
      }, { quoted: m })
    }

    if (format === 'audio') {
      const res = await fetch(`https://api.vreden.my.id/api/ytmp3?url=${url}`)
      const json = await res.json()
      const download = json?.result?.download?.url
      if (!download) throw new Error('No se pudo obtener el audio.')
      await send(asDocument ? 'document' : 'audio', download, `${title}.mp3`, 'audio/mpeg')
    } else {
      const res = await fetch(`https://api.neoxr.eu/api/youtube?url=${url}&type=video&quality=360p&apikey=GataDios`)
      const json = await res.json()
      const download = json?.data?.url
      if (!download) throw new Error('No se pudo obtener el video.')
      await send(asDocument ? 'document' : 'video', download, `${title}.mp4`, 'video/mp4')
    }

  } catch (e) {
    console.error(e)
    m.reply(`❌ Error en la descarga:\n${e.message}`)
  }
}

handler.command = ['yts', 'ytsearch']
handler.group = true
export default handler

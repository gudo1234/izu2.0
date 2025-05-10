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
    if (!videos.length) return m.reply('❌ No se encontraron resultados.')

    let list = `╭───── • ─────╮
✩ \`Youtube Search\` ✩

🔍 *Consulta:* ${text}
📥 *Resultados:* ${videos.length}
╰───── • ─────╯

📌 *¿Cómo descargar?*  
${e} Cada resultado tiene un número (#1, #2, #3...).  
Responde a este mensaje usando ese número para elegir qué descargar:
━━━━━━━━━━━━━
✑ \`a 1\` o \`audio 1\` → Audio
✑ \`v 1\` o \`video 1\` → Video
⁌ \`d 1 a\` o \`documento 1 audio\` → Documento de Audio
⁌ \`d 1 v\` o \`documento 1 video\` → Documento de Video
━━━━━━━━━━━━━`

    for (let i = 0; i < videos.length; i++) {
      let vid = videos[i]
      list += `\n\n*#${i + 1}.* ${vid.title}
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

    // Guardar por ID del mensaje de resultados
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
    await conn.sendMessage(m.chat, {
      text: `Enviando ✑ *${title}* como ${asDocument ? 'documento' : format}...`,
    }, { quoted: quotedMsg })

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

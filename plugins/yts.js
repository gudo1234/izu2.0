import fetch from 'node-fetch'
import yts from 'yt-search'
import axios from 'axios'
let tempSearchResults = {}

let handler = async (m, { conn, command, args, usedPrefix }) => {
  let text = args.join(" ")
  if (!text) return m.reply(`Por favor, ingresa una petición para buscar en Youtube.\n\n*Ejemplo:* ${usedPrefix + command} Lady Gaga`)
  await m.react('🕓')

  try {
    const search = await yts(text)
    const videos = search.videos.slice(0, 20)
    if (!videos.length) return m.reply('❌ No se encontraron resultados.')

    tempSearchResults[m.sender] = videos

    let list = `╭───── • ─────╮
✩ \`Youtube Search\` ✩
╰───── • ─────╯
✑ *Búsqueda* : ${text}
✑ *Resultados* : ${videos.length}

📌 \`Tutorial Download\`
━━━━━━━━━━━━━
✑ *Audio* ➧ \`a # número\` o \`audio # número\`
✑ *Video* ➧ \`v # número\` o \`video # número\`
✑ *Documento* ➧ \`d # número tipo\` o \`documento # número tipo\`
━━━━━━━━━━━━━`

    for (let i = 0; i < videos.length; i++) {
      let vid = videos[i]
      list += `\n\n*#${i + 1}* - ${vid.title}
Duración: ${vid.timestamp}
Publicado: ${vid.ago}
Autor: ${vid.author.name}
URL: ${vid.url}`
    }

    let thumb = await (await fetch(videos[0].thumbnail)).buffer()

    const formatos = [
      async () => conn.sendMessage(m.chat, {
        text: list,
        contextInfo: {
          externalAdReply: {
            title: 'Resultados de Youtube',
            body: 'Bot WhatsApp',
            thumbnail: thumb,
            sourceUrl: videos[0].url,
            mediaType: 1,
            renderLargerThumbnail: true
          }
        }
      }, { quoted: m }),

      async () => conn.sendMessage(m.chat, {
        video: { url: 'https://files.catbox.moe/rdyj5q.mp4' },
        gifPlayback: true,
        caption: list,
        contextInfo: {
          externalAdReply: {
            title: 'Resultados de Youtube',
            body: 'Bot WhatsApp',
            thumbnail: thumb,
            sourceUrl: videos[0].url,
            mediaType: 1,
            showAdAttribution: true
          }
        }
      }, { quoted: m }),

      async () => conn.sendMessage(m.chat, {
        text: list,
        contextInfo: {
          isForwarded: true,
          externalAdReply: {
            title: 'Resultados de Youtube',
            body: 'Bot WhatsApp',
            thumbnail: thumb,
            sourceUrl: videos[0].url,
            mediaType: 1,
            showAdAttribution: true,
            renderLargerThumbnail: true
          }
        }
      }, { quoted: m })
    ]

    await formatos[Math.floor(Math.random() * formatos.length)]()
    await m.react('✅')
  } catch (e) {
    console.error(e)
    await m.reply(`Error durante la búsqueda:\n${e.message}`)
    await m.react('✖️')
  }
}

handler.before = async (m, { conn }) => {
  if (!m.quoted || !m.quoted.text || !tempSearchResults[m.sender]) return

  const text = m.text.trim().toLowerCase()
  const regex = /^(?:d\s?#\s?(a|v)|documento\s?#\s?(audio|video)|audio\s?#|video\s?#|v\s?#|a\s?#)\s?(\d+)/i
  const match = text.match(regex)
  if (!match) return

  const format = (match[1] || match[2] || (text.includes('audio') ? 'audio' : 'video')).toLowerCase()
  const index = parseInt(match[3]) - 1
  const asDocument = text.includes('documento') || text.startsWith('d')

  const videos = tempSearchResults[m.sender]
  if (!videos || !videos[index]) return m.reply('❌ Número inválido.')

  const video = videos[index]
  const url = video.url
  const title = video.title

  try {
    const sendMsg = async (type, downloadUrl, fileName, mimetype) => {
      await conn.sendMessage(m.chat, {
        [type]: { url: downloadUrl },
        fileName,
        mimetype
      }, { quoted: m })
    }

    // Mensaje simulado como si fuera del usuario
    const fakeMsg = await conn.sendMessage(m.chat, {
      text: `Enviando *${title}* como ${asDocument ? 'documento' : format}...`
    }, {
      quoted: {
        key: { fromMe: false, participant: m.sender, remoteJid: m.chat },
        message: { conversation: m.text }
      }
    })

    // Borrar mensaje después de 6 segundos
    setTimeout(() => {
      conn.sendMessage(m.chat, { delete: fakeMsg.key })
    }, 6000)

    if (format === 'audio') {
      const res = await fetch(`https://api.vreden.my.id/api/ytmp3?url=${url}`)
      const json = await res.json()
      const download = json?.result?.download?.url
      if (!download) throw new Error('No se pudo obtener el audio.')
      await sendMsg(asDocument ? 'document' : 'audio', download, title + '.mp3', 'audio/mpeg')
    } else if (format === 'video') {
      const res = await fetch(`https://api.neoxr.eu/api/youtube?url=${url}&type=video&quality=360p&apikey=GataDios`)
      const json = await res.json()
      const download = json?.data?.url
      if (!download) throw new Error('No se pudo obtener el video.')
      await sendMsg(asDocument ? 'document' : 'video', download, title + '.mp4', 'video/mp4')
    }
  } catch (e) {
    console.error('Error en descarga:', e)
    m.reply(`❌ Error en la descarga:\n${e.message}`)
  }
}

handler.command = ['yts', 'ytsearch']
handler.group = true
export default handler

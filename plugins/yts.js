import fetch from 'node-fetch'
import yts from 'yt-search'
import axios from 'axios'

let tempSearchResults = {}

let handler = async (m, { conn, command, args, usedPrefix }) => {
  let text = args.join(" ")
  if (!text) return m.reply(`${e} Por favor, ingresa una petición para realizar una búsqueda en Youtube.\n\n*Ejemplo:* ${usedPrefix + command} Lady Gaga`)
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
✑ *Audio* ➧ \`a 1\`, \`audio 1\`, \`d 1 a\`
✑ *Video* ➧ \`v 1\`, \`video 1\`, \`d 1 v\`
✑ *Documento* ➧ \`d 1 audio\`, \`d 2 video\`, \`documento 1 video\`
━━━━━━━━━━━━━`

    for (let i = 0; i < videos.length; i++) {
      let vid = videos[i]
      list += `\n\n${e} *Nro* : ${i + 1}
⟣ *Título* : ${vid.title}
⟣ *Duración* : ${vid.timestamp}
⟣ *Publicado* : ${vid.ago}
⟣ *Autor* : ${vid.author.name}
⟣ *Url* : ${vid.url}`
    }

    let thumb = await (await fetch(videos[0].thumbnail)).buffer()
    const videoUrls = [
      'https://files.catbox.moe/rdyj5q.mp4',
      'https://files.catbox.moe/693ws4.mp4'
    ]
    const jpg = videoUrls[Math.floor(Math.random() * videoUrls.length)]

    const formatos = [
      async () => conn.sendMessage(m.chat, {
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
      }, { quoted: m }),

      async () => conn.sendMessage(m.chat, {
        video: { url: jpg },
        gifPlayback: true,
        caption: list,
        contextInfo: {
          forwardingScore: 0,
          isForwarded: true,
          externalAdReply: {
            title: wm,
            body: textbot,
            thumbnailUrl: redes,
            thumbnail: thumb,
            sourceUrl: redes,
            mediaType: 1,
            showAdAttribution: true
          }
        }
      }, { quoted: m }),

      async () => conn.sendMessage(m.chat, {
        text: list,
        contextInfo: {
          mentionedJid: [],
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: channelRD.id,
            newsletterName: channelRD.name,
            serverMessageId: -1,
          },
          forwardingScore: false,
          externalAdReply: {
            title: wm,
            body: textbot,
            thumbnailUrl: redes,
            thumbnail: thumb,
            sourceUrl: redes,
            mediaType: 1,
            showAdAttribution: true,
            renderLargerThumbnail: true,
          }
        }
      }, { quoted: m })
    ]

    const randomFormato = formatos[Math.floor(Math.random() * formatos.length)]
    await randomFormato()
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
  const match = text.match(/^(?:(a|v)|d|documento|audio|video)\s*#?\s*(\d+)\s*(a|v|audio|video)?$/i)
  if (!match) return

  const [_, t1, numStr, t2] = match
  const type = (t1 || t2 || '').toLowerCase().charAt(0) // 'a' o 'v'
  const isDoc = /d|documento/.test(match[0])
  const index = parseInt(numStr) - 1
  const videos = tempSearchResults[m.sender]
  if (!videos || !videos[index]) return m.reply('❌ Número inválido.')

  const video = videos[index]
  const url = video.url
  const title = video.title

  try {
    const sendMsg = async (msgType, downloadUrl, fileName, mimetype) => {
      await conn.sendMessage(m.chat, {
        [msgType]: { url: downloadUrl },
        fileName,
        mimetype
      }, { quoted: m })
    }

    await m.reply(`Enviando *${title}*...`)

    if (!isDoc && type === 'a') {
      const res = await fetch(`https://api.vreden.my.id/api/ytmp3?url=${url}`)
      const json = await res.json()
      const download = json?.result?.download?.url
      if (!download) throw new Error('No se pudo obtener el audio.')
      await sendMsg('audio', download, `${title}.mp3`, 'audio/mpeg')
    }

    if (!isDoc && type === 'v') {
      const res = await fetch(`https://api.neoxr.eu/api/youtube?url=${url}&type=video&quality=360p&apikey=GataDios`)
      const json = await res.json()
      const download = json?.data?.url
      if (!download) throw new Error('No se pudo obtener el video.')
      await sendMsg('video', download, `${title}.mp4`, 'video/mp4')
    }

    if (isDoc) {
      if (type === 'a') {
        const res = await fetch(`https://api.vreden.my.id/api/ytmp3?url=${url}`)
        const json = await res.json()
        const download = json?.result?.download?.url
        if (!download) throw new Error('No se pudo obtener el audio.')
        await sendMsg('document', download, `${title}.mp3`, 'audio/mpeg')
      } else {
        const res = await fetch(`https://api.neoxr.eu/api/youtube?url=${url}&type=video&quality=360p&apikey=GataDios`)
        const json = await res.json()
        const download = json?.data?.url
        if (!download) throw new Error('No se pudo obtener el video.')
        await sendMsg('document', download, `${title}.mp4`, 'video/mp4')
      }
    }

    //delete tempSearchResults[m.sender]
  } catch (e) {
    console.error('Error en descarga:', e)
    m.reply(`❌ Error en la descarga:\n${e.message}`)
  }
}

handler.command = ['yts', 'ytsearch']
handler.group = true
export default handler

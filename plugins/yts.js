import fetch from 'node-fetch'
import yts from 'yt-search'
import axios from 'axios';
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
✑ *Audio* ➧ Responde a este mensaje escribiendo \`a número\`
*Ejemplo:* \`a 1\`

✑ *Video* ➧ Responde a este mensaje escribiendo \`v número\`
*Ejemplo:* \`v 1\`

✑ *Documento* ➧ Responde a este mensaje escribiendo \`d número [tipo]\`
*Ejemplo:* \`d 1 audio\`
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
const jpg = videoUrls[Math.floor(Math.random() * videoUrls.length)];
const im = await (await fetch(icono)).buffer()

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

  async () => conn.sendMessage(
    m.chat,
    {
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
    },
    { quoted: m }
  ),

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
          },
      },
  }, { quoted: m })
];

const randomFormato = formatos[Math.floor(Math.random() * formatos.length)];
await randomFormato();
// 🟢🟢
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
  const match = text.match(/^(a|v|d)\s?(\d+)(?:\s(audio|video))?$/i)
  if (!match) return

  const [_, type, numStr, docType] = match
  const index = parseInt(numStr) - 1
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
      }, { quoted: m.quoted })
    }

    if (type === 'a') {
      await m.reply(`Enviando`)
      const res = await fetch(`https://api.vreden.my.id/api/ytmp3?url=${url}`)
      const json = await res.json()
      const download = json?.result?.download?.url
      if (!download) throw new Error('No se pudo obtener el audio.')
      await sendMsg('audio', download, title + '.mp3', 'audio/mpeg')
    }

    if (type === 'v') {
      await m.reply(`Enviando`)
      const res = await fetch(`https://api.neoxr.eu/api/youtube?url=${url}&type=video&quality=360p&apikey=GataDios`)
      const json = await res.json()
      const download = json?.data?.url
      if (!download) throw new Error('No se pudo obtener el video.')
      await sendMsg('video', download, title + '.mp4', 'video/mp4')
    }

    if (type === 'd') {
      const form = docType === 'video' ? 'video' : 'audio'
      await m.reply(`Enviando`)
      if (form === 'audio') {
        const res = await fetch(`https://api.vreden.my.id/api/ytmp3?url=${url}`)
        const json = await res.json()
        const download = json?.result?.download?.url
        if (!download) throw new Error('No se pudo obtener el audio.')
        await sendMsg('document', download, title + '.mp3', 'audio/mpeg')
      } else {
        const res = await fetch(`https://api.neoxr.eu/api/youtube?url=${url}&type=video&quality=360p&apikey=GataDios`)
        const json = await res.json()
        const download = json?.data?.url
        if (!download) throw new Error('No se pudo obtener el video.')
        await sendMsg('document', download, title + '.mp4', 'video/mp4')
      }
    }
  } catch (e) {
    console.error('Error en descarga:', e)
    m.reply(`❌ Error en la descarga:\n${e.message}`)
  }
}

handler.command = ['yts', 'ytsearch']
handler.group = true;
export default handler

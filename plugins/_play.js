import Starlights from '@StarlightsTeam/Scraper'
let limitAudio = 200
let limitVideo = 300

let handler = async (m, { conn, text }) => {
  if (!m.quoted) return conn.reply(m.chat, `Etiqueta el mensaje del bot con el resultado de YouTube.`, m).then(_ => m.react('✖️'))
  if (!m.quoted.text.includes("╭───── • ─────╮")) return conn.reply(m.chat, `Ese mensaje no parece ser un resultado de YouTube.`, m).then(_ => m.react('✖️'))

  let urls = m.quoted.text.match(/(?:https?:\/\/)?(?:youtu\.be\/|(?:www\.|m\.)?youtube\.com\/(?:watch|v|embed|shorts)(?:\.php)?(?:\?.*v=|\/))([a-zA-Z0-9\_-]+)/gi)
  if (!urls || urls.length < 1) return m.reply(`No se encontró el enlace.`, m).then(_ => m.react('✖️'))

  let format = text.trim().toLowerCase()
  if (!format) return m.reply(`Escribe el formato que deseas: audio, video, mp3, mp4, audiodoc, videodoc, mp3doc o mp4doc`).then(_ => m.react('✖️'))

  await m.react('🕐')

  try {
    let v = urls[0]
    let isAudio = format.includes('audio') || format.includes('mp3')
    let isDoc = format.includes('doc')

    let data = isAudio ? await Starlights.ytmp3(v) : await Starlights.ytmp4(v)
    let size = parseFloat(data.size)

    if (isAudio && size >= limitAudio) return m.reply(`El audio pesa más de ${limitAudio} MB.`).then(_ => m.react('✖️'))
    if (!isAudio && size >= limitVideo) return m.reply(`El video pesa más de ${limitVideo} MB.`).then(_ => m.react('✖️'))

    let mimetype = isAudio ? 'audio/mpeg' : 'video/mp4'
    let filename = `${data.title}.${isAudio ? 'mp3' : 'mp4'}`

    await conn.sendMessage(m.chat, {
      [isDoc ? 'document' : isAudio ? 'audio' : 'video']: { url: data.dl_url },
      mimetype,
      fileName: filename
    }, { quoted: m })

    await m.react('✅')
  } catch {
    await m.react('✖️')
    conn.reply(m.chat, `No se pudo descargar.`, m)
  }
}

handler.customPrefix = /^audio|video|audiodoc|videodoc|mp3|mp4|mp3doc|mp4doc$/i
handler.command = new RegExp // descarga directa al detectar palabra clave
export default handler

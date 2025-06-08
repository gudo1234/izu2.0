import Starlights from '@StarlightsTeam/Scraper'
let limitAudio = 200
let limitVideo = 300

let handler = async (m, { conn, text, isPrems, isOwner, usedPrefix, command }) => {
  if (!m.quoted) return conn.reply(m.chat, `[ ✰ ] Etiqueta el mensaje que contenga el resultado de YouTube Play.`, m).then(_ => m.react('✖️'))
  if (!m.quoted.text.includes("╭───── • ─────╮")) return conn.reply(m.chat, `[ ✰ ] Etiqueta el mensaje que contenga el resultado de YouTube Play.`, m).then(_ => m.react('✖️'))

  let urls = m.quoted.text.match(new RegExp(/(?:https?:\/\/)?(?:youtu\.be\/|(?:www\.|m\.)?youtube\.com\/(?:watch|v|embed|shorts)(?:\.php)?(?:\?.*v=|\/))([a-zA-Z0-9\_-]+)/, 'gi'))
  if (!urls) return conn.reply(m.chat, `Resultado no Encontrado.`, m).then(_ => m.react('✖️'))
  if (urls.length < 1) return conn.reply(m.chat, `Resultado no Encontrado.`, m).then(_ => m.react('✖️'))

  const formatList = ['audio', 'video', 'audiodoc', 'videodoc', 'mp3', 'mp4', 'mp3doc', 'mp4doc']
  let feature = text.trim().toLowerCase()

  if (!formatList.includes(feature)) {
    return conn.reply(m.chat, `[ ✰ ] Especifica el formato que deseas descargar.\n\n` +
      `*» Formatos válidos:*\n- audio\n- video\n- audiodoc\n- videodoc\n- mp3\n- mp4\n- mp3doc\n- mp4doc\n\n` +
      `*Ejemplo:* ${usedPrefix + command} mp3`, m).then(_ => m.react('✖️'))
  }

  let user = global.db.data.users[m.sender]
  await m.react('🕓')

  try {
    let v = urls[0]
    let isAudio = feature.includes('audio') || feature.includes('mp3')
    let isDoc = feature.includes('doc')

    let data = isAudio ? await Starlights.ytmp3(v) : await Starlights.ytmp4(v)
    let size = parseFloat(data.size)

    if (isAudio && size >= limitAudio) return m.reply(`El archivo pesa más de ${limitAudio} MB, se canceló la descarga.`).then(_ => m.react('✖️'))
    if (!isAudio && size >= limitVideo) return m.reply(`El archivo pesa más de ${limitVideo} MB, se canceló la descarga.`).then(_ => m.react('✖️'))

    let mimetype = isAudio ? 'audio/mpeg' : 'video/mp4'
    let filename = `${data.title}.${isAudio ? 'mp3' : 'mp4'}`

    await conn.sendMessage(m.chat, {
      [isDoc ? 'document' : isAudio ? 'audio' : 'video']: { url: data.dl_url },
      mimetype,
      fileName: filename
    }, { quoted: m })

    await m.react('✅')
  } catch (e) {
    await m.react('✖️')
  }
}

handler.command = /^audio|video|audiodoc|videodoc|mp3|mp4|mp3doc|mp4doc$/i
export default handler

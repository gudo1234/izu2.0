import Starlights from '@StarlightsTeam/Scraper'
let limitAudio = 200
let limitVideo = 300

let handler = async (m, { conn, text, isPrems, isOwner, usedPrefix, command }) => {
  if (!m.quoted) return conn.reply(m.chat, `[ ✰ ] Etiqueta el mensaje que contenga el resultado de YouTube Play.`, m, rcanal).then(_ => m.react('✖️'))
  if (!m.quoted.text.includes("𖤐 `YOUTUBE EXTRACTOR` 𖤐")) return conn.reply(m.chat, `[ ✰ ] Etiqueta el mensaje que contenga el resultado de YouTube Play.`, m, rcanal).then(_ => m.react('✖️'))

  let urls = m.quoted.text.match(new RegExp(/(?:https?:\/\/)?(?:youtu\.be\/|(?:www\.|m\.)?youtube\.com\/(?:watch|v|embed|shorts)(?:\.php)?(?:\?.*v=|\/))([a-zA-Z0-9\_-]+)/, 'gi'))
  if (!urls) return conn.reply(m.chat, `Resultado no Encontrado.`, m, rcanal).then(_ => m.react('✖️'))
  if (urls.length < text) return conn.reply(m.chat, `Resultado no Encontrado.`, m, rcanal).then(_ => m.react('✖️'))

  let user = global.db.data.users[m.sender]
  await m.react('🕓')

  let tipo = m.text.toLowerCase().includes('audio') ? 'audio' : (m.text.toLowerCase().includes('video') || m.text.toLowerCase().includes('vídeo')) ? 'video' : null
  if (!tipo) return conn.reply(m.chat, `[ ✰ ] Especifica si quieres 'audio' o 'video'.`, m, rcanal).then(_ => m.react('✖️'))

  try {
    let v = urls[0]

    if (tipo == 'audio') {
      let { title, size, quality, thumbnail, dl_url } = await Starlights.ytmp3(v)
      if (size.split('MB')[0] >= limitAudio) return m.reply(`El archivo pesa más de ${limitAudio} MB, se canceló la descarga.`).then(_ => m.react('✖️'))

      await conn.sendFile(m.chat, dl_url, title + '.mp3', null, m, false, {
        mimetype: 'audio/mpeg',
        asDocument: user.useDocument
      })
    } else if (tipo == 'video') {
      let { title, size, quality, thumbnail, dl_url } = await Starlights.ytmp4(v)
      if (size.split('MB')[0] >= limitVideo) return m.reply(`El archivo pesa más de ${limitVideo} MB, se canceló la descarga.`).then(_ => m.react('✖️'))

      await conn.sendFile(m.chat, dl_url, title + '.mp4', `*» Título* : ${title}\n*» Calidad* : ${quality}`, m, false, {
        asDocument: user.useDocument
      })
    }

    await m.react('✅')
  } catch {
    await m.react('✖️')
  }
}

handler.customPrefix = /^(Audio|audio|Video|video|Vídeo|vídeo)/
handler.command = new RegExp
export default handler

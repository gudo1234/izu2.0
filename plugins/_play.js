import Starlights from '@StarlightsTeam/Scraper'
let limitAudio = 200
let limitVideo = 300

let handler = async (m, { conn, text }) => {
  if (!m.quoted) return m.react('✖️')
  if (!m.quoted.text.includes("╭───── • ─────╮")) return m.react('✖️')

  let urls = m.quoted.text.match(/(?:https?:\/\/)?(?:youtu\.be\/|(?:www\.|m\.)?youtube\.com\/(?:watch|v|embed|shorts)(?:\.php)?(?:\?.*v=|\/))([a-zA-Z0-9\_-]+)/gi)
  if (!urls) return m.react('✖️')

  let tipo = text?.toLowerCase().includes('audio') ? 'audio' : text?.toLowerCase().includes('video') ? 'video' : null
  if (!tipo) return m.react('✖️')

  let user = global.db.data.users[m.sender]
  await m.react('🕓')

  try {
    let link = urls[0]

    if (tipo === 'audio') {
      let { title, size, dl_url } = await Starlights.ytmp3(link)
      if (parseFloat(size) > limitAudio) return m.reply(`El archivo pesa más de ${limitAudio} MB.`).then(_ => m.react('✖️'))

      await conn.sendFile(m.chat, dl_url, `${title}.mp3`, null, m, false, {
        mimetype: 'audio/mpeg',
        asDocument: user.useDocument
      })
    } else if (tipo === 'video') {
      let { title, size, quality, dl_url } = await Starlights.ytmp4(link)
      if (parseFloat(size) > limitVideo) return m.reply(`El archivo pesa más de ${limitVideo} MB.`).then(_ => m.react('✖️'))

      await conn.sendFile(m.chat, dl_url, `${title}.mp4`, `*» Título:* ${title}\n*» Calidad:* ${quality}`, m, false, {
        asDocument: user.useDocument
      })
    }

    await m.react('✅')
  } catch {
    await m.react('✖️')
  }
}

handler.customPrefix = /^(audio|video)$/i
handler.command = new RegExp
export default handler

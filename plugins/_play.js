import Starlights from '@StarlightsTeam/Scraper'
let limitAudio = 200
let limitVideo = 300

let handler = async (m, { conn, text }) => {
  if (!m.quoted) return m.react('✖️')
  if (!m.quoted.text.includes("╭───── • ─────╮")) return m.react('✖️')

  let urls = m.quoted.text.match(/https?:\/\/(?:www\.)?(?:youtube\.com|youtu\.be)\/[^\s]+/gi)
  if (!urls) return m.react('✖️')

  let format = text?.trim()?.toLowerCase()
  if (!/^(audio|video)$/.test(format)) return m.react('✖️')

  try {
    await m.react('🕐')
    let link = urls[0]
    let user = global.db.data.users[m.sender]

    if (format === 'audio') {
      let { title, size, dl_url } = await Starlights.ytmp3(link)
      if (parseFloat(size) > limitAudio) return m.reply(`El audio pesa más de ${limitAudio} MB.`).then(_ => m.react('✖️'))

      await conn.sendFile(m.chat, dl_url, `${title}.mp3`, null, m, false, {
        mimetype: 'audio/mpeg',
        asDocument: user.useDocument
      })
    } else {
      let { title, size, quality, dl_url } = await Starlights.ytmp4(link)
      if (parseFloat(size) > limitVideo) return m.reply(`El video pesa más de ${limitVideo} MB.`).then(_ => m.react('✖️'))

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

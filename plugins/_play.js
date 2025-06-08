import Starlights from '@StarlightsTeam/Scraper'
let limitAudio = 200
let limitVideo = 300

let handler = async (m, { conn, text }) => {
  if (!m.quoted) return m.react('✖️')
  if (!m.quoted.text.includes("╭───── • ─────╮")) return m.react('✖️')

  let urls = m.quoted.text.match(/https?:\/\/(?:www\.)?(?:youtube\.com|youtu\.be)\/[^\s]+/gi)
  if (!urls) return m.react('✖️')

  let format = text?.trim()?.toLowerCase()
  if (!/^(audio|video|audiodoc|videodoc|mp3|mp4|mp3doc|mp4doc)$/.test(format)) return m.react('✖️')

  let isAudio = /audio|mp3/.test(format)
  let isDoc = /doc$/.test(format)

  try {
    await m.react('🕐')
    let link = urls[0]
    let user = global.db.data.users[m.sender]
    let data = isAudio ? await Starlights.ytmp3(link) : await Starlights.ytmp4(link)
    let size = parseFloat(data.size)

    if (isAudio && size > limitAudio) return m.reply(`El audio pesa más de ${limitAudio} MB.`).then(_ => m.react('✖️'))
    if (!isAudio && size > limitVideo) return m.reply(`El video pesa más de ${limitVideo} MB.`).then(_ => m.react('✖️'))

    let ext = isAudio ? 'mp3' : 'mp4'
    let mimetype = isAudio ? 'audio/mpeg' : 'video/mp4'

    await conn.sendMessage(m.chat, {
      [isDoc ? 'document' : isAudio ? 'audio' : 'video']: { url: data.dl_url },
      mimetype,
      fileName: `${data.title}.${ext}`,
      caption: isDoc ? undefined : `*» Título:* ${data.title}\n*» Calidad:* ${data.quality}`
    }, { quoted: m })

    await m.react('✅')
  } catch (e) {
    console.error(e)
    await m.react('✖️')
  }
}

handler.customPrefix = /^(audio|video|audiodoc|videodoc|mp3|mp4|mp3doc|mp4doc)$/i
handler.command = new RegExp
export default handler

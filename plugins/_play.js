import Starlights from '@StarlightsTeam/Scraper'
let limitAudio = 200
let limitVideo = 300

let handler = async (m, { conn, text }) => {
  if (!m.quoted) return m.react('✖️')
  if (!m.quoted.text.includes("╭───── • ─────╮")) return m.react('✖️')

  let urls = m.quoted.text.match(/(?:https?:\/\/)?(?:youtu\.be\/|(?:www\.|m\.)?youtube\.com\/(?:watch|v|embed|shorts)(?:\.php)?(?:\?.*v=|\/))([a-zA-Z0-9\_-]+)/gi)
  if (!urls || urls.length < 1) return m.react('✖️')

  let format = text.trim().toLowerCase()
  if (!format) return m.react('✖️')

  await m.react('🕐')

  try {
    let v = urls[0]
    let isAudio = format.includes('audio') || format.includes('mp3')
    let isDoc = format.includes('doc')

    let data = isAudio ? await Starlights.ytmp3(v) : await Starlights.ytmp4(v)
    let size = parseFloat(data.size)

    if (isAudio && size >= limitAudio) return m.react('✖️')
    if (!isAudio && size >= limitVideo) return m.react('✖️')

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
  }
}

handler.customPrefix = /^audio|video|audiodoc|videodoc|mp3|mp4|mp3doc|mp4doc$/i
handler.command = new RegExp
export default handler

import fetch from 'node-fetch'
import { format } from 'util'

let handler = async (m, { text, conn, command, usedPrefix }) => {
  if (!/^https?:\/\//.test(text))
    return conn.reply(m.chat, `⚠️ Ejemplo: *${usedPrefix + command}* https://hdyc.online/graduacion/`, m)

  m.react('🕒')

  try {
    const res = await fetch(text)
    const html = await res.text()
    const contentType = res.headers.get('content-type') || ''

    // Buscar enlaces directos a .mp4 dentro del HTML
    const videoMatch = html.match(/https?:\/\/[^\s"']+\.mp4[^\s"']*/i)

    if (videoMatch) {
      const videoUrl = videoMatch[0]
      const videoRes = await fetch(videoUrl)
      const buffer = await videoRes.buffer()

      m.react('✅')
      return conn.sendFile(m.chat, buffer, 'video.mp4', videoUrl, m, null, false, { mimetype: 'video/mp4' })
    }

    // Si no encuentra el .mp4, pero el tipo es video
    if (/video|audio/.test(contentType)) {
      const buffer = await res.buffer()
      m.react('✅')
      return conn.sendFile(m.chat, buffer, 'video.mp4', text, m, null, false, { mimetype: 'video/mp4' })
    }

    // Si no hay video, mostrar parte del HTML
    return m.reply(html.slice(0, 1024) + '...')
  } catch (e) {
    console.error(e)
    m.reply(`❌ Error: ${e.message}`)
  }
}

handler.command = ['fetch', 'get']
handler.group = true
export default handler

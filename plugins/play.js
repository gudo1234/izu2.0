import axios from 'axios'

let handler = async (m, { conn, text }) => {
  if (!text) return m.reply('🚫 Ingresa un enlace de YouTube válido.')

  try {
    let apiUrl = `https://api-nv.ultraplus.click/api/dl/yt-direct?url=${encodeURIComponent(text)}&key=2yLJjTeqXudWiWB8`
    let { status } = await axios.get(apiUrl)

    if (status !== 200) throw new Error(`Error HTTP ${status}`)

    await conn.sendMessage(m.chat, {
      audio: { url: apiUrl },
      mimetype: 'audio/mp4',
      ptt: true // nota de voz
    }, { quoted: m })

  } catch (e) {
    console.error(e)
    m.reply(`❌ Error inesperado: ${e.message}`)
  }
}

handler.help = ['ytptt']
handler.tags = ['downloader']
handler.command = ['play']

export default handler

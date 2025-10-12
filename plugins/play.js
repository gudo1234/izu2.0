import axios from 'axios'

let handler = async (m, { conn, text }) => {
  if (!text) return m.reply('🚫 Ingresa un enlace de YouTube válido.')

  try {
    const apiUrl = `https://api-nv.ultraplus.click/api/dl/yt-direct?url=${encodeURIComponent(text)}&type=audio&key=2yLJjTeqXudWiWB8`

    const { data } = await axios.get(apiUrl)
    if (!data || !data.status) throw new Error('Sin datos válidos en la API')

    const dlUrl = data.result?.url || data.url || null
    if (!dlUrl) throw new Error('No se obtuvo enlace de descarga')

    await conn.sendMessage(m.chat, {
      audio: { url: dlUrl },
      mimetype: 'audio/mp4',
      ptt: true
    }, { quoted: m })

    await m.react('✅')
  } catch (e) {
    console.error(e.response?.data || e.message)
    m.reply(`❌ Error inesperado: ${e.response?.status || e.message}`)
  }
}

handler.help = ['ytptt']
handler.tags = ['downloader']
handler.command = ['play']

export default handler

import axios from 'axios'

let handler = async (m, { conn, text }) => {
  if (!text) return m.reply('🚫 Ingresa un enlace de YouTube válido.')

  try {
    // Usa exactamente el formato que mencionaste
    const apiUrl = `https://api-nv.ultraplus.click/api/dl/yt-direct?url=${encodeURIComponent(text)}=audio&key=2yLJjTeqXudWiWB8`

    // Petición directa para verificar la validez
    const response = await axios.get(apiUrl, { responseType: 'arraybuffer' })
    if (response.status !== 200) throw new Error(`HTTP ${response.status}`)

    // Enviar el audio como nota de voz
    await conn.sendMessage(m.chat, {
      audio: { url: apiUrl },
      mimetype: 'audio/mp4',
      ptt: true
    }, { quoted: m })

  } catch (e) {
    console.error(e.response?.data || e.message)
    m.reply(`❌ Error inesperado: ${e.response?.status || e.message}`)
  }
}

handler.command = ['play']

export default handler

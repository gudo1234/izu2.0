import fetch from 'node-fetch'

let handler = async (m, { conn, text }) => {
  if (!text) return m.reply('🚫 Ingresa un enlace de YouTube válido.')

  try {
    let apiUrl = `https://api-nv.ultraplus.click/api/dl/yt-direct?url=${encodeURIComponent(text)}&key=2yLJjTeqXudWiWB8`

    let res = await fetch(apiUrl)
    if (!res.ok) throw new Error(`Error HTTP ${res.status}`)

    // Devuelve directamente el audio
    await conn.sendMessage(m.chat, {
      audio: { url: apiUrl },
      mimetype: 'audio/mp4',
      ptt: true  // nota de voz
    }, { quoted: m })

  } catch (e) {
    console.error(e)
    m.reply(`❌ Error inesperado: ${e.message}`)
  }
}

handler.command = ['play']

export default handler

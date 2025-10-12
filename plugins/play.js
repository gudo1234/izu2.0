import axios from 'axios'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const username = conn.getName(m.sender)

  if (!text) {
    return conn.sendMessage(m.chat, {
      text: `🎵 Hola *${username}*, necesito el enlace de YouTube.\n\nEjemplo:\n*${usedPrefix + command} https://youtube.com/watch?v=UWV41yEiGq0*`
    }, { quoted: m })
  }

  try {
    m.react('⏳')

    // ✅ URL correcta sin "=audio"
    const apiUrl = `https://api-nv.ultraplus.click/api/dl/yt-direct?url=${encodeURIComponent(text)}&key=2yLJjTeqXudWiWB8`

    const response = await axios.get(apiUrl)
    const result = response.data

    if (!result || !result.status) throw new Error('Respuesta inválida de la API.')

    // Verifica las rutas posibles que devuelve la API
    const audioUrl =
      result.data?.audio?.url ||
      result.audio ||
      result.url ||
      result.data?.url ||
      null

    if (!audioUrl) throw new Error('No se encontró el enlace de audio.')

    const title = result.data?.title || result.title || 'Audio de YouTube'
    const duration = result.data?.duration || result.duration || 'Desconocida'
    const thumbnail = result.data?.thumbnail || result.thumbnail || ''

    await conn.sendMessage(m.chat, {
      audio: { url: audioUrl },
      mimetype: 'audio/mpeg',
      fileName: `${title}.mp3`,
      contextInfo: {
        externalAdReply: {
          title,
          body: `🎧 Duración: ${duration}`,
          thumbnailUrl: thumbnail,
          sourceUrl: text,
          mediaType: 2,
          showAdAttribution: true
        }
      }
    }, { quoted: m })

    m.react('✅')

  } catch (err) {
    console.error('❌ Error en play audio:', err)
    m.react('❌')
    await conn.sendMessage(m.chat, {
      text: `❌ *Error al obtener el audio:*\n${err.message}`
    }, { quoted: m })
  }
}

handler.command = ['play', 'ytmp3', 'audio']
handler.group = true

export default handler

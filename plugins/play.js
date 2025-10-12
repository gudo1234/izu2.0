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

    // 🔗 Petición a la API ultraplus
    const apiUrl = `https://api-nv.ultraplus.click/api/dl/yt-direct?url=${encodeURIComponent(text)}&key=2yLJjTeqXudWiWB8`

    const response = await axios.get(apiUrl)
    const result = response.data

    // La API devuelve una estructura, pero el audio directo está en `result.audio` o `result.url`
    const audioUrl = result.audio || result.url || result.result || result.data?.audio

    if (!audioUrl) throw new Error('No se encontró el enlace de audio.')

    const caption = `🎧 *Descargado desde YouTube*\n\n📌 *Título:* ${result.title || 'Desconocido'}\n⏱️ *Duración:* ${result.duration || 'N/A'}\n\n> Enviado por ${conn.user.name}`

    await conn.sendMessage(m.chat, {
      audio: { url: audioUrl },
      mimetype: 'audio/mpeg',
      fileName: `${result.title || 'audio'}.mp3`,
      contextInfo: {
        externalAdReply: {
          title: result.title || 'Audio de YouTube',
          body: 'Descargado con UltraPlus API',
          thumbnailUrl: result.thumbnail || '',
          sourceUrl: text,
          mediaType: 2,
          showAdAttribution: true
        }
      }
    }, { quoted: m })

    m.react('✅')

  } catch (err) {
    console.error(err)
    m.react('❌')
    await conn.sendMessage(m.chat, {
      text: `❌ *Error al obtener el audio:*\n${err.message}`
    }, { quoted: m })
  }
}

handler.command = ['play', 'ytmp3', 'audio']
handler.group = true

export default handler

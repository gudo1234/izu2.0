import axios from "axios"

let handler = async (m, { conn, text }) => {
  if (!text) return conn.reply(m.chat, `❗ Por favor proporciona el nombre de una canción o artista.`, m)
  
  try {
    await m.react('⌛')
    
    // Llamada a la API para buscar canción en Spotify
    let response = await axios.get(`https://velyn.biz.id/api/search/spotify?query=${encodeURIComponent(text)}`)
    if (!response.data.status || !response.data.data || response.data.data.length === 0) {
      await m.react('❌')
      return conn.reply(m.chat, 'No se encontró ninguna canción con ese nombre.', m)
    }
    
    // Tomamos el primer resultado
    let track = response.data.data[0]

    // Datos útiles que esperamos en track:
    // track.title, track.artists (array), track.duration, track.cover (imagen), track.url (descarga directa)
    
    let caption = `★━━━━━━━━━━━━━━━━━━━━★
🎶 𝐒𝐩𝐨𝐭𝐢𝐟𝐲 𝐓𝐫𝐚𝐜𝐤 𝐃𝐨𝐰𝐧𝐥𝐨𝐚𝐝𝐞𝐫 🎶\n
𝘼𝙧𝙩𝙞𝙨𝙩𝙖: ${track.artists.join(", ")}\n
𝐓í𝐭𝐮𝐥𝐨: ${track.title}\n
𝐃𝐮𝐫𝐚𝐜𝐢ó𝐧: ${track.duration}
★━━━━━━━━━━━━━━━━━━━━★`

    // Enviamos la portada con info
    await conn.sendFile(m.chat, track.cover, 'cover.jpg', caption, m)

    // Enviamos el audio con la URL que da la API
    await conn.sendMessage(m.chat, {
      audio: { url: track.url },
      fileName: `${track.title}.mp3`,
      mimetype: 'audio/mpeg'
    }, { quoted: m })

    await m.react('✅')

  } catch (error) {
    console.error(error)
    await m.react('❌')
    return conn.reply(m.chat, 'Ocurrió un error al intentar descargar la canción.', m)
  }
}

handler.command = ['spotify']
handler.group = true
export default handler

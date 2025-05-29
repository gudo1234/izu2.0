import axios from "axios"

let handler = async (m, { conn, text }) => {
  if (!text) return conn.reply(m.chat, `❗ Por favor proporciona el nombre de una canción o artista.`, m)
  
  try {
    await m.react('⌛')
    
    // Buscar en API velyn.biz.id
    let response = await axios.get(`https://velyn.biz.id/api/search/spotify?query=${encodeURIComponent(text)}`)
    if (!response.data.status || !response.data.data || response.data.data.length === 0) {
      await m.react('❌')
      return conn.reply(m.chat, 'No se encontró ninguna canción con ese nombre.', m)
    }
    
    let track = response.data.data[0]

    // Formatear duración en mm:ss
    let durSeg = Math.floor(track.duration_ms / 1000)
    let minutos = Math.floor(durSeg / 60)
    let segundos = durSeg % 60
    let duracionFmt = `${minutos}:${segundos.toString().padStart(2,'0')}`

    let caption = `★━━━━━━━━━━━━━━━━━━━━★
🎶 𝐒𝐩𝐨𝐭𝐢𝐟𝐲 𝐓𝐫𝐚𝐜𝐤 𝐈𝐧𝐟𝐨 🎶\n
𝘼𝙧𝙩𝙞𝙨𝙩𝙖: ${track.artists}\n
𝐓í𝐭𝐮𝐥𝐨: ${track.name}\n
𝐃𝐮𝐫𝐚𝐜𝐢ó𝐧: ${duracionFmt}\n
🔗 Link: ${track.link}
★━━━━━━━━━━━━━━━━━━━━★`

    await conn.sendFile(m.chat, track.image, 'cover.jpg', caption, m)
    await m.react('✅')

  } catch (error) {
    console.error(error)
    await m.react('❌')
    return conn.reply(m.chat, 'Ocurrió un error al buscar la canción.', m)
  }
}

handler.command = ['spotify']
handler.group = true
export default handler

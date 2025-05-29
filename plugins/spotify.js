import axios from "axios"

let handler = async (m, { conn, text }) => {
  if (!text) return conn.reply(m.chat, `❗ Por favor proporciona el nombre de una canción o artista.`, m)
  
  try {
    await m.react('⌛')
    
    // 1. Buscar en API velyn.biz.id
    let response = await axios.get(`https://velyn.biz.id/api/search/spotify?query=${encodeURIComponent(text)}`)
    if (!response.data.status || !response.data.data || response.data.data.length === 0) {
      await m.react('❌')
      return conn.reply(m.chat, 'No se encontró ninguna canción con ese nombre.', m)
    }
    
    let track = response.data.data[0]

    // 2. Descargar mp3 usando link con la función spotifydl que tenías antes
    let downloadInfo = await spotifydl(track.link)
    if (!downloadInfo.status) {
      await m.react('❌')
      return conn.reply(m.chat, 'No se pudo descargar la canción.', m)
    }

    // Formatear duración en mm:ss
    let durSeg = Math.floor(track.duration_ms / 1000)
    let minutos = Math.floor(durSeg / 60)
    let segundos = durSeg % 60
    let duracionFmt = `${minutos}:${segundos.toString().padStart(2,'0')}`

    let caption = `★━━━━━━━━━━━━━━━━━━━━★
🎶 𝐒𝐩𝐨𝐭𝐢𝐟𝐲 𝐓𝐫𝐚𝐜𝐤 𝐃𝐨𝐰𝐧𝐥𝐨𝐚𝐝𝐞𝐫 🎶\n
𝘼𝙧𝙩𝙞𝙨𝙩𝙖: ${track.artists}\n
𝐓í𝐭𝐮𝐥𝐨: ${track.name}\n
𝐃𝐮𝐫𝐚𝐜𝐢ó𝐧: ${duracionFmt}
★━━━━━━━━━━━━━━━━━━━━★`

    await conn.sendFile(m.chat, track.image, 'cover.jpg', caption, m)
    
    await conn.sendMessage(m.chat, {
      audio: { url: downloadInfo.download },
      fileName: `${track.name}.mp3`,
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

// Reusa tu función spotifydl original para descargar mp3 de link Spotify
async function spotifydl(url) {
  try {
    let maxIntentos = 10
    let intentos = 0;
    let statusOk = 0;
    let res;
    let data; // se movió aquí para poder usar en return
    while (statusOk!==3 && statusOk!==-3 && intentos < maxIntentos) {
      try 
      {
          let res1 = await axios.get('https://api.fabdl.com/spotify/get?url=' + url, {
          headers: {
            accept: "application/json, text/plain, */*",
            "accept-language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
            referer: "https://spotifydownload.org/",
          }});
          data = res1.data;
          let res2 = await axios.get(`https://api.fabdl.com/spotify/mp3-convert-task/${data.result.gid}/${data.result.id}`, {
          headers: {
            accept: "application/json, text/plain, */*",
            "accept-language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
            referer: "https://spotifydownload.org/",
          }});
          res=res2.data;
          statusOk=res.result.status;
          intentos++;
          if (statusOk!==3 && statusOk!==-3) await new Promise(resolve => setTimeout(resolve, 3000));
      } 
      catch (error) {
        return {
          status: false,
          message:"Error inesperado.",
          code: 500,
          creator:"Enigma Team"
        };
      }
    }
    if(statusOk!==3) return {
      status: false,
      message:"Error inesperado.",
      code: 500,
      creator:"Enigma Team"
    };
    
    return({
      status: true,
      title: data.result.name,
      duration: data.result.duration_ms,
      cover: data.result.image,
      download: "https://api.fabdl.com" + res.result.download_url,
      creator:"Enigma Team"
    })
  } 
  catch (e) {
    return {
      status: false,
      message:"Error inesperado.",
      code: 500,
      creator:"Enigma Team"
    }
  }
}

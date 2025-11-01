import fetch from 'node-fetch'

let handler = async (m, { text, conn, command, usedPrefix }) => {
  if (!/^https?:\/\//.test(text))
    return conn.reply(m.chat, `❌ Ingresa la URL de un pin de Pinterest.\n\nEjemplo:\n*${usedPrefix + command}* https://www.pinterest.com/pin/123456789/`, m)

  await m.react('🕒')

  try {
    // Detectar URL de Pinterest
    const pinterestMatch = text.match(/https?:\/\/(www\.)?pinterest\.[a-z]+\/pin\/(\d+)/)
    if (!pinterestMatch) return conn.reply(m.chat, `❌ URL no válida de Pinterest.`, m)

    const pinId = pinterestMatch[2]
    const pinApi = `https://api.pinterest.com/v3/pidgets/pins/info/?pin_ids=${pinId}`
    const pinRes = await fetch(pinApi)
    const pinJson = await pinRes.json()
    const pinData = pinJson.data[pinId]

    if (pinData?.videos?.video_list) {
      const videoKeys = Object.keys(pinData.videos.video_list)
      // Tomamos la mejor calidad disponible
      const videoUrl = pinData.videos.video_list[videoKeys[videoKeys.length - 1]].url
      await conn.sendMessage(m.chat, { video: { url: videoUrl }, caption: `📌 Video de Pinterest` }, { quoted: m })
      await m.react('✅')
    } else {
      // Si no hay video, enviamos un mensaje
      return conn.reply(m.chat, `❌ Este pin no contiene video.`, m)
    }

  } catch (e) {
    console.error(e)
    await m.react('❌')
    m.reply(`❌ Error al descargar el video: ${e.message}`)
  }
}

handler.command = ['in']
handler.group = true
export default handler

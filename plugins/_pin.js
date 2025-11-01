import fetch from 'node-fetch'

let handler = async (m, { text, conn, command, usedPrefix }) => {
  if (!/^https?:\/\//.test(text))
    return conn.reply(m.chat, `❌ Ingresa una URL de Pinterest válida.\n\nEjemplo:\n*${usedPrefix + command}* https://www.pinterest.com/pin/123456789/`, m)

  await m.react('🕒')

  try {
    // Detectar URL de Pinterest
    let pinterestMatch = text.match(/https?:\/\/(www\.)?pinterest\.[a-z]+\/pin\/(\d+)/)
    if (!pinterestMatch) return conn.reply(m.chat, `❌ Solo se permiten URLs de Pinterest con video.`, m)

    const pinId = pinterestMatch[2]
    const pinApi = `https://api.pinterest.com/v3/pidgets/pins/info/?pin_ids=${pinId}`
    const pinRes = await fetch(pinApi)
    const pinJson = await pinRes.json()
    const pinData = pinJson.data[pinId]

    if (pinData && pinData.videos && pinData.videos.video_list) {
      const videoKeys = Object.keys(pinData.videos.video_list)
      const videoUrl = pinData.videos.video_list[videoKeys[0]].url
      await conn.sendMessage(m.chat, { video: { url: videoUrl }, caption: `📌 Pinterest Pin` }, { quoted: m })
    } else {
      return conn.reply(m.chat, `❌ Este pin no contiene video.`, m)
    }

    await m.react('✅')

  } catch (e) {
    console.error(e)
    await m.react('❌')
    m.reply(`❌ Error al obtener el video: ${e.message}`)
  }
}

handler.command = ['in']
handler.group = true
export default handler

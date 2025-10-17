import fetch from 'node-fetch'

let handler = async (m, { conn }) => {
  m.react('✅')

  await conn.sendMessage(m.chat, {
    text: 'hsloo',
    contextInfo: {
      externalAdReply: {
        title: wm,
        body: textbot,
        mediaType: 1,
        thumbnailUrl: icono, // 🔹 Usa URL directa del PNG o WEBP
        sourceUrl: redes,
        renderLargerThumbnail: true
      }
    }
  }, { quoted: m })
}

handler.command = ['ni']
export default handler

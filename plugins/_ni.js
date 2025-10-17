import fetch from 'node-fetch'

let handler = async (m, { conn }) => {
  m.react('✅')
  await conn.sendMessage(m.chat, {
    text: 'hsloo',
    contextInfo: {
      externalAdReply: {
        title: wm,
        body: textbot,
        thumbnailUrl: icono, // usa la URL directamente
        sourceUrl: redes,
        mediaType: 2, // 🔹 muestra la imagen completa
        renderLargerThumbnail: true
      }
    }
  }, { quoted: m })
}

handler.command = ['ni']
export default handler

import fs from 'fs'

let handler = async (m, { conn }) => {
  m.react('✅')

  await conn.sendMessage(m.chat, {
    image: { url: icono }, // tu imagen principal
    caption: 'no',
    contextInfo: {
      externalAdReply: {
        title: "hola",
        body: "Mi bot xd",
        mediaUrl: redes,          // 🔥 Enlaza aquí el link del canal o red
        sourceUrl: redes,         // igual que arriba, por compatibilidad
        mediaType: 1,
        renderLargerThumbnail: true, // 🔥 Hace que la imagen se vea completa
        showAdAttribution: false,
        thumbnailUrl: icono        // 🔥 usa solo thumbnailUrl, NO uses 'thumbnail'
      }
    }
  }, { quoted: m })
}

handler.command = ['ni']
export default handler

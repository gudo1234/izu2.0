import fs from 'fs'

let handler = async (m, { conn }) => {
  m.react('✅')

  await conn.sendMessage(m.chat, {
    image: { url: icono },
    caption: 'apoco',
    contextInfo: {
      externalAdReply: {
        title: "hola",
        body: "Mi bot xd",
        thumbnailUrl: icono, // ✅ solo una, no mezcles con thumbnail
        sourceUrl: redes,
        mediaType: 1,
        showAdAttribution: false,
        renderLargerThumbnail: true
      }
    }
  }, { quoted: m })
}

handler.command = ['ni']
export default handler

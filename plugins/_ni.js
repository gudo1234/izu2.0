import fs from 'fs'

let handler = async (m, { conn }) => {
m.react('✅')
  let txt = 'hokaaaaa'
  await conn.sendMessage(m.chat, {
    image: { url: icono },
    caption: txt.trim(),
    contextInfo: {
      externalAdReply: {
        title: "hola",
        body: "Mi bot xd",
        thumbnailUrl: redes,
        thumbnail: icono,
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

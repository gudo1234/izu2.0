import fs from 'fs'

let handler = async (m, { conn }) => {
  m.react('✅')

  await conn.sendMessage(m.chat, {
      text: 'hsloo',
      contextInfo: {
        externalAdReply: {
          title: wm,
          body: textbot,
          thumbnailUrl: redes,
          thumbnail,
          sourceUrl: redes,
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    }, { quoted: m })
}

handler.command = ['ni']
export default handler

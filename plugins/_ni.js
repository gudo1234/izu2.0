import fs from 'fs'

let handler = async (m, { conn }) => {
  m.react('✅')

  await conn.sendMessage(m.chat, {
  text: 'xdd',
  contextInfo: {
  externalAdReply: {
  title: "hola",
  body: "Mi bot xd",
  sourceUrl: redes,
  mediaType: 1,
  renderLargerThumbnail: true,
  thumbnail:  icono,
  thumbnailUrl: redes
      }
    }
  }, { quoted: m })
}

handler.command = ['ni']
export default handler

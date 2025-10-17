import fetch from 'node-fetch'

let handler = async (m, { conn }) => {
  m.react('✅')
  await conn.sendMessage(m.chat, {
    text: 'hsloo',
    contextInfo: {
      externalAdReply: {
        title: wm,
        body: textbot,
        thumbnailUrl: icono, // usa la URL directa
        sourceUrl: redes,
        mediaType: 2, // muestra imagen completa
        renderLargerThumbnail: true // amplía el área de imagen
      }
    }
  }, { quoted: m })
}

handler.command = ['ni']
export default handler

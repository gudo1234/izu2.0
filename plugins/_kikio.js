let handler = async (m, { conn }) => {
  await conn.sendMessage(m.chat, {
    audio: { url: './media/kikio.mp3'},
    ptt: true,
    mimetype: 'audio/mpeg',
    fileName: 'audio.mp3',
    seconds: 9999
  }, {
    quoted: m,
    ephemeralExpiration: 24 * 60 * 60 // 24 horas en segundos
  })
}

handler.customPrefix = /kikio/
handler.command = new RegExp
export default handler

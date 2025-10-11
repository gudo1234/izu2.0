let handler = async (m, { conn }) => {
  await conn.sendMessage(m.chat, {
    audio: { url: './media/puta.mp3'},
    ptt: true,
    mimetype: 'audio/mpeg',
    fileName: 'audio.mp3',
    seconds: 9999
  }, {
    quoted: m
  })
}

handler.customPrefix = /^(kikio|🌚)$/i
handler.command = new RegExp
export default handler

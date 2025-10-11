let handler = async (m, { conn }) => {
  await conn.sendMessage(m.chat, {
    audio: { url: './media/puta.mp3'},
    ptt: true,
    mimetype: 'audio/mpeg',
    fileName: 'audio.mp3'
  }, {quoted: m})
}

handler.customPrefix = /🫵🏻/
handler.command = new RegExp
export default handler

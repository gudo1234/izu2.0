let handler = async (m, { conn }) => {
  await conn.sendMessage(m.chat, {
    audio: { url: './media/media_puta.mp3'},
    ptt: true,
    mimetype: 'audio/mpeg'
  }, {quoted: m})
}

handler.customPrefix = /🫵🏻/
handler.command = new RegExp
export default handler

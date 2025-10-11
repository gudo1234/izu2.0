let handler = async (m, { conn }) => {
  let vn = './media/puta.mp3'
  conn.sendFile(m.chat, vn, 'carro.mp3', null, m, true, {
  type: 'audioMessage', 
  ptt: true,
  quoted: m
});
}

handler.customPrefix = /🫵🏻/
handler.command = new RegExp
export default handler

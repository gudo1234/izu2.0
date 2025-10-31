let handler = async (m, { conn }) => {
  if (!global.db.data.chats[m.chat]?.audio) return
  let vn = './media/prueba.mp3' //canwe kis forever
  let vn2 = './media/prueba2.mp3' //death bed
  let vn3 = './media/snow.mp3' //snow fall
  let vn4 = './media/sad.mp3' //sad tortuga 
  let vn5 = './media/cardigansad.mp3' // sad luka
  let vn6 = './media/iwas.mp3'
  let vn7 = './media/juntos.mp3'
  let vn8 = './media/space.mp3'
  let vn9 = './media/stellar.mp3'
  let vn10 = './media/theb.mp3'
  let vn11 = './media/alanspectre.mp3'
  conn.sendFile(m.chat, [vn, vn2, vn3, vn4, vn5, vn6, vn7, vn8, vn9, vn10, vn11].getRandom(), 'carro.mp3', null, m, true, {
  type: 'audioMessage', 
  ptt: true,
  quoted: m,
  ephemeralExpiration: 24 * 60 * 60
});
}

handler.customPrefix = /💔|🥲|😢|😭|😞|😔|😟|😫|😩|🥺|🙁|😣|😖|😿|🙁/
handler.command = new RegExp
export default handler

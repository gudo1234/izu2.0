let handler = async (m, { conn }) => {
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
  await conn.sendMessage(m.chat, {
    audio: { url: [vn, vn2, vn3, vn4, vn5, vn6, vn7, vn8, vn9, vn10].getRandom() },
    ptt: true,
    mimetype: 'audio/mpeg',
    fileName: 'audio.mp3',
    seconds: 9999
  }, {
    quoted: m,
    ephemeralExpiration: 24 * 60 * 60 // 24 horas en segundos
  })
}

handler.customPrefix = /💔|🥲|😢|😭|😞|😔|😟|😫|😩|🥺|🙁|😣|😖|😿|🙁/
handler.command = new RegExp
export default handler

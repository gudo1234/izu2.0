let handler = async (m, { conn }) => {
  let vn = './media/prueba.mp3'
  let vn2 = './media/prueba2.mp3'
  let vn3 = './media/snow.mp3'
  let vn4 = './media/sad.mp3'
  let vn5 = './media/cardigansad.mp3'

  await conn.sendMessage(m.chat, {
    audio: { url: [vn, vn2, vn3, vn4, vn5].getRandom() },
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

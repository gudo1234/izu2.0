let handler = async (m, { conn }) => {
  let vn = './media/prueba.mp3'
  let vn2 = './media/prueba2.mp3'
  let vn3 = './media/snow.mp3'
  let vn4 = './media/sad.mp3'

  await conn.sendMessage(m.chat, {
    audio: { url: [vn, vn2, vn3, vn4].getRandom() },
    ptt: true,
    mimetype: 'audio/mpeg',
    fileName: 'audio.mp3',
    seconds: 9999,
    contextInfo: {
      forwardingScore: 999,
      isForwarded: true
    }
  }, {
    quoted: m,
    ephemeralExpiration: 24 * 60 * 60, // 24 horas en segundos
    disappearingMessagesInChat: 24 * 60 * 60
  })
}

handler.customPrefix = /💔|😢|😭|😞|😔|😟|😫|😩|🥺|🙁|😣|😖|😿|🙁/
handler.command = new RegExp
export default handler

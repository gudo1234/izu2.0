aQimport fetch from 'node-fetch'

let handler = async (m, { conn }) => {
  // Audios disponibles
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
  // Intentar obtener la foto de perfil
  let pp
  try {
    pp = await conn.profilePictureUrl(m.messageStubParameters?.[0] || m.sender, 'image')
  } catch {
    pp = icono
  }

  const im = await (await fetch(pp)).buffer()

  // Enviar nota de voz
  await conn.sendMessage(
    m.chat,
    {
      audio: [vn, vn2, vn4, vn5, vn7].getRandom(),
      ptt: true,
      mimetype: 'audio/mpeg',
      fileName: 'welcome.mp3',
      contextInfo: {
        forwardedNewsletterMessageInfo: {
          newsletterJid: channelRD.id,
          serverMessageId: '',
          newsletterName: channelRD.name
        },
        isForwarded: true,
        externalAdReply: {
          title: '🇭🇳 WELCOME',
          body: 'IzuBot te da la bienvenida',
          //previewType: 'PHOTO',
          thumbnailUrl: redes, // se mantiene tu variable original
          thumbnail: im,
          sourceUrl: redes,
          showAdAttribution: false
        }
      }
    },
    { quoted: m }
  )
}

handler.customPrefix = /🇭🇳/
handler.command = new RegExp()

export default handler

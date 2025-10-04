import fetch from 'node-fetch'

let handler = async (m, { conn }) => {
  // Audios disponibles
  const audios = [
    './media/prueba.mp3',
    './media/prueba2.mp3',
    './media/snow.mp3',
    './media/sad.mp3',
    './media/cardigansad.mp3',
    './media/iwas.mp3',
    './media/juntos.mp3',
    './media/space.mp3',
    './media/stellar.mp3',
    './media/theb.mp3',
    './media/alanspectre.mp3'
  ]
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
      audio: { url: audios[Math.floor(Math.random() * audios.length)] },
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

import fetch from 'node-fetch'
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
  let vn11 = './media/alanspectre.mp3'
  let pp = await conn.profilePictureUrl(m.messageStubParameters[0], 'image').catch(_ => icono )
  let im = await (await fetch(`${pp}`)).buffer()
  await conn.sendMessage(m.chat, { audio: { url: [vn, vn2, vn4, vn5, vn7].getRandom() }, 
    contextInfo: { forwardedNewsletterMessageInfo: { 
    newsletterJid: channelRD.id, 
    serverMessageId: '', 
    newsletterName: channelRD.name }, forwardingScore: false, isForwarded: true, mentionedJid: [], "externalAdReply": { 
    "title": `❤️WELCOME `, 
    "body": 'IzuBot te da la bienvenida', 
    "previewType": "PHOTO", 
    "thumbnailUrl": redes,
    thumbnail: im, 
    "sourceUrl": redes, 
    "showAdAttribution": true}}, 
     seconds: 4556, ptt: true, mimetype: 'audio/mpeg', fileName: `error.mp3` }, { quoted: null, ephemeralExpiration: 24*60*100, disappearingMessagesInChat: 24*60*100})};
}

handler.customPrefix = /🇭🇳/
handler.command = new RegExp
export default handler

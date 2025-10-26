import fetch from 'node-fetch'
function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}
async function getRandomChannel() {
  const canalIdM = ["120363285614743024@newsletter", "120363395205399025@newsletter"]
  const canalNombreM = ["🤖⃧►iʑυвöτ◃2.0▹", "Zeus Bot🔆Channel-OFC"]

  const idx = Math.floor(Math.random() * canalIdM.length)
  return {
    id: canalIdM[idx],
    name: canalNombreM[idx]
  }
}

export async function before(m, { conn }) {
  try {
    global.emoji = '🪴'
    global.emoji2 = '🍁'
    global.emoji3 = '🍎'
    global.emoji4 = '⚡'
    global.emoji5 = '🌱'
    global.emojis = getRandom([global.emoji, global.emoji2, global.emoji3, global.emoji4, global.emoji5])

    global.e1 = '🪴'
    global.e2 = '🍁'
    global.e3 = '🍎'
    global.e4 = '⚡'
    global.e5 = '🌱'
    global.e = getRandom([global.e1, global.e2, global.e3, global.e4, global.e5])

    global.s1 = '➪'
    global.s2 = '➺'
    global.s3 = '➣'
    global.s4 = '⬭'
    global.s5 = '⬖'
    global.s = getRandom([global.s1, global.s2, global.s3, global.s4, global.s5])

    let c = 'https://whatsapp.com/channel/0029VaXHNMZL7UVTeseuqw3H'
    let g = 'https://wa.me/50492280729?text=Hola+quiero+un+bot+para+mi+grupo,+cuáles+son+los+planes?+'
    let i = 'https://www.instagram.com/edar504__'
    let t = 'https://www.tiktok.com/@edar_xd'
    global.redes = getRandom([c, g, i, t])

    global.canalIdM = ["120363285614743024@newsletter", "120363395205399025@newsletter"]
    global.canalNombreM = ["🤖⃧►iʑυвöτ◃2.0▹", "Zeus Bot🔆Channel-OFC"]
    global.channelRD = await getRandomChannel() // ahora definida arriba

    global.fake = {
      contextInfo: {
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: global.channelRD.id,
          newsletterName: global.channelRD.name,
          serverMessageId: -1
        }
      },
      quoted: m
    }
    
    const iconosArray = [
      'https://raw.githubusercontent.com/CheirZ/Repo-img/main/zeus-jpeg/me.jpg',
      'https://raw.githubusercontent.com/CheirZ/Repo-img/main/zeus-jpeg/me2.jpg',
      'https://raw.githubusercontent.com/CheirZ/Repo-img/main/zeus-jpeg/me3.jpg',
      'https://raw.githubusercontent.com/CheirZ/Repo-img/main/zeus-jpeg/me4.jpg',
      'https://raw.githubusercontent.com/CheirZ/Repo-img/main/zeus-jpeg/me5.jpg',
      'https://raw.githubusercontent.com/CheirZ/Repo-img/main/zeus-jpeg/me6.jpg',
      'https://raw.githubusercontent.com/CheirZ/Repo-img/main/zeus-jpeg/me7.jpg',
      'https://raw.githubusercontent.com/CheirZ/Repo-img/main/zeus-jpeg/me8.jpg',
      'https://raw.githubusercontent.com/CheirZ/Repo-img/main/zeus-jpeg/me9.jpg',
      'https://raw.githubusercontent.com/CheirZ/Repo-img/main/zeus-jpeg/me10.jpg',
      'https://raw.githubusercontent.com/CheirZ/Repo-img/main/zeus-jpeg/me11.jpg',
      'https://raw.githubusercontent.com/CheirZ/Repo-img/main/zeus-jpeg/me12.jpg',
      'https://raw.githubusercontent.com/CheirZ/Repo-img/main/zeus-jpeg/me13.jpg',
      'https://raw.githubusercontent.com/CheirZ/Repo-img/main/zeus-jpeg/me14.jpg',
      'https://raw.githubusercontent.com/CheirZ/Repo-img/main/zeus-jpeg/me15.jpg',
      'https://raw.githubusercontent.com/CheirZ/Repo-img/main/zeus-jpeg/me16.jpg',
      'https://raw.githubusercontent.com/CheirZ/Repo-img/main/zeus-jpeg/me17.jpg',
      'https://raw.githubusercontent.com/CheirZ/Repo-img/main/zeus-jpeg/me18.jpg',
      'https://raw.githubusercontent.com/CheirZ/Repo-img/main/zeus-jpeg/me19.jpg',
      'https://raw.githubusercontent.com/CheirZ/Repo-img/main/zeus-jpeg/me20.jpg'
    ]
    global.icono = getRandom(iconosArray)
    const thumbnailBuffer = await (await fetch(global.icono)).buffer()

    const wm = global.wm || 'IzuBot'
    const textbot = global.textbot || 'Bienvenido'

    global.rcanal = {
      contextInfo: {
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: global.channelRD.id,
          serverMessageId: 100,
          newsletterName: global.channelRD.name
        },
        externalAdReply: {
          showAdAttribution: false,
          title: wm,
          body: textbot,
          mediaUrl: null,
          description: null,
          previewType: "PHOTO",
          thumbnailUrl: global.redes,
          sourceUrl: global.redes,
          thumbnail: thumbnailBuffer,
          mediaType: 1,
          renderLargerThumbnail: false
        }
      }
    }

 const res2 = await fetch(global.icono)
const thumb2 = Buffer.from(await res2.arrayBuffer())
const userJid = m.sender

global.fakeimg = {
  key: { 
    fromMe: false, 
    participant: userJid
  },
  message: {
    documentMessage: {
      title: global.botname || 'Powered System WA-Bot © 2025',
      fileName: textbot || 'Bienvenido',
      mimetype: 'application/pdf', // importante para que renderice la miniatura
      pageCount: 1,
      fileLength: 1000000, // número simbólico
      jpegThumbnail: thumb2, // buffer de la imagen
      caption: wm || 'IzuBot'
    }
  }
}
    
//🗿
  } catch (err) {
    console.error('before() error:', err)
    throw err
  }
}

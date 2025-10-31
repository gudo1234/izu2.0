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
global.rwait = '🕒'
global.done = '✅'
global.error = '✖️'
global.msm = '⚠︎'
    
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
    let n = 'https://wa.me/50492280729?text=Hola+quiero+un+bot+para+mi+grupo,+cuáles+son+los+planes?+'
    let i = 'https://www.instagram.com/edar504__'
    let t = 'https://www.tiktok.com/@edar_xd'
    let p = 'https://www.paypal.me/edar504'
    let g = 'https://chat.whatsapp.com/Cy42GegnKSmCVA6zxWlxKU?mode=wwt'
    global.redes = getRandom([c, n, i, t, p, g])

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
      'https://raw.githubusercontent.com/CheirZ/Repo-img/main/zeus-jpeg/me20.jpg',
      'https://raw.githubusercontent.com/CheirZ/Repo-img/main/zeus-jpeg/me21.jpg'
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
    
//🗿
  } catch (err) {
    console.error('before() error:', err)
    throw err
  }
}

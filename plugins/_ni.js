import fs from 'fs'

let handler = async (m, { conn }) => {
  let imgBot = 'https://raw.githubusercontent.com/CheirZ/Repo-img/main/zeus-jpeg/me6.jpg' // URL de imagen completa
  let txt = `
Hola! Soy #K1NG_◇ <3
Bienvenido/a al menú de #K1NG_◇

╭─❖ *CANAL* ❖─
https://whatsapp.com/channel/0029Vb6OdX884Om9sylf6j1e
╰─────────────
`

  await conn.sendMessage(m.chat, {
    image: { url: imgBot },
    caption: txt.trim(),
    contextInfo: {
      externalAdReply: {
        title: "hola",
        body: "Mi bot xd",
        thumbnailUrl: "https://whatsapp.com/channel/0029Vb6OdX884Om9sylf6j1e",
        sourceUrl: "https://whatsapp.com/channel/0029Vb6OdX884Om9sylf6j1e",
        mediaType: 1,
        showAdAttribution: true,
        renderLargerThumbnail: true
      }
    }
  }, { quoted: m })
}

handler.command = ['ni']

export default handler

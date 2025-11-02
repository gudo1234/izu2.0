import fs from 'fs'
import { join } from 'path'
import Jimp from 'jimp'
import fetch from 'node-fetch'

let handler = async (m, { conn, __dirname }) => {
  // Reacción al iniciar
  m.react('🕒')

  const user = m.sender
  const wm = '드림 가이 Xeon'
  const textbot = 'Bot oficial desarrollado por Xeon'
  const redes = 'https://whatsapp.com/channel/0029VbAdXB147XeAcgOsJQ2j'
  const icono = 'https://qu.ax/zAMtB.jpg'
  const groupName = m.isGroup ? (await conn.groupMetadata(m.chat)).subject : 'Chat Privado'

  try {
    const imgPath = join(__dirname, icono)
    const thumbLocal = fs.existsSync(imgPath) ? fs.readFileSync(imgPath) : null
    const thumbResized = thumbLocal
      ? await (await Jimp.read(thumbLocal)).resize(300, 150).getBufferAsync(Jimp.MIME_JPEG)
      : await (await fetch(icono)).then(res => res.buffer())

    const menuText = `Hola @${user.split('@')[0]}, selecciona una opción del menú.`

    const contextInfo = {
      mentionedJid: [user],
      externalAdReply: {
        title: wm,
        body: textbot,
        sourceUrl: redes,
        thumbnail: thumbResized,
        mediaType: 1,
        renderLargerThumbnail: false
      }
    }

    const buttons = [
      { buttonId: '.info', buttonText: { displayText: 'Información del Bot' }, type: 1 },
      { buttonId: '.reglas', buttonText: { displayText: 'Reglas/Términos' }, type: 1 },
      { buttonId: '.vcar', buttonText: { displayText: 'vcard/yo' }, type: 1 }
    ]

    await conn.sendMessage(
      m.chat,
      {
        document: {
          url: 'https://mmg.whatsapp.net/v/t62.7119-24/539012045_745537058346694_1512031191239726227_n.enc',
          mimetype: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          fileName: '2take1-Interactive',
          jpegThumbnail: thumbResized
        },
        caption: menuText,
        footer: '¡By Take-Two Interactive!',
        buttons,
        headerType: 1,
        contextInfo
      },
      { quoted: m }
    )

    // Reacción al finalizar
    m.react('✅')

  } catch (e) {
    console.error('Error al generar mensaje interactivo:', e)
    await conn.reply(m.chat, `❌ Error al generar mensaje:\n${e.message}`, m)
  }
}

handler.command = ['si']
export default handler

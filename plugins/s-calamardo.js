import { sticker } from '../lib/sticker.js'
import { createCanvas, loadImage } from 'canvas'

async function generarStickerConTexto(texto) {
  const width = 512, height = 512
  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext('2d')
  const imagenes = [
    'https://files.catbox.moe/1gjno8.jpg',
    'https://files.catbox.moe/f3t7xs.jpg'
  ]
  const urlAleatoria = imagenes[Math.floor(Math.random() * imagenes.length)]
  const baseImage = await loadImage(urlAleatoria)
  ctx.drawImage(baseImage, 0, 0, width, height)

  ctx.font = '40px Sans'
  ctx.fillStyle = '#000'
  ctx.textAlign = 'center'

  const x = 260, y = 360, maxWidth = 300
  const words = texto.split(' ')
  const lines = []
  let currentLine = ''

  for (let word of words) {
    const testLine = currentLine + word + ' '
    if (ctx.measureText(testLine).width < maxWidth) {
      currentLine = testLine
    } else {
      lines.push(currentLine.trim())
      currentLine = word + ' '
    }
  }
  if (currentLine) lines.push(currentLine.trim())

  const startY = y - ((lines.length - 1) * 35) / 2
  lines.forEach((line, i) => ctx.fillText(line, x, startY + i * 35))

  return canvas.toBuffer()
}

let handler = async (m, { conn, args }) => {
  if (!args[0]) return m.reply(`${e} *Genera un sticker junto con el texto asignado*\n\`Ejemplo:\` .s2 hola`)

  let stiker = null
  try {
    let user = globalThis.db.data.users[m.sender]
    let name = conn.getName(m.sender)
    let botId = conn.user.jid
    let botSettings = globalThis.db.data.settings[botId]
    let botname = botSettings.namebot

  let text1 = user.metadatos ? user.metadatos : ``
  let text2 = user.metadatos2 ? user.metadatos2 : `Socket:\n↳@${botname}\n👹Usuario:\n↳@${name}`

    let userText = args.join(' ')
    if (userText.length > 30) return m.reply(`${e} El texto no puede tener más de 30 caracteres`)

    let imgBuffer = await generarStickerConTexto(userText)
    stiker = await sticker(imgBuffer, false, `${m.pushName}`)

  } catch (e) {
    console.error('Error generando sticker:', e)
    return m.reply('Ocurrió un error al generar el sticker.')
  }

  if (stiker) return conn.sendFile(m.chat, stiker, 'sticker.webp', '', m)
}

handler.command = ['s3', 'sticker3', 'stiker3', 'calamardo', 'cala', 'patricio', 'patri']
handler.group = true;

export default handler

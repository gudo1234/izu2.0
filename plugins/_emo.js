import { createCanvas } from 'canvas'
import { sticker } from '../lib/sticker.js'

const handler = async (m, { conn, text }) => {
  if (!text) {
    return conn.reply(m.chat, '❗ Emoji faltante.\nEjemplo: .emo 😆', m)
  }

  try {
    const emoji = text.trim()[0]

    const canvas = createCanvas(512, 512)
    const ctx = canvas.getContext('2d')

    // Fondo blanco opcional
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, 512, 512)

    // Emoji centrado
    ctx.font = '220px "Noto Color Emoji", "Segoe UI Emoji", "Apple Color Emoji"'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(emoji, 256, 300)

    // Flecha diagonal verde
    ctx.strokeStyle = '#00ff00'
    ctx.lineWidth = 12
    ctx.beginPath()
    ctx.moveTo(100, 100)
    ctx.lineTo(230, 230)
    ctx.stroke()

    // Círculo verde
    ctx.beginPath()
    ctx.arc(256, 300, 100, 0, Math.PI * 2)
    ctx.lineWidth = 10
    ctx.stroke()

    const buffer = canvas.toBuffer()

    const stickerBuffer = await sticker(buffer, false, global.packname || 'EmojiBot', global.author || 'Bot')

    await conn.sendFile(m.chat, stickerBuffer, 'emoji.webp', '', m)
  } catch (e) {
    console.error(e)
    conn.reply(m.chat, `⚠️ Error al generar sticker:\n\n${e.message}`, m)
  }
}

handler.command = ['emo']
handler.group = true;
export default handler

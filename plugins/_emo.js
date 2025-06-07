import { createCanvas, registerFont } from 'canvas'
import { sticker } from '../lib/sticker.js'

// (Opcional) Carga una fuente emoji si la tienes en tu carpeta local
// registerFont('./fonts/NotoColorEmoji.ttf', { family: 'Emoji' })

const handler = async (m, { conn, text }) => {
  if (!text) {
    return conn.reply(m.chat, '❗ Emoji faltante.\nEjemplo: .emo 😆', m)
  }

  try {
    const emoji = text.trim()[0]

    const canvas = createCanvas(512, 512)
    const ctx = canvas.getContext('2d')

    // Fondo transparente (por defecto)
    ctx.clearRect(0, 0, 512, 512)

    // Dibujar emoji centrado
    ctx.font = '280px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(emoji, 256, 256)

    // Si quieres agregar el círculo, lo dejamos (transparente)
    ctx.strokeStyle = '#00ff00'
    ctx.lineWidth = 10
    ctx.beginPath()
    ctx.arc(256, 256, 100, 0, Math.PI * 2)
    ctx.stroke()

    const buffer = canvas.toBuffer('image/png') // fondo transparente
    const stickerBuffer = await sticker(buffer, false, global.packname || '', global.author || '')

    await conn.sendFile(m.chat, stickerBuffer, 'emoji.webp', '', m)
  } catch (e) {
    console.error(e)
    conn.reply(m.chat, `⚠️ Error al generar sticker:\n\n${e.message}`, m)
  }
}

handler.command = ['emo']
handler.help = ['emo 😆']
handler.tags = ['sticker']
export default handler

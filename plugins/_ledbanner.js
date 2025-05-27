import { createCanvas } from 'canvas'
import fs from 'fs'
import path from 'path'

let handler = async (m, { text, conn }) => {
  if (!text) return m.reply('⚠️ Ingresa un texto para mostrar en el banner.\n\n*Ejemplo:* `.ledbanner Hola mundo`')

  const width = 512
  const height = 160
  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext('2d')
  const frames = []
  const frameCount = 6

  for (let i = 0; i < frameCount; i++) {
    ctx.fillStyle = '#000000'
    ctx.fillRect(0, 0, width, height)

    const glowColor = i % 2 === 0 ? '#39ff14' : '#00ffff'

    ctx.font = 'bold 42px monospace'
    ctx.fillStyle = glowColor
    ctx.shadowColor = glowColor
    ctx.shadowBlur = 25
    ctx.textAlign = 'center'
    ctx.fillText(text, width / 2, height / 2 + 16)

    frames.push(canvas.toBuffer('image/png'))
    ctx.shadowBlur = 0
  }

  // Crear GIF animado a mano no es viable sin una lib externa,
  // entonces enviaremos las imágenes como sticker animado (en formato .webp) o como video.
  // Aquí usamos método alternativo: creamos un solo PNG estático parpadeante y lo mandamos como imagen temporal.

  const file = path.join('./tmp', `led-${Date.now()}.png`)
  fs.writeFileSync(file, frames[0]) // solo el primer frame

  await conn.sendMessage(m.chat, {
    image: fs.readFileSync(file),
    caption: `🎇 *LED Neon Banner*\n💬 ${text}`
  }, { quoted: m })

  fs.unlinkSync(file)
}

handler.command = ['ledbanner']
export default handler

import { createCanvas } from 'canvas'
import GIFEncoder from 'gifencoder'
import fs from 'fs'
import path from 'path'

let handler = async (m, { text, conn }) => {
  if (!text) return m.reply('⚠️ Ingresa un texto para mostrar en el banner.\n\n*Ejemplo:* `.ledbanner Hola mundo`')

  const width = 512
  const height = 160
  const encoder = new GIFEncoder(width, height)
  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext('2d')
  const tmpPath = path.join('./tmp', `ledbanner-${Date.now()}.gif`)
  const stream = encoder.createReadStream().pipe(fs.createWriteStream(tmpPath))

  encoder.start()
  encoder.setRepeat(0) // 0 para loop infinito
  encoder.setDelay(400) // tiempo entre frames en ms
  encoder.setQuality(10)

  const frames = 6
  for (let i = 0; i < frames; i++) {
    // Fondo negro
    ctx.fillStyle = '#000000'
    ctx.fillRect(0, 0, width, height)

    // Efecto neón
    const glowColor = i % 2 === 0 ? '#39ff14' : '#00ffcc'
    ctx.font = 'bold 42px monospace'
    ctx.fillStyle = glowColor
    ctx.shadowColor = glowColor
    ctx.shadowBlur = 20
    ctx.textAlign = 'center'
    ctx.fillText(text, width / 2, height / 2 + 16)

    encoder.addFrame(ctx)
    ctx.shadowBlur = 0 // reset shadow
  }

  encoder.finish()

  stream.on('finish', async () => {
    await conn.sendMessage(m.chat, {
      video: fs.readFileSync(tmpPath),
      caption: `🎇 *LED Neon Banner*\n💬 ${text}`,
      gifPlayback: true
    }, { quoted: m })

    fs.unlinkSync(tmpPath)
  })
}

handler.command = ['ledbanner']
handler.group = true;
export default handler

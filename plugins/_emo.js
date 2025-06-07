const { createCanvas } = require('canvas')
const { sticker } = require('../lib/sticker.js')

let handler = async (m, { args, usedPrefix, command }) => {
  if (!args[0]) throw ` Ingresa un emoji.\nEjemplo:\n${usedPrefix + command} 😆`

  const emoji = args[0]
  const canvas = createCanvas(512, 512)
  const ctx = canvas.getContext('2d')

  // Fondo blanco opcional (puedes comentarlo si prefieres fondo transparente)
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, 512, 512)

  // Emoji grande centrado
  ctx.font = '220px NotoColorEmoji, Segoe UI Emoji, Apple Color Emoji'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(emoji, 256, 300)

  // Flecha diagonal verde
  ctx.strokeStyle = '#00ff00'
  ctx.fillStyle = '#00ff00'
  ctx.lineWidth = 12

  ctx.beginPath()
  ctx.moveTo(100, 100)
  ctx.lineTo(230, 230)
  ctx.stroke()

  // Círculo verde alrededor del emoji
  ctx.beginPath()
  ctx.arc(256, 300, 100, 0, Math.PI * 2)
  ctx.lineWidth = 10
  ctx.stroke()

  // Convertir canvas a buffer
  const buffer = canvas.toBuffer()

  // Enviar como sticker usando tu sistema
  return await conn.sendFile(m.chat, await sticker(buffer, false, packname, author), 'emoji.webp', '', m)
}

handler.command = ['emo']
handler.group = true;

module.exports = handler

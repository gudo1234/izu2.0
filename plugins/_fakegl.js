import { createCanvas } from 'canvas';
import fs from 'fs';
import path from 'path';

let handler = async (m, { text, conn, command }) => {
  if (!text) return m.reply(`${e} *Formato incorrecto.*\nUsa:\n${command} <Nombre> <Mensaje>\n\nEjemplo:\n${command} Hola bebé`)

  const [title, ...messageParts] = text.split(' ');
  const message = messageParts.join(' ');

  const width = 512;
  const height = 512;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Fondo general
  ctx.fillStyle = '#f5f5f5';
  ctx.fillRect(0, 0, width, height);

  // Tarjeta blanca
  const cardX = 56;
  const cardY = 156;
  const cardWidth = 400;
  const cardHeight = 200;
  const radius = 24;

  ctx.beginPath();
  ctx.moveTo(cardX + radius, cardY);
  ctx.lineTo(cardX + cardWidth - radius, cardY);
  ctx.quadraticCurveTo(cardX + cardWidth, cardY, cardX + cardWidth, cardY + radius);
  ctx.lineTo(cardX + cardWidth, cardY + cardHeight - radius);
  ctx.quadraticCurveTo(cardX + cardWidth, cardY + cardHeight, cardX + cardWidth - radius, cardY + cardHeight);
  ctx.lineTo(cardX + radius, cardY + cardHeight);
  ctx.quadraticCurveTo(cardX, cardY + cardHeight, cardX, cardY + cardHeight - radius);
  ctx.lineTo(cardX, cardY + radius);
  ctx.quadraticCurveTo(cardX, cardY, cardX + radius, cardY);
  ctx.closePath();
  ctx.fillStyle = '#ffffff';
  ctx.fill();

  // Degradado superior
  const gradient = ctx.createLinearGradient(0, cardY, 0, cardY + 80);
  gradient.addColorStop(0, '#ff007a');
  gradient.addColorStop(1, '#ff8a00');
  ctx.fillStyle = gradient;
  ctx.fillRect(cardX, cardY, cardWidth, 80);

  // Texto principal
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 30px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(title, width / 2, cardY + 50);

  // Mensaje
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 24px sans-serif';
  ctx.fillText(message, width / 2, cardY + 140);

  const file = path.join('./tmp', `fakengl-${Date.now()}.png`);
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(file, buffer);

  try {
    await conn.sendMessage(m.chat, {
      image: fs.readFileSync(file),
      caption: `${e} \`FakenGl\`\n*> ${title}* = ${message}`
    }, { quoted: m });
  } finally {
    fs.unlinkSync(file);
  }
};

handler.command = ['fakengl'];
handler.group = true;
export default handler;

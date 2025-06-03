import { createCanvas, loadImage } from 'canvas';
import fs from 'fs';
import path from 'path';

let handler = async (m, { text, conn, command, usedPrefix }) => {
  const emojiMap = {
    5: '🎨'
  };

  if (!text) return m.reply(
    `🎨 *Formato incorrecto.*\n\n` +
    `> Usa el comando así:\n` +
    `👉🏻 ${usedPrefix + command} <Título> <Mensaje>\n\n` +
    `*Ejemplo:*\n` +
    `\`${usedPrefix + command}\` Buenos días Hoy será un gran día\n\n` +
    `*Estilo disponible:*\n` +
    `5 o snoopy – _Snoopy pintando un mural colorido_`
  );

  const style = 5;
  const emoji = emojiMap[style];

  const parts = text.trim().split(/\s+/);
  const title = parts[0];
  const message = parts.slice(1).join(' ');

  const width = 512;
  const height = 512;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  ctx.textAlign = 'center';

  // Fondo tipo mural claro
  ctx.fillStyle = '#f5e3c3';
  ctx.fillRect(0, 0, width, height);

  // Salpicaduras de pintura
  const splashColors = ['#ff5252', '#42a5f5', '#66bb6a', '#ffca28', '#ab47bc'];
  for (let i = 0; i < 14; i++) {
    ctx.beginPath();
    const x = Math.random() * width;
    const y = Math.random() * height;
    const r = 15 + Math.random() * 30;
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    ctx.fillStyle = splashColors[Math.floor(Math.random() * splashColors.length)];
    ctx.fill();
  }

  // Texto
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 34px sans-serif';
  ctx.fillText(title, width / 2, 180);

  ctx.font = '26px sans-serif';
  ctx.fillText(message, width / 2, 240);

  // Imagen de Snoopy pintor
  try {
    const imgPath = path.join('./media', 'snoopy-paint.png'); // asegúrate de tener esta imagen
    const snoopy = await loadImage(imgPath);
    ctx.drawImage(snoopy, width - 160, height - 220, 140, 140);
  } catch (e) {
    console.error('❌ No se pudo cargar la imagen de Snoopy:', e);
  }

  const file = path.join('./tmp', `snoopytext-${Date.now()}.png`);
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(file, buffer);

  try {
    await conn.sendMessage(m.chat, {
      image: fs.readFileSync(file),
      caption: `${emoji} Estilo Snoopy\n> *${title}* = ${message}`
    }, { quoted: m });

    await conn.sendMessage(m.chat, { react: { text: emoji, key: m.key } });
  } finally {
    fs.unlinkSync(file);
  }
};

handler.command = ['snoopy'];
handler.group = true;
export default handler;

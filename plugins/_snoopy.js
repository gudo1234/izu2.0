import { createCanvas, loadImage } from 'canvas';
import fs from 'fs';
import path from 'path';

let handler = async (m, { text, conn, command, usedPrefix }) => {
  if (!text) return m.reply(
    `🎨 *Formato incorrecto.*\n\n` +
    `> Usa el comando así:\n` +
    `👉🏻 ${usedPrefix + command} <Texto>\n\n` +
    `*Ejemplo:*\n` +
    `\`${usedPrefix + command}\` Buenos días\n\n` +
    `Este estilo usa la imagen de Snoopy pintando como fondo.`
  );

  const message = text.trim();
  const width = 768;
  const height = 768;

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Cargar imagen de Snoopy subida por el usuario
  const bgPath = path.join('./media', 'snoopy-wall.png'); // Asegúrate de guardar la imagen como snoopy-wall.png
  const bg = await loadImage(bgPath);
  ctx.drawImage(bg, 0, 0, width, height);

  // Añadir texto encima
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 60px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(message, width / 2, 120);

  const file = path.join('./tmp', `snoopy-${Date.now()}.png`);
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(file, buffer);

  try {
    await conn.sendMessage(m.chat, {
      image: fs.readFileSync(file),
      caption: `🎨 *Snoopy artista*\n> ${text}`
    }, { quoted: m });
  } finally {
    fs.unlinkSync(file);
  }
};

handler.command = ['snoopy'];
handler.group = true;
export default handler;

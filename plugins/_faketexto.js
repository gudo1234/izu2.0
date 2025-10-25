import { createCanvas, loadImage } from '@napi-rs/canvas'
import fs from 'fs';
import path from 'path';

let handler = async (m, { text, conn, command, usedPrefix }) => {
  const emojiMap = {
    1: '🔖',
    2: '⚡',
    3: '❤️',
    4: '🌌',
  };

  if (!text) return m.reply(
    `${e} *Formato incorrecto.*\n\n` +
    `> Usa el comando así:\n` +
    `👉🏻 ${usedPrefix + command} <estilo> <Título> <Mensaje>\n\n` +
    `*Ejemplo:*\n` +
    `\`${usedPrefix + command}\` 1 Hola ¿Todo bien?\n` +
    `\`${usedPrefix + command}\` moderno Buenas noches Dulces sueños\n\n` +
    `🎨 *Estilos disponibles:*\n` +
    `1 o blanco – _Estilo blanco simple_\n` +
    `2 o neon – _Estilo neón oscuro_\n` +
    `3 o romantico – _Estilo romántico pastel_\n` +
    `4 o moderno – _Estilo noche con estrellas_`
  );

  const styleMap = {
    '1': 1, 'blanco': 1,
    '2': 2, 'neon': 2,
    '3': 3, 'romantico': 3,
    '4': 4, 'moderno': 4,
  };

  const parts = text.trim().split(/\s+/);

  let style, title, message;

  // Verificamos si el primer texto es estilo válido
  if (styleMap[parts[0].toLowerCase()]) {
    style = styleMap[parts[0].toLowerCase()];
    if (parts.length < 2) return m.reply(`⚠️ Debes indicar un título después del estilo.`);
    title = parts[1];
    message = parts.slice(2).join(' ');
  } else {
    // No es estilo válido, entonces asumimos estilo 1, primer palabra título y resto mensaje
    style = 1;
    title = parts[0];
    message = parts.slice(1).join(' ');
  }

  const emoji = emojiMap[style];

  const width = 512;
  const height = 512;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  ctx.textAlign = 'center';

  function drawCard(ctx, x, y, w, h, radius, fill, stroke = null, neon = false) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + w - radius, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
    ctx.lineTo(x + w, y + h - radius);
    ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
    ctx.lineTo(x + radius, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
    if (stroke) {
      ctx.lineWidth = 6;
      ctx.strokeStyle = stroke;
      if (neon) {
        ctx.shadowColor = stroke;
        ctx.shadowBlur = 12;
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
  }

  const bgStyles = {
    1: () => { // Blanco con borde blanco más visible
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(0, 0, width, height);

      drawCard(ctx, 56, 156, 400, 200, 24, '#ffffff', '#ffffff');

      const grad = ctx.createLinearGradient(56, 156, 456, 156);
      grad.addColorStop(0, '#ff007f');
      grad.addColorStop(1, '#ff9900');
      ctx.fillStyle = grad;
      ctx.fillRect(56, 156, 400, 60);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 30px sans-serif';
      ctx.fillText(title, width / 2, 196);

      ctx.fillStyle = '#000000';
      ctx.font = '24px sans-serif';
      ctx.fillText(message, width / 2, 280);
    },

    2: () => { // Neón oscuro
      ctx.fillStyle = '#0f0f0f';
      ctx.fillRect(0, 0, width, height);
      drawCard(ctx, 50, 160, 412, 200, 30, '#1a1a1a', '#39ff14', true);
      ctx.fillStyle = '#39ff14';
      ctx.font = 'bold 32px monospace';
      ctx.fillText(title, width / 2, 210);
      ctx.fillStyle = '#ffffff';
      ctx.font = '24px monospace';
      ctx.fillText(message, width / 2, 290);
    },

    3: () => { // Romántico pastel
      ctx.fillStyle = '#ffe0f0';
      ctx.fillRect(0, 0, width, height);
      drawCard(ctx, 56, 156, 400, 200, 24, '#fff0f8');
      ctx.fillStyle = '#ff4d88';
      ctx.font = 'bold 28px serif';
      ctx.fillText(`${title} ❤️`, width / 2, 200);
      ctx.fillStyle = '#333333';
      ctx.font = '22px serif';
      ctx.fillText(message, width / 2, 280);
    },

    4: () => { // Noche con estrellas más iluminada
      ctx.fillStyle = '#1a1a4d';
      ctx.fillRect(0, 0, width, height);

      for (let i = 0; i < 120; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const radius = Math.random() * 2.5 + 0.5;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.shadowColor = 'white';
        ctx.shadowBlur = 5;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      drawCard(ctx, 56, 156, 400, 200, 20, 'rgba(255, 255, 255, 0.15)', 'rgba(255, 255, 255, 0.5)');

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 30px sans-serif';
      ctx.fillText(title, width / 2, 200);
      ctx.font = '24px sans-serif';
      ctx.fillText(message, width / 2, 280);
    }
  };

  bgStyles[style]();

  const file = path.join('./tmp', `faketexto-${Date.now()}.png`);
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(file, buffer);

  try {
    await conn.sendMessage(m.chat, {
      image: fs.readFileSync(file),
      caption: `${emoji} Estilo ${style}\n> *${title}* = ${message}`
    }, { quoted: m });

    await conn.sendMessage(m.chat, { react: { text: emoji, key: m.key } });
  } finally {
    fs.unlinkSync(file);
  }
};

handler.command = ['faketexto', 'fakengl'];
handler.group = true;
export default handler;

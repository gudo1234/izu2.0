import { createCanvas } from 'canvas';
import fs from 'fs';
import path from 'path';

let handler = async (m, { text, conn, command, usedPrefix }) => {
  if (!text) return m.reply(
`${e} *Formato incorrecto.*

Usa el comando así:
${usedPrefix + command} <estilo> <Título> <Mensaje>

Ejemplo:
${usedPrefix + command} 1 Hola ¿Todo bien?
${usedPrefix + command} moderno Buenas noches Dulces sueños

*Estilos disponibles:*
1 o blanco       – Estilo blanco simple
2 o neon         – Estilo neón oscuro
3 o romantico    – Estilo romántico pastel
4 o moderno    – Estilo moderno degradado`
  );

  const [styleInput, title, ...messageParts] = text.split(' ');
  const styleMap = {
    '1': 1, 'blanco': 1,
    '2': 2, 'neon': 2,
    '3': 3, 'romantico': 3,
    '4': 4, 'moderno': 4,
  };
  const style = styleMap[styleInput.toLowerCase()];
  if (!style) return m.reply(`❌ *Estilo no válido.* Usa 1, 2, 3, 4, 6 o sus nombres.`);

  const message = messageParts.join(' ');
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
      ctx.lineWidth = 4;
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
    1: () => { // Blanco simple
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
      drawCard(ctx, 56, 156, 400, 200, 24, '#f5f5f5');
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 30px sans-serif';
      ctx.fillText(title, width / 2, 200);
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
      ctx.fillText(title + ' ❤️', width / 2, 200);
      ctx.fillStyle = '#333333';
      ctx.font = '22px serif';
      ctx.fillText(message, width / 2, 280);
    },
    4: () => { // Estilo moderno
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, '#0f2027');
      gradient.addColorStop(0.5, '#203a43');
      gradient.addColorStop(1, '#2c5364');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 2;
      drawCard(ctx, 56, 156, 400, 200, 20, 'rgba(255,255,255,0.1)', 'rgba(255,255,255,0.3)');
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
      caption: `🎨 \`Estilo ${style}\`\n*> ${title}* = ${message}`
    }, { quoted: m });
  } finally {
    fs.unlinkSync(file);
  }
};

handler.command = ['faketexto'];
handler.group = true;
export default handler;

import { createCanvas } from 'canvas';
import fs from 'fs';
import path from 'path';

let handler = async (m, { text, conn, command, usedPrefix }) => {
  if (!text) return m.reply(
`✳️ *Formato incorrecto.*

Usa el comando así:
${usedPrefix + command} <estilo> <Título> <Mensaje>

Ejemplo general:
${usedPrefix + command} 1 Hola Bebé ¿Cómo estás?

*Estilos disponibles:*
1. Estilo rosa degradado – ej: *${usedPrefix + command} 1 Buen día ¡Disfrútalo!*
2. Estilo neón oscuro – ej: *${usedPrefix + command} 2 Gamer Ready Let's go!*
3. Estilo romántico pastel – ej: *${usedPrefix + command} 3 Te Amo Eres mi todo*
4. Estilo limpio blanco – ej: *${usedPrefix + command} 4 Aviso Estamos en reunión*
5. Estilo suave rosado – ej: *${usedPrefix + command} 5 Princesa ¿Cómo dormiste?*
6. Estilo noche con estrellas – ej: *${usedPrefix + command} 6 Buenas noches Dulces sueños*
7. Estilo oscuro con resaltado – ej: *${usedPrefix + command} 7 Advertencia Zona restringida*
8. Estilo emojis flotantes – ej: *${usedPrefix + command} 8 Fiesta Hoy celebramos!*
9. Estilo notificación verde – ej: *${usedPrefix + command} 9 Éxito Registro completado*
10. Estilo alerta oscura – ej: *${usedPrefix + command} 10 Error No se encontró el archivo*`
  );

  const [styleStr, title, ...messageParts] = text.split(' ');
  const style = parseInt(styleStr);
  if (isNaN(style) || style < 1 || style > 10) return m.reply(`❌ *Estilo no válido.* Usa un número del 1 al 10.`);

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
    1: () => { // Estilo rosa degradado
      ctx.fillStyle = '#fce4ec';
      ctx.fillRect(0, 0, width, height);
      const gradient = ctx.createLinearGradient(0, 100, 0, 220);
      gradient.addColorStop(0, '#ff007a');
      gradient.addColorStop(1, '#ff8a00');
      drawCard(ctx, 56, 156, 400, 200, 24, '#ffffff');
      ctx.fillStyle = gradient;
      ctx.fillRect(56, 156, 400, 80);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 30px sans-serif';
      ctx.fillText(title, width / 2, 196);
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText(message, width / 2, 296);
    },
    2: () => { // Estilo neón oscuro
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
    3: () => { // Estilo romántico pastel
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
    4: () => { // Estilo limpio blanco
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
      drawCard(ctx, 56, 156, 400, 200, 20, '#f5f5f5');
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 30px sans-serif';
      ctx.fillText(title, width / 2, 200);
      ctx.font = '24px sans-serif';
      ctx.fillText(message, width / 2, 280);
    },
    5: () => { // Estilo suave rosado
      ctx.fillStyle = '#fff0f5';
      ctx.fillRect(0, 0, width, height);
      drawCard(ctx, 56, 156, 400, 200, 20, '#ffe4f0');
      ctx.fillStyle = '#d63384';
      ctx.font = 'bold 28px sans-serif';
      ctx.fillText(title, width / 2, 200);
      ctx.fillStyle = '#444';
      ctx.font = '24px sans-serif';
      ctx.fillText(message, width / 2, 280);
    },
    6: () => { // Estilo noche con estrellas
      ctx.fillStyle = '#001f3f';
      ctx.fillRect(0, 0, width, height);
      for (let i = 0; i < 60; i++) {
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(Math.random() * width, Math.random() * height, 1.5, 0, 2 * Math.PI);
        ctx.fill();
      }
      drawCard(ctx, 56, 156, 400, 200, 20, '#001433');
      ctx.fillStyle = '#00d4ff';
      ctx.font = 'bold 30px sans-serif';
      ctx.fillText(title, width / 2, 200);
      ctx.fillStyle = '#ffffff';
      ctx.font = '24px sans-serif';
      ctx.fillText(message, width / 2, 280);
    },
    7: () => { // Estilo oscuro con resaltado
      ctx.fillStyle = '#222';
      ctx.fillRect(0, 0, width, height);
      drawCard(ctx, 56, 156, 400, 200, 24, '#333');
      ctx.fillStyle = '#ffcc00';
      ctx.font = 'bold 30px sans-serif';
      ctx.fillText(title, width / 2, 200);
      ctx.fillStyle = '#ffffff';
      ctx.font = '24px sans-serif';
      ctx.fillText(message, width / 2, 280);
    },
    8: () => { // Estilo emojis flotantes
      ctx.fillStyle = '#e0f7fa';
      ctx.fillRect(0, 0, width, height);
      const emojis = ['✨', '❤️', '😊', '🎉', '🌈'];
      for (let i = 0; i < 20; i++) {
        const emoji = emojis[Math.floor(Math.random() * emojis.length)];
        ctx.font = '28px serif';
        ctx.fillText(emoji, Math.random() * width, Math.random() * height);
      }
      drawCard(ctx, 56, 156, 400, 200, 20, '#ffffff');
      ctx.fillStyle = '#00796b';
      ctx.font = 'bold 30px sans-serif';
      ctx.fillText(title, width / 2, 200);
      ctx.fillStyle = '#000000';
      ctx.font = '24px sans-serif';
      ctx.fillText(message, width / 2, 280);
    },
    9: () => { // Estilo notificación verde
      ctx.fillStyle = '#e8f5e9';
      ctx.fillRect(0, 0, width, height);
      drawCard(ctx, 56, 156, 400, 200, 20, '#ffffff');
      ctx.fillStyle = '#4caf50';
      ctx.font = 'bold 30px sans-serif';
      ctx.fillText(title, width / 2, 200);
      ctx.fillStyle = '#2e7d32';
      ctx.font = '24px sans-serif';
      ctx.fillText(message, width / 2, 280);
    },
    10: () => { // Estilo alerta oscura
      ctx.fillStyle = '#212121';
      ctx.fillRect(0, 0, width, height);
      drawCard(ctx, 56, 156, 400, 200, 20, '#333333');
      ctx.fillStyle = '#ff5252';
      ctx.font = 'bold 30px sans-serif';
      ctx.fillText(title, width / 2, 200);
      ctx.fillStyle = '#ffffff';
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

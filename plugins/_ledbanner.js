import { createCanvas } from 'canvas';
import fs from 'fs';
import path from 'path';
import GIFEncoder from 'gifencoder';

let handler = async (m, { text, conn, command, usedPrefix }) => {
  const emojiMap = {
    1: '🔖',
    2: '⚡',
    3: '❤️',
    4: '🌌',
  };

  if (!text) return m.reply(
    `*Formato incorrecto.*\n\n` +
    `> Usa el comando así:\n` +
    `👉🏻 ${usedPrefix + command} <estilo> <Texto>\n\n` +
    `*Ejemplo:*\n` +
    `\`${usedPrefix + command}\` 2 Bienvenido al grupo\n\n` +
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
  let style = styleMap[parts[0].toLowerCase()] || 1;
  let message = styleMap[parts[0].toLowerCase()] ? parts.slice(1).join(' ') : text;

  const emoji = emojiMap[style];

  const width = 512;
  const height = 128;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  const encoder = new GIFEncoder(width, height);
  const tmpPath = `./tmp/ledbanner-${Date.now()}.gif`;
  const stream = encoder.createWriteStream();
  const writeStream = fs.createWriteStream(tmpPath);
  stream.pipe(writeStream);

  encoder.start();
  encoder.setRepeat(0);
  encoder.setDelay(40);
  encoder.setQuality(10);

  // Estilos de fondo
  function drawBackground() {
    switch (style) {
      case 2:
        ctx.fillStyle = '#0f0f0f';
        ctx.fillRect(0, 0, width, height);
        break;
      case 3:
        ctx.fillStyle = '#ffe0f0';
        ctx.fillRect(0, 0, width, height);
        break;
      case 4:
        ctx.fillStyle = '#1a1a4d';
        ctx.fillRect(0, 0, width, height);
        for (let i = 0; i < 50; i++) {
          const x = Math.random() * width;
          const y = Math.random() * height;
          const r = Math.random() * 2 + 1;
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fillStyle = 'white';
          ctx.fill();
        }
        break;
      default:
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
    }
  }

  ctx.font = 'bold 28px sans-serif';
  const textWidth = ctx.measureText(message).width;

  for (let x = width; x > -textWidth - 10; x -= 4) {
    drawBackground();
    if (style === 2) ctx.fillStyle = '#39ff14';
    else if (style === 3) ctx.fillStyle = '#ff4d88';
    else ctx.fillStyle = '#000000';

    ctx.fillText(message, x, height / 2 + 10);
    encoder.addFrame(ctx);
  }

  encoder.finish();

  writeStream.on('finish', async () => {
    await conn.sendMessage(m.chat, {
      video: fs.readFileSync(tmpPath),
      gifPlayback: true,
      caption: `${emoji} *Banner animado LED estilo ${style}*`
    }, { quoted: m });

    fs.unlinkSync(tmpPath);
  });
};

handler.command = ['ledbanner', 'banneranimado'];
export default handler;

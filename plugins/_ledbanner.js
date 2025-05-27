import fs from 'fs';
import path from 'path';
import { createCanvas, registerFont } from 'canvas';
import { spawn } from 'child_process';

// Si deseas usar una fuente personalizada, registra aquí:
// registerFont('./fonts/tu-fuente.ttf', { family: 'TuFuente' });

let handler = async (m, { conn, text, command, usedPrefix }) => {
  if (!text) return m.reply(`⚠️ *Uso correcto:* ${usedPrefix + command} <texto>`);

  const width = 512;
  const height = 128;
  const fontSize = 40;
  const frameCount = 30;
  const frameDir = './tmp_ledframes';
  const gifPath = './tmp_ledbanner.gif';
  const scrollSpeed = 8;

  // Preparar carpeta temporal
  if (!fs.existsSync(frameDir)) fs.mkdirSync(frameDir);

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  ctx.font = `bold ${fontSize}px monospace`;
  const textWidth = ctx.measureText(text).width;

  for (let i = 0; i < frameCount; i++) {
    // Fondo negro
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);

    // Texto estilo LED
    ctx.font = `bold ${fontSize}px monospace`;
    ctx.fillStyle = '#39ff14';
    ctx.shadowColor = '#39ff14';
    ctx.shadowBlur = 10;

    const x = width - (i * scrollSpeed) % (textWidth + width);
    const y = height / 2 + fontSize / 3;

    ctx.fillText(text, x, y);

    const buffer = canvas.toBuffer('image/png');
    const frameFile = path.join(frameDir, `frame${String(i).padStart(3, '0')}.png`);
    fs.writeFileSync(frameFile, buffer);
  }

  // Convertir a GIF con ffmpeg
  await new Promise((resolve, reject) => {
    const args = [
      '-y',
      '-framerate', '10',
      '-i', path.join(frameDir, 'frame%03d.png'),
      '-vf', 'scale=512:-1:flags=lanczos',
      '-loop', '0',
      '-pix_fmt', 'yuv420p',
      gifPath
    ];
    const ffmpeg = spawn('ffmpeg', args);
    ffmpeg.stderr.on('data', (data) => console.log('ffmpeg:', data.toString()));
    ffmpeg.on('close', (code) => code === 0 ? resolve() : reject(new Error('ffmpeg failed')));
  });

  // Enviar como video tipo gif
  await conn.sendMessage(m.chat, {
    video: fs.readFileSync(gifPath),
    gifPlayback: true,
    caption: `🟢 *LED Banner*\n${text}`,
    mentions: [m.sender]
  }, { quoted: m });

  // Limpiar
  fs.rmSync(frameDir, { recursive: true, force: true });
  fs.unlinkSync(gifPath);
};

handler.command = ['ledbanner'];
export default handler;

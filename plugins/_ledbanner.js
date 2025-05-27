import fs from 'fs';
import path from 'path';
import { createCanvas, registerFont } from 'canvas';
import { spawn } from 'child_process';

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

  if (!fs.existsSync(frameDir)) fs.mkdirSync(frameDir);

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  ctx.font = `bold ${fontSize}px monospace`;
  const textWidth = ctx.measureText(text).width;

  for (let i = 0; i < frameCount; i++) {
    // Fondo blanco
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);

    // Configurar fuente en negro sin sombra
    ctx.font = `bold ${fontSize}px monospace`;
    ctx.fillStyle = '#000000';
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;

    const x = width - (i * scrollSpeed) % (textWidth + width);
    const y = height / 2 + fontSize / 3;

    ctx.fillText(text, x, y);

    const buffer = canvas.toBuffer('image/png');
    const frameFile = path.join(frameDir, `frame${String(i).padStart(3, '0')}.png`);
    fs.writeFileSync(frameFile, buffer);
  }

  // Crear GIF con ffmpeg
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

  await conn.sendMessage(m.chat, {
    video: fs.readFileSync(gifPath),
    gifPlayback: true,
    caption: `⬜ *LED Banner*\n${text}`,
    mentions: [m.sender]
  }, { quoted: m });

  fs.rmSync(frameDir, { recursive: true, force: true });
  fs.unlinkSync(gifPath);
};

handler.command = ['ledbanner'];
export default handler;

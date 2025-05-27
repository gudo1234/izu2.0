import fs from 'fs';
import path from 'path';
import { createCanvas } from 'canvas';
import { spawn } from 'child_process';

let handler = async (m, { conn, text, command, usedPrefix }) => {
  if (!text) return m.reply(`⚠️ *Uso correcto:* ${usedPrefix + command} <texto>`);

  const width = 512;
  const height = 128;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  const fontSize = 48;
  const font = 'bold ' + fontSize + 'px monospace';
  const frameCount = 30;
  const frameDir = './tmp_led';
  const gifPath = './tmp_ledbanner.gif';

  // Crear carpeta temporal
  if (!fs.existsSync(frameDir)) fs.mkdirSync(frameDir);

  // Medir texto
  ctx.font = font;
  const textWidth = ctx.measureText(text).width;

  // Crear los frames
  for (let i = 0; i < frameCount; i++) {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);

    ctx.font = font;
    ctx.shadowColor = '#39ff14';
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#39ff14';

    const offset = (i * 10) % (width + textWidth);
    ctx.fillText(text, width - offset, height / 1.5);

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
      gifPath
    ];
    const ffmpeg = spawn('ffmpeg', args);

    ffmpeg.stderr.on('data', (data) => console.log('ffmpeg:', data.toString()));
    ffmpeg.on('close', (code) => code === 0 ? resolve() : reject(new Error('ffmpeg error')));
  });

  // Enviar el GIF
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
handler.group = true;
export default handler;

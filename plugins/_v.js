import { createCanvas } from 'canvas';

async function handler(m, { text, conn, usedPrefix, command }) {
  if (!text) {
    throw `Escribe una descripción\n\nEjemplo:\n${usedPrefix + command} familia anime en el bosque al atardecer`;
  }

  const width = 1024;
  const height = 1024;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Fondo estilo Ghibli
  ctx.fillStyle = '#fcecd5';
  ctx.fillRect(0, 0, width, height);

  // Título
  ctx.fillStyle = '#222';
  ctx.font = 'bold 48px serif';
  ctx.fillText('Estilo Ghibli', 50, 100);

  // Descripción del usuario
  ctx.font = '32px serif';
  const lines = wrapText(ctx, text, 900);
  lines.forEach((line, i) => {
    ctx.fillText(line, 50, 180 + i * 40);
  });

  // Firma
  ctx.font = 'italic 24px serif';
  ctx.fillStyle = '#666';
  ctx.fillText('Generado por tu bot', 50, height - 40);

  const buffer = canvas.toBuffer('image/jpeg');
  await conn.sendFile(m.chat, buffer, 'ghibli.jpg', 'Aquí tienes tu imagen estilo Ghibli.', m);
}

handler.command = ['ghibli'];
handler.group = true;
export default handler;

// Función auxiliar para cortar texto largo
function wrapText(ctx, text, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let line = '';

  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + ' ';
    const testWidth = ctx.measureText(testLine).width;
    if (testWidth > maxWidth && i > 0) {
      lines.push(line.trim());
      line = words[i] + ' ';
    } else {
      line = testLine;
    }
  }
  lines.push(line.trim());
  return lines;
      }

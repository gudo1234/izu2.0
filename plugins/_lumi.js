let handler = async (m, { text, conn, command }) => {
  if (!text) return m.reply(`Escribe lo que deseas que aparezca en la imagen.\nEjemplo:\n.fakengl un mono con gorra`);

  const { createCanvas } = await import('canvas');
  const fs = await import('fs');
  const path = await import('path');

  const width = 512;
  const height = 512;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Fondo simple
  ctx.fillStyle = '#f5f5f5';
  ctx.fillRect(0, 0, width, height);

  // Título del prompt
  ctx.fillStyle = '#333';
  ctx.font = 'bold 28px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Petición del usuario:', width / 2, 60);

  // Texto principal
  ctx.fillStyle = '#000';
  ctx.font = '24px sans-serif';
  ctx.fillText(`"${text}"`, width / 2, height / 2);

  const file = path.join('./tmp', `fakengl-${Date.now()}.png`);
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(file, buffer);

  try {
    await conn.sendMessage(m.chat, {
      image: fs.readFileSync(file),
      caption: `Imagen generada según tu petición:\n"${text}"`
    }, { quoted: m });
  } finally {
    fs.unlinkSync(file);
  }
};

handler.command = ['lumi'];
export default handler;

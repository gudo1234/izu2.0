$ import sharp from 'sharp';

let handler = async (m, { conn, usedPrefix, command }) => {
  let q = m.quoted ? m.quoted : m;
  if (!q) {
    return m.reply(`${e} _Responde a una imagen para mejorarla a hd_`);
  }
  let mime = (q.msg || q).mimetype || '';
  if (!mime.startsWith('image/')) {
    return m.reply(`${e} _Responde a una imagen para mejorala a hd_`);
  }
  try {
    let media = await q.download();
    const image = sharp(media);
    const metadata = await image.metadata();
    const newWidth = metadata.width * 2;
    const newHeight = metadata.height * 2;
    image.resize(newWidth, newHeight);
    image.sharpen(8.0, 0.8, 1.5)
    const buffer = await image.jpeg({ quality: 100 }).toBuffer();
    conn.sendFile(m.chat, buffer, 'image.jpg', 'Izumi Bot', m, null, rcanal);
    
  } catch (error) {
    await m.react('❌')
  }
};

handler.command = ['hd']
handler.group = true
export default handler;

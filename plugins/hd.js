import sharp from 'sharp';

let handler = async (m, { conn, usedPrefix, command }) => {
  let q = m.quoted ? m.quoted : m;
  if (!q) {
    return m.reply(`${e} Responde a una imagen para mejorar la calidad`);
  }
  let mime = (q.msg || q).mimetype || '';
  if (!mime.startsWith('image/')) {
    return m.reply(`${e} Responde a una imagen para mejorar la calidad`);
  }
  try {
    await m.react('🍓')
    let media = await q.download();
    console.log('Media downloaded successfully.');
    const image = sharp(media);
    const metadata = await image.metadata();
    const newWidth = metadata.width * 2;
    const newHeight = metadata.height * 2;
    image.resize(newWidth, newHeight);
    image.sharpen()
    const buffer = await image.jpeg({ quality: 100 }).toBuffer();


    conn.sendFile(m.chat, buffer, 'image.jpg', `${m.pushName}`, m, null, rcanal);
    await m.react('✅')
//');
  } catch (error) {
 
    await m.react('❌')
  }
};


handler.command = ['hd']
handler.group = true;
export default handler;

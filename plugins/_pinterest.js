import fetch from 'node-fetch';

const handler = async (m, { conn, text }) => {
  if (!text) return m.reply('🔍 Escribí lo que querés buscar.');

  const res = await fetch(`https://api.dorratz.com/v2/pinterest?q=${encodeURIComponent(text)}`);
  const json = await res.json();

  if (!Array.isArray(json?.data) || json.data.length === 0)
    return m.reply('❌ No se encontraron imágenes.');

  const urls = json.data.slice(0, 10).map(img => img.image_large_url);

  for (const url of urls) {
    await conn.sendFile(m.chat, url, 'img.jpg', '', m);
  }
};

handler.command = ['pinalbum'];

export default handler;

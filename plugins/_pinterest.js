import fetch from 'node-fetch';

const pinterest = async (m, { conn, text }) => {
  if (!text) return m.reply('❌ Proporciona una palabra clave para buscar imágenes.');

  const res = await fetch(`https://api.dorratz.com/v2/pinterest?q=${encodeURIComponent(text)}`);
  const data = await res.json();

  if (!Array.isArray(data) || data.length === 0) {
    return m.reply('❌ No se encontraron imágenes.');
  }

  const results = data.slice(0, 5); // Limita a 5 resultados (puedes ajustar)

  for (const item of results) {
    const url = item.image_large_url;
    if (url) {
      await conn.sendMessage(m.chat, { image: { url }, caption: `🔍 Resultado para: ${text}` }, { quoted: m });
    }
  }
};

handler.command = ['pinterest', 'pin'];
export default pinterest;

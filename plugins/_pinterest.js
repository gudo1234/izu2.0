import fetch from 'node-fetch';

const handler = async (m, { conn, text }) => {
  if (!text) return m.reply(`${e} Proporciona una palabra clave para buscar imágenes en pinterest..`);

  const res = await fetch(`https://api.dorratz.com/v2/pinterest?q=${encodeURIComponent(text)}`);
  const data = await res.json();

  if (!Array.isArray(data) || data.length === 0) {
    return m.reply(`${e} No se encontraron imágenes.`);
  }

  const results = data.slice(0, 5); // Limita a 5 resultados
  let first = true;

  for (const item of results) {
    const url = item.image_large_url;
    if (!url) continue;

    if (first) {
      const txt = `${e} Se muestran resultados para: *${text}*`;
      const img = url;
      await conn.sendFile(m.chat, img, "Thumbnail.jpg", txt, m, null, rcanal);
      first = false;
    } else {
      await conn.sendMessage(m.chat, { image: { url } }, { quoted: m });
    }
  }
};

handler.command = ['pinimg'];
handler.group = true;
export default handler;

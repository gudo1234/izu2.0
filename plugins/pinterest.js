import fetch from 'node-fetch';

const handler = async (m, { conn, text, command }) => {

  if (!text) return m.reply(`${e} *Ingresa un enlace de Pinterest o una palabra clave para buscar.*`);

  conn.sendMessage(m.chat, { react: { text: "🕒", key: m.key } });

  const pinterestUrlRegex = /^https?:\/\/(www\.)?(pinterest\.[a-z.]+\/pin\/|pin\.it\/)/i;

  if (pinterestUrlRegex.test(text)) {
    try {
      const res = await fetch(`https://api.agatz.xyz/api/pinterest?url=${encodeURIComponent(text)}`);
      const json = await res.json();

      if (!json?.data?.result) throw `${e} No se pudo obtener el contenido del enlace.`;

      await conn.sendFile(m.chat, json.data.result, `pinterest.mp4`, `*🔗 Url:* ${json.data.url}`, m, null, rcanal);
    } catch (err) {
      console.error(err);
      m.reply(`${e} Hubo un error al procesar el enlace.`);
    }
  } else {
    try {
      const res = await fetch(`https://api.dorratz.com/v2/pinterest?q=${encodeURIComponent(text)}`);
      const data = await res.json();

      if (!Array.isArray(data) || data.length === 0) {
        return m.reply(`${e} No se encontraron imágenes para: *${text}*`);
      }

      const results = data.slice(0, 8); // Solo 8 imágenes
      const images = results.map(i => i.image_large_url).filter(Boolean);

      if (images.length === 0) {
        return m.reply(`${e} No se pudieron cargar imágenes válidas.`);
      }

      // Esperar un momento para asegurar que todas estén listas
      await new Promise(resolve => setTimeout(resolve, 1200));

      // Enviar la primera imagen con texto y rcanal
      const txt = `${e} Resultados para: *${text}*`;
      await conn.sendFile(m.chat, images[0], "Thumbnail.jpg", txt, m, null, rcanal);

      // Pausa corta entre envíos
      await new Promise(resolve => setTimeout(resolve, 600));

      // Enviar las demás imágenes sin texto
      for (let i = 1; i < images.length; i++) {
        await conn.sendMessage(m.chat, { image: { url: images[i] } }, { quoted: m });
        await new Promise(resolve => setTimeout(resolve, 400)); // ligera pausa entre envíos
      }

    } catch (err) {
      console.error(err);
      m.reply(`${e} Ocurrió un error al buscar imágenes.`);
    }
  }

  conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
};

handler.command = ['pin', 'pinterest', 'pinvid', 'pinimg', 'pinterestvid', 'pindl', 'pinterestdl'];
handler.group = true;
export default handler;

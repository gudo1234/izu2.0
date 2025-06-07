/*import fetch from 'node-fetch';

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`${e} *Ingresa un enlace de Pinterest o una palabra clave para buscar.*`);

  conn.sendMessage(m.chat, { react: { text: "🕒", key: m.key } });
  if (/^https?:\/\/(www\.)?pinterest\.[a-z]+\/pin\//i.test(text)) {
    try {
      let res = await fetch(`https://api.agatz.xyz/api/pinterest?url=${text}`);
      let json = await res.json();

      if (!json?.data?.result) throw `${e} No se pudo obtener el contenido del enlace.`;

      await conn.sendFile(m.chat, json.data.result, `pinterest.mp4`, `*🔗 Url:* ${json.data.url}`, m, null, rcanal);
    } catch (err) {
      console.error(err);
      m.reply(`${e} Hubo un error al procesar el enlace.`);
    }
  } else {
    try {
      let res = await fetch(`https://api.dorratz.com/v2/pinterest?q=${encodeURIComponent(text)}`);
      let data = await res.json();

      if (!Array.isArray(data) || data.length === 0) {
        return m.reply(`${e} No se encontraron imágenes para: *${text}*`);
      }

      const results = data.slice(0, 15);
      let first = true;

      for (const item of results) {
        const url = item.image_large_url;
        if (!url) continue;

        if (first) {
          await conn.sendFile(m.chat, url, "thumb.jpg", `${e} Resultados para: *${text}*`, m, null, rcanal);
          first = false;
        } else {
          await conn.sendMessage(m.chat, { image: { url } }, { quoted: m });
        }
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
export default handler;*/

import fetch from 'node-fetch';

const resolveShortUrl = async (shortUrl) => {
  try {
    const res = await fetch(shortUrl, { method: 'HEAD', redirect: 'manual' });
    return res.headers.get('location') || shortUrl;
  } catch (err) {
    console.error('[resolveShortUrl]', err);
    return shortUrl;
  }
};

const handler = async (m, { conn, text, usedPrefix, command }) => {
  const e = '⚠️'; // Reacciona o símbolo de advertencia, puedes cambiarlo por el que uses
  const rcanal = false; // Cambia esto si usas reenvío a canales

  if (!text) return m.reply(`${e} *Ingresa un enlace de Pinterest o una palabra clave para buscar.*`);

  await conn.sendMessage(m.chat, { react: { text: "🕒", key: m.key } });

  // Detecta tanto enlaces directos como acortados
  if (/^https?:\/\/(www\.)?(pinterest\.[a-z]+\/pin\/|pin\.it\/)/i.test(text)) {
    try {
      let resolvedUrl = text;
      if (/^https?:\/\/pin\.it\//i.test(text)) {
        resolvedUrl = await resolveShortUrl(text);
      }

      const res = await fetch(`https://api.agatz.xyz/api/pinterest?url=${resolvedUrl}`);
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

      const results = data.slice(0, 15);
      let first = true;

      for (const item of results) {
        const url = item.image_large_url;
        if (!url) continue;

        if (first) {
          await conn.sendFile(m.chat, url, "thumb.jpg", `${e} Resultados para: *${text}*`, m, null, rcanal);
          first = false;
        } else {
          await conn.sendMessage(m.chat, { image: { url } }, { quoted: m });
        }
      }
    } catch (err) {
      console.error(err);
      m.reply(`${e} Ocurrió un error al buscar imágenes.`);
    }
  }

  await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
};

handler.command = ['pin', 'pinterest', 'pinvid', 'pinimg', 'pinterestvid', 'pindl', 'pinterestdl'];
handler.group = true;

export default handler;

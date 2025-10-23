/*import fetch from 'node-fetch';

const handler = async (m, { conn, text, usedPrefix, command }) => {

  if (!text) return m.reply(`${e} *Ingresa un enlace de Pinterest o una palabra clave para buscar.*`);

  conn.sendMessage(m.chat, { react: { text: "🕒", key: m.key } });

  // Detectar cualquier URL válida de Pinterest (pin.it o pinterest.com)
  const pinterestUrlRegex = /^https?:\/\/(www\.)?(pinterest\.[a-z.]+\/pin\/|pin\.it\/)/i;

  if (pinterestUrlRegex.test(text)) {
    try {
      // Enviar la URL directamente a la API (sin resolver)
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

import fetch from 'node-fetch'

const handler = async (m, { conn, text }) => {

  if (!text) return m.reply(`${e} *Ingresa un enlace de Pinterest o una palabra clave para buscar.*`)

  await conn.sendMessage(m.chat, { react: { text: "🕒", key: m.key } })

  const pinterestUrlRegex = /^https?:\/\/(www\.)?(pinterest\.[a-z.]+\/pin\/|pin\.it\/)/i

  if (pinterestUrlRegex.test(text)) {
    try {
      const res = await fetch(`https://api.agatz.xyz/api/pinterest?url=${encodeURIComponent(text)}`)
      const json = await res.json()
      if (!json?.data?.result) throw `${e} No se pudo obtener el contenido del enlace.`

      await conn.sendFile(m.chat, json.data.result, 'pinterest.mp4', `*🔗 Url:* ${json.data.url}`, m)
    } catch (err) {
      console.error(err)
      await m.reply(`${e} Hubo un error al procesar el enlace.`)
    }
  } else {
    try {
      const res = await fetch(`https://api.dorratz.com/v2/pinterest?q=${encodeURIComponent(text)}`)
      const data = await res.json()

      if (!Array.isArray(data) || data.length === 0)
        return m.reply(`${e} No se encontraron imágenes para: *${text}*`)

      const results = data.slice(0, 8).map(v => v.image_large_url).filter(Boolean)
      if (results.length === 0) return m.reply(`${e} No se pudieron obtener imágenes válidas.`)

      // Creamos el array de mensajes tipo "álbum"
      const messages = results.map((url, index) => ({
        image: { url },
        caption: index === 0 ? `✨ *Pinterest Search*\nResultados para: *${text}*` : null
      }))

      // Enviamos las 8 fotos juntas (álbum visual)
      await conn.sendMessage(m.chat, { messages }, { quoted: m })

    } catch (err) {
      console.error(err)
      await m.reply(`${e} Ocurrió un error al buscar imágenes.`)
    }
  }

  await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } })
}

handler.command = ['pin', 'pinterest', 'pinvid', 'pinimg', 'pinterestvid', 'pindl', 'pinterestdl']
handler.group = true
export default handler

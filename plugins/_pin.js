import fetch from 'node-fetch';

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return conn.reply(m.chat, `❀ Ingresa una palabra clave para buscar imágenes.\n\nEjemplo:\n${usedPrefix + command} gatos`, m);
  }

  m.react('🔍');

  try {
    const apiUrl = `https://api.dorratz.com/v2/pinterest?q=${encodeURIComponent(text)}`;
    const res = await fetch(apiUrl);
    if (!res.ok) throw new Error('Error al contactar con la API de Pinterest.');

    const json = await res.json();
    const resultados = json?.result;

    if (!json.status || !Array.isArray(resultados) || resultados.length === 0) {
      return conn.reply(m.chat, '❌ No se encontraron imágenes para ese término.', m);
    }

    // Mezclar y tomar hasta 10 resultados
    const imagenes = resultados.sort(() => 0.5 - Math.random()).slice(0, 10);

    for (let i = 0; i < imagenes.length; i++) {
      const url = imagenes[i];
      await conn.sendFile(m.chat, url, `imagen_${i + 1}.jpg`, `📌 *Resultado ${i + 1}*\n🔎 *Término:* ${text}`, m);
    }

    await m.react('✅');

  } catch (e) {
    console.error('[Pinterest ERROR]', e);
    conn.reply(m.chat, '❌ Ocurrió un error al buscar imágenes. Intenta nuevamente más tarde.', m);
  }
};

handler.command = ['pinterest', 'pin'];
handler.group = true;

export default handler;

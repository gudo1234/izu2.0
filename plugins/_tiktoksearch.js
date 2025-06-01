import Starlights from '@StarlightsTeam/Scraper';

let handler = async (m, { conn, usedPrefix, command, text }) => {
  if (!text) {
    return conn.reply(m.chat, '🚩 Ingresa un texto junto al comando.\n\n`Ejemplo:`\n' + `> *${usedPrefix + command}* Ai Hoshino Edit`, m);
  }

  await m.react('🕓');

  try {
    // Rechaza enlaces
    const isLink = /(https?:\/\/)?(www\.)?(vm|vt|tiktok)\.com/i.test(text);
    if (isLink) {
      return conn.reply(m.chat, '✗ Este comando es solo para búsquedas por texto, no enlaces.', m);
    }

    // Buscar en TikTok
    const data = await Starlights.tiktoksearch(text);
    const results = Array.isArray(data) ? data : data.result || [];

    if (!results.length) {
      await m.react('✖️');
      return conn.reply(m.chat, '✗ No se encontraron resultados.', m);
    }

    // Filtrar y elegir 20 aleatorios con URL de video
    const valid = results.filter(v => v.video && v.video.startsWith('http'));
    const selected = valid.sort(() => Math.random() - 0.5).slice(0, 20);

    if (!selected.length) {
      await m.react('✖️');
      return conn.reply(m.chat, '✗ No hay videos válidos para mostrar.', m);
    }

    // Enviar primer video con caption
    await conn.sendFile(m.chat, selected[0].video, 'tiktok.mp4', '*Se muestran 20 resultados*', m);

    // Enviar los siguientes sin caption
    for (let i = 1; i < selected.length; i++) {
      await conn.sendFile(m.chat, selected[i].video, `video${i + 1}.mp4`, '', m);
    }

    await m.react('✅');

  } catch (err) {
    console.error('[ERROR TIKTOKSEARCH]', err);
    await m.react('✖️');
    conn.reply(m.chat, '✗ Ocurrió un error al buscar videos en TikTok.', m);
  }
};

handler.command = ['edi'];
handler.group = true;

export default handler;

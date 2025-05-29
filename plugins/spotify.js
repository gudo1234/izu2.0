import axios from 'axios';
import yts from 'yt-search';
import { youtubedl, youtubedlv2 } from '@bochilteam/scraper';

const handler = async (m, { conn, text, args, usedPrefix, command }) => {
  if (!text) {
    return m.reply(`🎵 Usa el comando así:\n\n${usedPrefix + command} <nombre de canción>\n\nEjemplo:\n${usedPrefix + command} Hola`);
  }

  await m.react('🎧');

  try {
    const { data } = await axios.get(`https://velyn.biz.id/api/search/spotify?query=${encodeURIComponent(text)}`);
    if (!data.status || !data.data.length) return m.reply('❌ No se encontraron resultados.');

    const results = data.data.slice(0, 5); // máximo 5 resultados

    let listText = `🎶 *Resultados de Spotify:*\n\n`;
    const buttons = [];

    for (let i = 0; i < results.length; i++) {
      const track = results[i];
      const durMin = Math.floor(track.duration_ms / 60000);
      const durSec = Math.floor((track.duration_ms % 60000) / 1000);
      const duration = `${durMin}:${durSec.toString().padStart(2, '0')}`;

      listText += `*${i + 1}.* ${track.name} - ${track.artists}\n🕒 ${duration}\n🔗 ${track.link}\n\n`;

      buttons.push({
        buttonId: `${usedPrefix}spotifydl ${track.name} ${track.artists}`,
        buttonText: { displayText: `🎵 Descargar ${i + 1}` },
        type: 1
      });
    }

    await conn.sendMessage(m.chat, {
      text: listText.trim(),
      footer: 'Selecciona una canción para descargarla.',
      buttons,
      headerType: 1
    }, { quoted: m });

  } catch (err) {
    console.error(err);
    m.reply(`❌ Error al buscar en Spotify: ${err.message}`);
  }
};

handler.command = ['spotify'];
export default handler;

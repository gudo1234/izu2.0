import fetch from 'node-fetch';
import axios from 'axios';
import { youtubedl, youtubedlv2 } from '@bochilteam/scraper';
import yts from 'yt-search';

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return;

  const prompt = `Responde solo con texto plano. Sin emojis, sin comillas. ¿El siguiente mensaje está pidiendo una imagen, una música o ninguna de las dos? Solo responde "imagen", "música" o "ninguna". Mensaje: ${text}`;
  const respuesta = await conn.fetchLLMReply(prompt);

  if (respuesta === 'imagen') {
    m.reply('Entendido, buscando una imagen...');
    let res = await conn.fetch(`https://api.akuari.my.id/search/googleimage?query=${encodeURIComponent(text)}`);
    let json = await res.json();
    if (!json.result || !json.result.length) return m.reply('No se encontraron imágenes.');
    return await conn.sendFile(m.chat, json.result.getRandom(), 'imagen.jpg', '', m);
  }

  if (respuesta === 'música') {
    m.reply('Entendido, buscando música...');
    try {
      const ytres = await yts(text);
      const video = ytres.videos[0];
      if (!video) return m.reply('No se encontró música relacionada.');

      const { title, timestamp, url } = video;
      const yt = await youtubedl(url).catch(() => youtubedlv2(url));
      const audioInfo = yt.audio['128kbps'];
      if (!audioInfo) return m.reply('No se encontró audio disponible.');

      const { fileSizeH: sizeHumanReadable, fileSize } = audioInfo;
      const sizeMB = fileSize / (1024 * 1024);

      let durationMin = 0;
      if (timestamp) {
        const parts = timestamp.split(':').map(Number);
        if (parts.length === 3) durationMin = parts[0] * 60 + parts[1] + parts[2] / 60;
        else if (parts.length === 2) durationMin = parts[0] + parts[1] / 60;
        else durationMin = parts[0];
      }

      let sendAsDocument = sizeMB >= 100 || durationMin >= 15;
      let downloadUrl;

      try {
        const api1 = await axios.get(`https://api.siputzx.my.id/api/d/ytmp4?url=${url}`);
        if (api1.data?.data?.dl) downloadUrl = api1.data.data.dl;
        else throw new Error();
      } catch {
        try {
          const api2 = await axios.get(`https://api.vreden.my.id/api/ytmp3?url=${encodeURIComponent(url)}`);
          if (api2.data?.result?.download?.url) downloadUrl = api2.data.result.download.url;
        } catch {
          return m.reply('Error al obtener el enlace de descarga.');
        }
      }

      if (!downloadUrl) return m.reply('No se pudo procesar la descarga.');

      const sendPayload = {
        [sendAsDocument ? 'document' : 'audio']: { url: downloadUrl },
        mimetype: 'audio/mpeg',
        fileName: `${title}.mp3`
      };

      return await conn.sendMessage(m.chat, sendPayload, { quoted: m });

    } catch (err) {
      console.error('Error:', err);
      return m.reply('Ocurrió un error procesando la música.');
    }
  }
};

handler.command = ['meta']
handler.group = true;

export default handler;

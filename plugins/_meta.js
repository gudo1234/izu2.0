import fetch from 'node-fetch';
import yts from 'yt-search';
import axios from 'axios';
import { youtubedl, youtubedlv2, googleImage } from '@bochilteam/scraper';
import { openai } from '../lib/openai.js';

const handler = async (m, { conn, args, usedPrefix, command, text }) => {
  if (!text) return m.reply(`Ejemplo:\n${usedPrefix + command} muéstrame una imagen de un dragón\n${usedPrefix + command} envíame una canción de Bad Bunny`);

  await m.react('🧠');

  try {
    const prompt = `Responde solo con "imagen", "música" o "texto". No expliques nada más. El usuario dijo: "${text}"`;
    const response = await openai.createChatCompletion({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
    });
    const decision = response.data.choices[0]?.message?.content?.toLowerCase()?.trim();

    // === IMAGEN ===
    if (decision === 'imagen') {
      await m.react('🖼️');
      const imgResults = await googleImage(text);
      const img = imgResults.getRandom();
      await conn.sendMessage(m.chat, { image: { url: img }, caption: `Aquí está tu imagen relacionada con:\n*${text}*` }, { quoted: m });
      await m.reply('Imagen enviada correctamente.');
      return;
    }

    // === MÚSICA ===
    if (decision === 'música') {
      await m.react('🎵');
      const ytres = await yts(text);
      const video = ytres.videos[0];
      if (!video) return m.reply('No encontré resultados en YouTube.');

      const { title, url, timestamp } = video;

      let yt;
      try {
        yt = await youtubedl(url);
      } catch {
        yt = await youtubedlv2(url);
      }

      const audioInfo = yt.audio?.['128kbps'];
      if (!audioInfo?.download()) return m.reply('No se pudo obtener el audio.');

      const { fileSizeH: sizeH, fileSize } = audioInfo;
      const durationParts = timestamp.split(':').map(Number);
      const durationMin = durationParts.length === 3
        ? durationParts[0] * 60 + durationParts[1] + durationParts[2] / 60
        : durationParts.length === 2
        ? durationParts[0] + durationParts[1] / 60
        : Number(durationParts[0]) / 60;

      const asDocument = fileSize / 1024 / 1024 >= 100 || durationMin >= 15;

      let dlUrl;
      try {
        const api = await axios.get(`https://api.siputzx.my.id/api/d/ytmp4?url=${url}`);
        dlUrl = api.data?.data?.dl;
      } catch {
        try {
          const api2 = await axios.get(`https://api.vreden.my.id/api/ytmp3?url=${encodeURIComponent(url)}`);
          dlUrl = api2.data?.result?.download?.url;
        } catch {
          return m.reply('No se pudo obtener el enlace de descarga.');
        }
      }

      if (!dlUrl) return m.reply('Error al generar el enlace de descarga.');

      const payload = {
        [asDocument ? 'document' : 'audio']: { url: dlUrl },
        mimetype: 'audio/mpeg',
        fileName: `${title}.mp3`
      };

      await conn.sendMessage(m.chat, payload, { quoted: m });
      await m.reply('Música enviada correctamente.');
      return;
    }

    // === TEXTO (IA NORMAL) ===
    const aiResponse = await openai.createChatCompletion({
      model: 'gpt-4',
      messages: [{ role: 'user', content: text }],
    });

    const reply = aiResponse.data.choices[0]?.message?.content;
    if (!reply) throw 'Sin respuesta de la IA.';
    await conn.sendMessage(m.chat, { text: reply.trim() }, { quoted: m });

  } catch (err) {
    console.error(err);
    return m.reply(`Error al procesar tu petición:\n\n${err.message || err}`);
  }
};

handler.command = ['meta'];
handler.group = true;

export default handler;

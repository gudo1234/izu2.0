import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { pipeline } from 'stream';
import { fileURLToPath } from 'url';
import ytSearch from 'yt-search';

const streamPipeline = promisify(pipeline);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const handler = async (m, { conn, text }) => {
  if (!text) {
    return await conn.sendMessage(m.chat, {
      text: `✳️ Usa el comando correctamente:\n\n📌 Ejemplo: *music* La Factoría - Perdoname`
    }, { quoted: m });
  }

  await conn.sendMessage(m.chat, {
    react: { text: '⏳', key: m.key }
  });

  try {
    // Buscar en YouTube con yt-search
    const searchResult = await ytSearch(text);
    if (!searchResult.videos.length) throw new Error('No se encontraron resultados en YouTube');

    const video = searchResult.videos[0];
    const videoUrl = video.url;
    const title = video.title;
    const duration = video.timestamp;
    const author = video.author.name;

    // Obtener MP3 desde la API de Vreden
    const vredenAPI = `https://api.vreden.my.id/api/ytmp3?url=${videoUrl}`;
    const response = await axios.get(vredenAPI);
    if (!response.data?.result?.url) throw new Error('No se pudo obtener el audio del video');

    const audioUrl = response.data.result.url;
    const tmpDir = path.join(__dirname, '../tmp');
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);
    const filePath = path.join(tmpDir, `${Date.now()}.mp3`);

    const download = await axios.get(audioUrl, {
      responseType: 'stream',
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    await streamPipeline(download.data, fs.createWriteStream(filePath));

    const stats = fs.statSync(filePath);
    if (!stats || stats.size < 100000) {
      fs.unlinkSync(filePath);
      throw new Error('El audio descargado está vacío o incompleto');
    }

    // Enviar audio como documento
    const caption = `🎶 *${title}*\n🕒 Duración: ${duration}\n👤 Autor: ${author}`;
    await conn.sendMessage(m.chat, {
      document: fs.readFileSync(filePath),
      mimetype: 'audio/mpeg',
      fileName: `${title}.mp3`,
      caption: caption
    }, { quoted: m });

    fs.unlinkSync(filePath);

    await conn.sendMessage(m.chat, {
      react: { text: '✅', key: m.key }
    });

  } catch (err) {
    console.error(err);
    await conn.sendMessage(m.chat, {
      text: `❌ *Error:* ${err.message}`
    }, { quoted: m });
    await conn.sendMessage(m.chat, {
      react: { text: '❌', key: m.key }
    });
  }
};

handler.command = ['music'];
export default handler;

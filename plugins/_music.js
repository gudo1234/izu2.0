import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { pipeline } from 'stream';
import { fileURLToPath } from 'url';

const streamPipeline = promisify(pipeline);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const handler = async (m, { conn, text }) => {
  const rawID = conn.user?.id || "";
  const subbotID = rawID.split(":")[0] + "@s.whatsapp.net";

  const prefixPath = path.resolve("prefixes.json");
  let prefixes = {};
  if (fs.existsSync(prefixPath)) {
    prefixes = JSON.parse(fs.readFileSync(prefixPath, "utf-8"));
  }

  const usedPrefix = prefixes[subbotID] || ".";

  if (!text) {
    return await conn.sendMessage(m.chat, {
      text: `✳️ Usa el comando correctamente:\n\n📌 Ejemplo: *${usedPrefix}music* La Factoría - Perdoname`
    }, { quoted: m });
  }
  m.react('🕒')
  try {
    const searchUrl = `https://api.neoxr.eu/api/video?q=${encodeURIComponent(text)}&apikey=russellxz`;
    const searchRes = await axios.get(searchUrl);
    const videoInfo = searchRes.data;

    if (!videoInfo || !videoInfo.data?.url) throw new Error('No se pudo encontrar el video');

    const title = videoInfo.title || 'video';
    const thumbnail = videoInfo.thumbnail;
    const duration = videoInfo.fduration || '0:00';
    const views = videoInfo.views || 'N/A';
    const author = videoInfo.channel || 'Desconocido';
    const videoLink = `https://www.youtube.com/watch?v=${videoInfo.id}`;

    const captionPreview = `
╔════════════════╗
║ ✦ 𝗔𝘇𝘂𝗿𝗮 𝗨𝗹𝘁𝗿𝗮 & 𝘾𝙤𝙧𝙩𝙖𝙣𝙖 𝗦𝘂𝗯𝗯𝗼𝘁 ✦
╚════════════════╝

📀 *Info del video:*  
├ 🎼 *Título:* ${title}
├ ⏱️ *Duración:* ${duration}
├ 👁️ *Vistas:* ${views}
├ 👤 *Autor:* ${author}
└ 🔗 *Link:* ${videoLink}

📥 *Opciones:*  
┣ 🎵 _${usedPrefix}play1 ${text}_
┣ 🎥 _${usedPrefix}play6 ${text}_
┗ ⚠️ *¿No se reproduce?* Usa _${usedPrefix}ff_

⏳ Procesando video...
══════════════════════`;

    await conn.sendMessage(m.chat, {
      image: { url: thumbnail },
      caption: captionPreview
    }, { quoted: m });

    const qualities = ['720p', '480p', '360p'];
    let videoData = null;

    for (let quality of qualities) {
      try {
        const apiUrl = `https://api.neoxr.eu/api/youtube?url=${encodeURIComponent(videoLink)}&apikey=russellxz&type=video&quality=${quality}`;
        const response = await axios.get(apiUrl);
        if (response.data?.status && response.data?.data?.url) {
          videoData = {
            url: response.data.data.url,
            title: response.data.title || title,
            id: response.data.id || videoInfo.id
          };
          break;
        }
      } catch { continue; }
    }

    if (!videoData) throw new Error('No se pudo obtener el video');

    const tmpDir = path.join(__dirname, '../tmp');
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);
    const filePath = path.join(tmpDir, `${Date.now()}_video.mp4`);

    const resDownload = await axios.get(videoData.url, {
      responseType: 'stream',
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    await streamPipeline(resDownload.data, fs.createWriteStream(filePath));

    const stats = fs.statSync(filePath);
    if (!stats || stats.size < 100000) {
      fs.unlinkSync(filePath);
      throw new Error('El video descargado está vacío o incompleto');
    }

    const finalText = `🎬 Aquí tiene su video en documento.\n\n© Azura Ultra Subbot`;

    await conn.sendMessage(m.chat, {
      document: fs.readFileSync(filePath),
      mimetype: 'video/mp4',
      fileName: `${videoData.title}.mp4`,
      caption: finalText
    }, { quoted: m });

    fs.unlinkSync(filePath);
    m.react('✅')
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

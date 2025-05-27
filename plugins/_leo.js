/*import fetch from 'node-fetch';

const handler = async (m, { conn, text }) => {
  if (!text) {
    return conn.reply(m.chat, '❀ Ingresa una URL de TikTok', m);
  }
  const urlPattern = /(?:https?:\/\/)?(?:www\.)?(?:tiktok\.com\/@[\w.-]+\/video\/\d+|tiktok\.com\/t\/[\w.-]+|vm\.tiktok\.com\/[\w.-]+|vt\.tiktok\.com\/[\w.-]+)/i;

  if (!urlPattern.test(text)) {
    return conn.reply(m.chat, '✗ La URL proporcionada no es válida para TikTok', m);
  }

  m.react('🕒');

  try {
    const apiUrl = `https://api.dorratz.com/v2/tiktok-dl?url=${encodeURIComponent(text)}`;
    const res = await fetch(apiUrl);
    
    if (!res.ok) throw new Error('Fallo al obtener respuesta de la API.');

    const json = await res.json();

    if (!json.data || !json.data.media || !json.data.media.org) {
      throw new Error('La API no devolvió un video válido.');
    }

    const video = json.data;
    const txt = `*「✦」Título:* ${video.title || 'Sin título'}

> *✦ Autor:* » ${video.author?.nickname || 'Desconocido'}
> *ⴵ Duración:* » ${video.duration ? `${video.duration} segundos` : 'No especificado'}
> *🜸 Likes:* » ${video.like || 0}
> *✎ Comentarios:* » ${video.comment || 0}`;

    m.react('✅');
    await conn.sendFile(m.chat, video.media.org, 'tiktok.mp4', txt, m);
  } catch (e) {
    console.error(e);
    return conn.reply(m.chat, 'Ocurrió un error al intentar descargar el video. Intenta nuevamente más tarde.', m);
  }
};

handler.command = ['leo'];
export default handler;*/

/*import fetch from 'node-fetch';

const handler = async (m, { conn, text }) => {
  if (!text) {
    return conn.reply(m.chat, '❀ Ingresa una URL de TikTok', m);
  }

  const urlPattern = /(?:https?:\/\/)?(?:www\.)?(?:tiktok\.com\/@[\w.-]+\/video\/\d+|tiktok\.com\/t\/[\w.-]+|vm\.tiktok\.com\/[\w.-]+|vt\.tiktok\.com\/[\w.-]+)/i;
  if (!urlPattern.test(text)) {
    return conn.reply(m.chat, '✗ La URL proporcionada no es válida para TikTok', m);
  }

  m.react('🕒');

  try {
    const apiUrl = `https://api.dorratz.com/v2/tiktok-dl?url=${encodeURIComponent(text)}`;
    const res = await fetch(apiUrl);
    if (!res.ok) throw new Error('Fallo al obtener respuesta de la API.');

    const json = await res.json();
    const video = json.data;

    if (!video || !video.media) throw new Error('Contenido no válido o incompleto.');

    const txt = `*「✦」Título:* ${video.title || 'Sin título'}

> *✦ Autor:* » ${video.author?.nickname || 'Desconocido'}
> *ⴵ Duración:* » ${video.duration ? `${video.duration} segundos` : 'No especificado'}
> *🜸 Likes:* » ${video.like || 0}
> *✎ Comentarios:* » ${video.comment || 0}`;

    m.react('✅');

    const media = video.media;
    if (media.type === 'image') {
      const images = media.images || [];
      const audio = media.audio;

      if (images.length === 1) {
        // Solo una imagen: enviar con audio
        await conn.sendFile(m.chat, images[0], 'foto.jpg', '*Foto del TikTok*', m);
        if (audio) await conn.sendFile(m.chat, audio, 'audio.mp3', '*Audio original*', m);
      } else if (images.length > 1) {
        // Varias imágenes
        for (let i = 0; i < images.length; i++) {
          await conn.sendFile(m.chat, images[i], `foto_${i + 1}.jpg`, `*Foto ${i + 1} del TikTok*`, m);
        }
        if (audio) await conn.sendFile(m.chat, audio, 'audio.mp3', '*Audio original*', m);
      } else {
        conn.reply(m.chat, 'No se encontraron imágenes en este TikTok.', m);
      }
    } else if (media.org) {
      // Video normal
      await conn.sendFile(m.chat, media.org, 'tiktok.mp4', txt, m);
    } else {
      throw new Error('No se encontró un medio válido para enviar.');
    }

  } catch (e) {
    console.error(e);
    return conn.reply(m.chat, 'Ocurrió un error al intentar procesar el TikTok. Intenta nuevamente más tarde.', m);
  }
};

handler.command = ['leo'];
export default handler;*/

import fetch from 'node-fetch';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const handler = async (m, { conn, text }) => {
  if (!text) return conn.reply(m.chat, '❀ Ingresa una URL de TikTok', m);

  const urlPattern = /(?:https?:\/\/)?(?:www\.)?(?:tiktok\.com\/@[\w.-]+\/video\/\d+|tiktok\.com\/t\/[\w.-]+|vm\.tiktok\.com\/[\w.-]+|vt\.tiktok\.com\/[\w.-]+)/i;
  if (!urlPattern.test(text)) return conn.reply(m.chat, '✗ La URL proporcionada no es válida para TikTok', m);

  m.react('🕒');

  try {
    const apiUrl = `https://api.dorratz.com/v2/tiktok-dl?url=${encodeURIComponent(text)}`;
    const res = await fetch(apiUrl);
    if (!res.ok) throw new Error('Fallo al obtener respuesta de la API.');
    const json = await res.json();
    const video = json.data;

    if (!video || !video.media) throw new Error('Contenido no válido o incompleto.');

    const txt = `*「✦」Título:* ${video.title || 'Sin título'}\n\n` +
      `> *✦ Autor:* » ${video.author?.nickname || 'Desconocido'}\n` +
      `> *ⴵ Duración:* » ${video.duration ? `${video.duration} segundos` : 'No especificado'}\n` +
      `> *🜸 Likes:* » ${video.like || 0}\n` +
      `> *✎ Comentarios:* » ${video.comment || 0}`;

    m.react('✅');

    const media = video.media;
    if (media.type === 'image') {
      const images = media.images || [];
      const audio = media.audio;

      if (images.length === 1 && audio) {
        if (!fs.existsSync('./tmp')) fs.mkdirSync('./tmp');

        const imgPath = path.join('./tmp', `img_${Date.now()}.jpg`);
        const audioPath = path.join('./tmp', `audio_${Date.now()}.mp3`);
        const outputPath = path.join('./tmp', `output_${Date.now()}.mp4`);

        const imgRes = await fetch(images[0]);
        fs.writeFileSync(imgPath, Buffer.from(await imgRes.arrayBuffer()));

        const audioRes = await fetch(audio);
        fs.writeFileSync(audioPath, Buffer.from(await audioRes.arrayBuffer()));

        await new Promise((resolve, reject) => {
          const ffmpeg = spawn('ffmpeg', [
            '-loop', '1',
            '-i', imgPath,
            '-i', audioPath,
            '-c:v', 'libx264',
            '-tune', 'stillimage',
            '-c:a', 'aac',
            '-b:a', '192k',
            '-pix_fmt', 'yuv420p',
            '-shortest',
            outputPath
          ]);

          ffmpeg.on('close', (code) => {
            if (code === 0) resolve();
            else reject(new Error('FFmpeg falló al generar el video.'));
          });
        });

        await conn.sendFile(m.chat, outputPath, 'tiktok_img_audio.mp4', txt, m);

        fs.unlinkSync(imgPath);
        fs.unlinkSync(audioPath);
        fs.unlinkSync(outputPath);

      } else if (images.length > 1) {
        for (let i = 0; i < images.length; i++) {
          await conn.sendFile(m.chat, images[i], `foto_${i + 1}.jpg`, `*Foto ${i + 1} del TikTok*`, m);
        }
        if (audio) await conn.sendFile(m.chat, audio, 'audio.mp3', '*Audio original*', m);
      } else {
        conn.reply(m.chat, 'No se encontraron imágenes en este TikTok.', m);
      }
    } else if (media.org) {
      await conn.sendFile(m.chat, media.org, 'tiktok.mp4', txt, m);
    } else {
      throw new Error('No se encontró un medio válido para enviar.');
    }

  } catch (e) {
    console.error('[ERROR TikTok]:', e);
    return conn.reply(m.chat, `⚠️ Error: ${e.message || e}`, m);
  }
};

handler.command = ['leo'];
export default handler;

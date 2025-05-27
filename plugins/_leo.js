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
export default handler;

import fetch from 'node-fetch';

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

import fs from 'fs';
import axios from 'axios';
import { spawn } from 'child_process';

async function descargarArchivo(url, path) {
  const res = await axios.get(url, { responseType: 'stream' });
  return new Promise((resolve, reject) => {
    const stream = fs.createWriteStream(path);
    res.data.pipe(stream);
    stream.on('finish', () => resolve(path));
    stream.on('error', reject);
  });
}

async function combinarImagenYAudio(imagen, audio, salida) {
  return new Promise((resolve, reject) => {
    const ffmpeg = spawn('ffmpeg', [
      '-y',
      '-loop', '1',
      '-i', imagen,
      '-i', audio,
      '-shortest',
      '-vf', 'scale=720:1280,format=yuv420p',
      '-c:v', 'libx264',
      '-preset', 'veryfast',
      '-crf', '23',
      '-c:a', 'aac',
      '-b:a', '192k',
      '-movflags', '+faststart',
      salida
    ]);

    ffmpeg.on('close', code => {
      if (code === 0) resolve(salida);
      else reject(new Error('Error al crear el video'));
    });
  });
}

const handler = async (m, { conn, args, usedPrefix, command }) => {
  const url = args[0];
  if (!url || !url.includes('tiktok.com')) throw `Ejemplo: *${usedPrefix + command} https://vm.tiktok.com/ZMS6FA1qf/*`;

  try {
    const res = await fetch(`https://api.dorratz.com/v2/tiktok-dl?url=${encodeURIComponent(url)}`);
    const json = await res.json();

    const media = json?.data?.media || {};
    const videoUrl = media.video;
    const audioUrl = media.audio;
    const images = media.images;

    const tmp = './tmp';
    if (!fs.existsSync(tmp)) fs.mkdirSync(tmp);

    if (videoUrl) {
      const videoPath = `${tmp}/video.mp4`;
      await descargarArchivo(videoUrl, videoPath);
      await conn.sendFile(m.chat, videoPath, 'tiktok.mp4', `Video descargado desde TikTok`, m);
      fs.unlinkSync(videoPath);
    } else if (images?.length && audioUrl) {
      const imgPath = `${tmp}/img.jpg`;
      const audioPath = `${tmp}/audio.mp3`;
      const outPath = `${tmp}/output.mp4`;

      await descargarArchivo(images[0], imgPath);
      await descargarArchivo(audioUrl, audioPath);
      await combinarImagenYAudio(imgPath, audioPath, outPath);

      await conn.sendFile(m.chat, outPath, 'tiktok.mp4', `Video generado con imagen y audio`, m);

      [imgPath, audioPath, outPath].forEach(f => fs.existsSync(f) && fs.unlinkSync(f));
    } else {
      throw 'No se encontró ni video ni imagen/audio válidos.';
    }

  } catch (e) {
    console.error(e);
    throw 'Error al procesar el TikTok. Asegúrate de que el enlace sea válido y no esté caído.';
  }
};

handler.command = ['leo']
export default handler;

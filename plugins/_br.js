import fetch from 'node-fetch';
import { spawn } from 'child_process';
import { tmpdir } from 'os';
import { join } from 'path';
import { writeFile, unlink } from 'fs/promises';
import { randomUUID } from 'crypto';

const handler = async (m, { conn, args }) => {
  if (!args[0]) {
    return m.reply(`${e} Por favor, proporciona un texto para generar el video.\n_Ejemplo: .bratvid Hola mundo_`);
  }

  const text = args.join(' ');
  const apiUrl = `https://api.nekorinn.my.id/maker/bratvid?text=${encodeURIComponent(text)}`;

  try {
    m.react('🕒');

    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error(`Error al generar el video: ${response.statusText}`);
    const videoBuffer = await response.buffer();

    // Guardar archivo temporal .mp4
    const id = randomUUID();
    const mp4Path = join(tmpdir(), `${id}.mp4`);
    const webpPath = join(tmpdir(), `${id}.webp`);
    await writeFile(mp4Path, videoBuffer);

    // Convertir a sticker animado .webp usando ffmpeg
    await new Promise((resolve, reject) => {
      const ffmpeg = spawn('ffmpeg', [
        '-i', mp4Path,
        '-vf', 'scale=512:512:force_original_aspect_ratio=decrease,fps=15',
        '-loop', '0',
        '-ss', '0',
        '-t', '6',
        '-an',
        '-vsync', '0',
        '-f', 'webp',
        webpPath
      ]);

      ffmpeg.on('close', code => {
        if (code !== 0) return reject(new Error('❌ Error al convertir el video con ffmpeg'));
        resolve();
      });
    });

    // Enviar el sticker
    await conn.sendFile(m.chat, webpPath, 'bratvid.webp', null, m, {
      asSticker: true
    });

    // Limpiar archivos temporales
    await unlink(mp4Path);
    await unlink(webpPath);

  } catch (error) {
    console.error('Error al generar el sticker animado:', error);
    m.reply('🚩 Ocurrió un error al generar el sticker. Asegúrate de que ffmpeg esté instalado y vuelve a intentar.');
  }
};

handler.command = ['br'];
handler.group = true;
export default handler;

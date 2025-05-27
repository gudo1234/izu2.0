/*import Starlights from '@StarlightsTeam/Scraper';

function normalizeTikTokUrl(text) {
  const regex = /(https?:\/\/)?(www\.)?(vm\.|vt\.|www\.)?tiktok\.com\/[^\s]+/i;
  const match = text.match(regex);
  if (match) {
    let url = match[0];
    if (!/^https?:\/\//i.test(url)) {
      url = 'https://' + url;
    }
    return url;
  }
  return null;
}

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return conn.reply(m.chat, `${e} Usa el comando correctamente:\n\n📌 Ejemplo:\n*${usedPrefix + command}* La Vaca Lola\n*${usedPrefix + command}* https://vt.tiktok.com/ZShhtdsRh/`, m);
  }

  await m.react('🕒');

  try {
    let result, dl_url;
    let url = normalizeTikTokUrl(text);

    if (url) {
      result = await Starlights.tiktokdl(url);
    } else {
      result = await Starlights.tiktokvid(text); // búsqueda por palabras
    }

    dl_url = result.dl_url;

    let txt = `╭───── • ─────╮\n`;
    txt += `  𖤐 \`TIKTOK EXTRACTOR\` 𖤐\n`;
    txt += `╰───── • ─────╯\n\n`;

    txt += `✦ *Título* : ${result.title}\n`;
    txt += `✦ *Autor* : ${result.author}\n`;
    txt += `✦ *Duración* : ${result.duration} segundos\n`;
    txt += `✦ *Vistas* : ${result.views}\n`;
    txt += `✦ *Likes* : ${result.likes}\n`;
    txt += `✦ *Comentarios* : ${result.comment || result.comments_count}\n`;
    txt += `✦ *Compartidos* : ${result.share || result.share_count}\n`;
    txt += `✦ *Publicado* : ${result.published}\n`;
    txt += `✦ *Descargas* : ${result.downloads || result.download_count}\n\n`;

    txt += `╭───── • ─────╮\n`;
    txt += `> *${global.textbot || 'Bot'}*\n`;
    txt += `╰───── • ─────╯\n`;

    await m.react('✅');
    await conn.sendFile(m.chat, dl_url, 'tiktok.mp4', txt, m, null, rcanal);

  } catch (err) {
    console.error(err);
  }
};

handler.command = ['t', 'tiktokvid', 'tiktoksearch', 'tiktokdl', 'ttvid', 'tt', 'tiktok'];
handler.group = true;
export default handler;*/

import Starlights from '@StarlightsTeam/Scraper';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { tmpdir } from 'os';
import { randomUUID } from 'crypto';

function normalizeTikTokUrl(text) {
  const regex = /(https?:\/\/)?(www\.)?(vm\.|vt\.|www\.)?tiktok\.com\/[^\s]+/i;
  const match = text.match(regex);
  if (match) {
    let url = match[0];
    if (!/^https?:\/\//i.test(url)) {
      url = 'https://' + url;
    }
    return url;
  }
  return null;
}

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return conn.reply(m.chat, `✧ Usa el comando correctamente:\n\n📌 Ejemplo:\n*${usedPrefix + command}* La Vaca Lola\n*${usedPrefix + command}* https://vt.tiktok.com/ZShhtdsRh/`, m);
  }

  await m.react('🕒');

  try {
    let result;
    let url = normalizeTikTokUrl(text);

    if (url) {
      result = await Starlights.tiktokdl(url);
    } else {
      result = await Starlights.tiktokvid(text);
    }

    const {
      dl_url,
      images = [],
      music,
      title,
      author,
      duration,
      views,
      likes,
      comment,
      share,
      published,
      downloads
    } = result;

    let txt = `╭───── • ─────╮\n`;
    txt += `  𖤐 \`TIKTOK EXTRACTOR\` 𖤐\n`;
    txt += `╰───── • ─────╯\n\n`;
    txt += `✦ *Título* : ${title}\n`;
    txt += `✦ *Autor* : ${author}\n`;
    txt += `✦ *Duración* : ${duration} segundos\n`;
    txt += `✦ *Vistas* : ${views}\n`;
    txt += `✦ *Likes* : ${likes}\n`;
    txt += `✦ *Comentarios* : ${comment}\n`;
    txt += `✦ *Compartidos* : ${share}\n`;
    txt += `✦ *Publicado* : ${published}\n`;
    txt += `✦ *Descargas* : ${downloads}\n\n`;
    txt += `╭───── • ─────╮\n`;
    txt += `> *${global.textbot || 'Bot'}*\n`;
    txt += `╰───── • ─────╯\n`;

    // Si es publicación de imágenes
    if (images.length > 0 && music) {
      const tempDir = path.join(tmpdir(), randomUUID());
      fs.mkdirSync(tempDir);

      const imagePaths = [];
      for (let i = 0; i < images.length; i++) {
        const imgUrl = images[i];
        const imgPath = path.join(tempDir, `img${i}.jpg`);
        const res = await (await fetch(imgUrl)).arrayBuffer();
        fs.writeFileSync(imgPath, Buffer.from(res));
        imagePaths.push(imgPath);
      }

      const audioPath = path.join(tempDir, 'audio.mp3');
      const audioRes = await (await fetch(music)).arrayBuffer();
      fs.writeFileSync(audioPath, Buffer.from(audioRes));

      const outputPath = path.join(tempDir, 'output.mp4');

      const inputArgs = [];
      const filterInputs = [];
      for (let i = 0; i < imagePaths.length; i++) {
        inputArgs.push('-loop', '1', '-t', '3', '-i', imagePaths[i]);
        filterInputs.push(`[${i}:v]`);
      }

      const ffmpegArgs = [
        ...inputArgs,
        '-i', audioPath,
        '-filter_complex',
        `${filterInputs.join('')}concat=n=${imagePaths.length}:v=1:a=0,format=yuv420p[v]`,
        '-map', '[v]',
        '-map', `${imagePaths.length}:a`,
        '-shortest',
        outputPath
      ];

      await new Promise((resolve, reject) => {
        const ffmpeg = spawn('ffmpeg', ffmpegArgs);
        ffmpeg.on('close', code => code === 0 ? resolve() : reject(`FFmpeg exited with code ${code}`));
      });

      await m.react('✅');
      await conn.sendFile(m.chat, outputPath, 'tiktok.mp4', txt, m);

      fs.rmSync(tempDir, { recursive: true, force: true });
    } else {
      // Video normal
      await m.react('✅');
      await conn.sendFile(m.chat, dl_url, 'tiktok.mp4', txt, m);
    }

  } catch (err) {
    console.error(err);
    await m.reply('Ocurrió un error al procesar el contenido de TikTok.');
  }
};

handler.command = ['t', 'tiktokvid', 'tiktoksearch', 'tiktokdl', 'ttvid', 'tt', 'tiktok'];
handler.group = true;
export default handler;

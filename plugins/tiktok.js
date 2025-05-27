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
import fs from 'fs';
import path from 'path';
import { tmpdir } from 'os';
import { randomUUID } from 'crypto';
import { spawn } from 'child_process';
import fetch from 'node-fetch';

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

async function downloadFile(url, dest) {
  const res = await fetch(url);
  const buffer = await res.arrayBuffer();
  fs.writeFileSync(dest, Buffer.from(buffer));
}

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return conn.reply(m.chat, `✧ Usa el comando correctamente:\n\n📌 Ejemplo:\n*${usedPrefix + command}* La Vaca Lola\n*${usedPrefix + command}* https://vt.tiktok.com/ZShhtdsRh/`, m);
  }

  await m.react('🕒');

  try {
    let result;
    const url = normalizeTikTokUrl(text);

    if (url) {
      result = await Starlights.tiktokdl(url);
    } else {
      result = await Starlights.tiktokvid(text);
    }

    const {
      dl_url,
      music,
      images = [],
      title,
      author,
      duration,
      views,
      likes,
      comment,
      share,
      published,
      downloads,
      type = 'video' // asume 'video' si no viene definido
    } = result;

    const caption = `╭───── • ─────╮
  𖤐 \`TIKTOK EXTRACTOR\` 𖤐
╰───── • ─────╯

✦ *Título* : ${title}
✦ *Autor* : ${author}
✦ *Duración* : ${duration}s
✦ *Vistas* : ${views}
✦ *Likes* : ${likes}
✦ *Comentarios* : ${comment}
✦ *Compartidos* : ${share}
✦ *Publicado* : ${published}
✦ *Descargas* : ${downloads}

> *${global.textbot || 'Bot'}*`;

    if (type === 'image' && images.length && music) {
      // Crear video desde imágenes + audio
      const temp = path.join(tmpdir(), randomUUID());
      fs.mkdirSync(temp);
      const imgPaths = [];

      for (let i = 0; i < images.length; i++) {
        const imgPath = path.join(temp, `img${i}.jpg`);
        await downloadFile(images[i], imgPath);
        imgPaths.push(imgPath);
      }

      const audioPath = path.join(temp, 'audio.mp3');
      await downloadFile(music, audioPath);

      const listFile = path.join(temp, 'list.txt');
      const imageDuration = 3; // segundos por imagen
      fs.writeFileSync(listFile, imgPaths.map(f => `file '${f}'\nduration ${imageDuration}`).join('\n') + `\nfile '${imgPaths[imgPaths.length - 1]}'`);

      const videoPath = path.join(temp, 'output.mp4');

      await new Promise((resolve, reject) => {
        const ffmpeg = spawn('ffmpeg', [
          '-f', 'concat',
          '-safe', '0',
          '-i', listFile,
          '-i', audioPath,
          '-shortest',
          '-vf', "scale=720:1280,format=yuv420p",
          '-preset', 'ultrafast',
          videoPath
        ]);

        ffmpeg.stderr.on('data', data => console.error(data.toString()));
        ffmpeg.on('exit', code => code === 0 ? resolve() : reject(`FFmpeg exit code ${code}`));
      });

      await conn.sendFile(m.chat, videoPath, 'tiktok.mp4', caption, m);
      fs.rmSync(temp, { recursive: true, force: true });
    } else {
      // Enviar video directamente
      await conn.sendFile(m.chat, dl_url, 'tiktok.mp4', caption, m);
    }

    await m.react('✅');
  } catch (err) {
    console.error(err);
    await m.reply('Ocurrió un error procesando el TikTok. Puede que el enlace sea inválido o que TikTok haya cambiado su estructura.');
  }
};

handler.command = ['t', 'tiktokvid', 'tiktoksearch', 'tiktokdl', 'ttvid', 'tt', 'tiktok'];
handler.group = true;
export default handler;

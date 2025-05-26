import fetch from 'node-fetch';
import { createCanvas, registerFont } from 'canvas';

let handler = async (m, { text, conn, usedPrefix, command }) => {
  if (!text) throw `*Ejemplo:* ${usedPrefix + command} perro con gorro`;

  // Intenta generar imagen con API IA si está disponible
  try {
    let apiUrl = `https://luminai.my.id/api/canvas/txt2img?text=${encodeURIComponent(text)}`;
    let res = await fetch(apiUrl);
    if (!res.ok) throw 'Error en la API';
    let buffer = await res.buffer();

    return await conn.sendFile(m.chat, buffer, 'bot.png', `*Texto:* ${text}`, m);
  } catch (e) {
    console.log('[.bot] Error usando la API IA, usando canvas básico...');

    // Backup: Generar una imagen con el texto usando canvas
    const canvas = createCanvas(512, 512);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, 512, 512);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 32px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text.slice(0, 50), 256, 256); // máximo 50 caracteres visibles

    return await conn.sendFile(m.chat, canvas.toBuffer(), 'fallback.png', '*Imagen generada localmente*', m);
  }
};

handler.command = ['lumi'];
handler.group = true;
export default handler;

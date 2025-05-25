import { sticker } from '../lib/sticker.js';

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

let handler = async (m, { conn }) => {
  try {
    let stikerxd = [
      'https://telegra.ph/file/e8be85aeb9a625f533a4a.png',
      'https://telegra.ph/file/913f5861cefbdde379921.jpg',
      'https://telegra.ph/file/6b7b0dbf022ee46a44887.jpg'
    ];
    let stikerUrl = pickRandom(stikerxd); 
    let stiker = await sticker(null, stikerUrl, global.packname, global.author);
    if (stiker) {
      await conn.sendMessage(m.chat, { sticker: { url: stiker } }, { quoted: m });
    } else {
      throw new Error('Failed to create sticker'); 
    }
  } catch {
    // Manejo de error opcional
  }
};

handler.customPrefix = /xd/
handler.command = new RegExp;

export default handler;

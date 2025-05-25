/*import { sticker } from '../lib/sticker.js';

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}
let handler = async (m, { conn, text, usedPrefix, command }) => {
  try {
    let stikerxd = [
      'https://telegra.ph/file/e8be85aeb9a625f533a4a.png',
      'https://telegra.ph/file/913f5861cefbdde379921.jpg',
      'https://telegra.ph/file/6b7b0dbf022ee46a44887.jpg'
    ];
    let stikerUrl = pickRandom(stikerxd); 
    let stiker = await sticker(null, stikerUrl, global.packname, global.author);
    if (stiker) {
      await conn.sendFile(m.chat, stiker, 'sticker.webp', '', m);
    } else {
      throw new Error('Failed to create sticker'); 
    }
  } catch {
  }
};

handler.customPrefix = /xd/
handler.command = new RegExp;
export default handler;*/

import { sticker } from '../lib/sticker.js';

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  try {
    let stikerxd = [
      'https://telegra.ph/file/e8be85aeb9a625f533a4a.png',
      'https://telegra.ph/file/913f5861cefbdde379921.jpg',
      'https://telegra.ph/file/6b7b0dbf022ee46a44887.jpg',
      'https://telegra.ph/file/8dfd8e93d264537c1fa59.png',
      'https://telegra.ph/file/5e3e9f41578f604ff83f2.jpg',
      'https://telegra.ph/file/f3a83b7701db95d07b4e2.jpg',
      'https://telegra.ph/file/3a13d86194f9ae9ebdb9c.png',
      'https://telegra.ph/file/2f0b986d63e914e5d56a3.jpg',
      'https://telegra.ph/file/c3e6b20ef297560816bc5.jpg',
      'https://telegra.ph/file/fed123d45b9ae73e64c52.png'
    ];
    let stikerUrl = pickRandom(stikerxd); 
    let stiker = await sticker(null, stikerUrl, global.packname, global.author);
    if (stiker) {
      await conn.sendFile(m.chat, stiker, 'sticker.webp', '', m);
    } else {
      throw new Error('Failed to create sticker'); 
    }
  } catch {
    // Silencio de errores
  }
};

handler.customPrefix = /xd/;
handler.command = new RegExp;
export default handler;

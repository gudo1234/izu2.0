import { addExif } from '../lib/sticker.js';
import { sticker } from '../lib/sticker.js';
import fetch from 'node-fetch';
import axios from 'axios';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!m.quoted) return m.reply(`${e} Por favor, responde a un sticker con el comando *${usedPrefix + command}* seguido del nuevo nombre.\nEjemplo: *${usedPrefix + command} Nuevo Nombre*`);
const thumbnail = await (await fetch(icono)).buffer()
  const sticker = await m.quoted.download();
  if (!sticker) return m.reply(`${emoji2} No se pudo descargar el sticker.`);

  const textoParts = text.split(/[\u2022|]/).map(part => part.trim());
  const userId = m.sender;
  let packstickers = global.db.data.users[userId] || {};
  let texto1 = textoParts[0] || packstickers.text1 || `${m.pushName}`;
  let texto2 = textoParts[1] || packstickers.text2;

  const exif = await addExif(sticker, texto1, texto2);

  await conn.sendFile(m.chat, exif, 'wm.webp', '',m, true, { contextInfo: { 'forwardingScore': 200, 'isForwarded': false, externalAdReply:{ showAdAttribution: false, title: `${m.pushName}`, body: textbot, mediaType: 1, sourceUrl: redes, thumbnailUrl: redes, thumbnail}}}, { quoted: m })
};

handler.command = ['take', 'robar', 'wm'];
handler.group = true;

export default handler;

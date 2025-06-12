/*import axios from 'axios';
import Starlights from '@StarlightsTeam/Scraper';

const handler = async (m, { conn, participants }) => {
  const users = participants
    .map(u => u.id)
    .filter(id => id !== conn.user.jid);

 // await m.react('🕒');

  const url = 'https://youtu.be/w6MJFSLzME8';
  const caption = 'Como olvidar cuando Iván Boss salió en las noticias por kuaker';
  let title = 'ivan-boss', downloadUrl, fileName = 'ivan-boss.mp4', mimeType = 'video/mp4';

  try {
    // 1. Stellar API
    try {
      const stellar = await axios.get(`https://stellar.sylphy.xyz/dow/ytmp4?url=${encodeURIComponent(url)}`);
      if (stellar?.data?.result?.url) {
        downloadUrl = stellar.data.result.url;
        title = stellar.data.result.title || title;
      } else if (stellar?.data?.url) {
        downloadUrl = stellar.data.url;
      }
    } catch (e) {
      console.log('Fallo Stellar API:', e.message);
    }

    // 2. StarlightsTeam
    if (!downloadUrl) {
      try {
        const result = await Starlights.ytmp4(url);
        downloadUrl = result?.dl_url;
      } catch (e) {
        console.log('Fallo Starlights:', e.message);
      }
    }

    //if (!downloadUrl) return m.reply(`❌ No se pudo obtener el enlace de descarga.`);

    fileName = `${title}.mp4`;

    await conn.sendMessage(m.chat, {
      video: { url: downloadUrl },
      mimetype: mimeType,
      fileName,
      caption,
      mentions: users
    }, { quoted: meta });

   // await m.react('✅');
  } catch (err) {
    console.error('[ERROR 🪹]', err);
    //await m.reply(`❌ Error inesperado: ${err.message}`);
  }
};

// Activador por emoji 🪹
handler.customPrefix = /^(🪹)$/i;
handler.command = new RegExp;

handler.group = true;

export default handler;*/

/*const handler = async (m, { conn, participants }) => {
  const users = participants
    .map(u => u.id)
    .filter(id => id !== conn.user.jid);

  const caption = `SAKURA🩷EGO
KIKIO🩷KAMIKAZE
BLINK DI🩷CERO
LUCY🩷MOGO
SOLEDAD🩷HILDER
KEXUX🩷TENTACION
YUN🩷EDAR
LILY🩷MONGOMERY
KALY🩷ANDER
LIAPSITA🩷SALVA
VALERIA🩷TOKIO
ELDA🩷LULLAN
KARINA🩷GASTON
IRIS🩷MARK
MARIBEL🩷JAMON
DULCE🩷SAYRO
YARELLI🩷JEANXX
ALBA🩷AARON
DULCERA🩷NHMODS
YOMA🩷FRANK
CLARA🩷FANTASIA
LESLY🩷MARTIR
BREEM🩷BRUXIN
YAMILET🩷CRISS
PUCCA🩷SICARIO

*LAS MISMAS PAREJAN ESTARAN HASTA EL DIA 14/06*

SUERTE A TODOS
BY DULXXE♡♡`;

  try {
    await conn.sendMessage(m.chat, {
      text: caption,
      mentions: users
    }, { quoted: meta });
  } catch (err) {
    console.error('[ERROR 🪹]', err);
  }
};

// Activador por emoji 🪹
handler.customPrefix = /^(🪹)$/i;
handler.command = new RegExp;
handler.group = true;
export default handler;*/

import fs from 'fs';

const FILE_PATH = './textos.json';

function readTexts() {
  if (!fs.existsSync(FILE_PATH)) return { textos: [] };
  return JSON.parse(fs.readFileSync(FILE_PATH));
}

function writeTexts(data) {
  fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2));
}

const handler = async (m, { conn, participants, args, command, text }) => {
  const data = readTexts();
  const users = participants
    .map(u => u.id)
    .filter(id => id !== conn.user.jid);

  if (command === 'addtext') {
    if (!text) return m.reply('Debes escribir el texto que deseas agregar.');
    data.textos.push(text);
    writeTexts(data);
    return m.reply('✅ Texto agregado correctamente.');
  }

  if (command === 'deltext') {
    if (!text) return m.reply('Debes escribir el texto exacto que deseas eliminar.');
    const index = data.textos.indexOf(text);
    if (index === -1) return m.reply('❌ El texto no existe.');
    data.textos.splice(index, 1);
    writeTexts(data);
    return m.reply('🗑️ Texto eliminado correctamente.');
  }

  if (command === 'vertext') {
    if (data.textos.length === 0) return m.reply('📭 No hay textos guardados.');
    return m.reply('📜 Textos actuales:\n' + data.textos.map((t, i) => `${i + 1}. ${t}`).join('\n'));
  }

  // Activación por emoji 🪹
  if (m.text === '🪹') {
    const caption = data.textos.join('\n') || '📭 No hay textos para mostrar.';
    try {
      await conn.sendMessage(m.chat, {
        text: caption,
        mentions: users
      }, { quoted: m });
    } catch (err) {
      console.error('[ERROR 🪹]', err);
    }
  }
};

// Solo activación por emoji 🪹
handler.customPrefix = /^🪹$/i;
handler.command = ['addtext', 'deltext', 'vertext']
handler.owner = true;
handler.group = true;

export default handler;

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

// Asegura que el archivo exista y tenga estructura básica
function ensureFile() {
  if (!fs.existsSync(FILE_PATH)) {
    fs.writeFileSync(FILE_PATH, JSON.stringify({ textos: [] }, null, 2));
  }
}

function readTexts() {
  ensureFile();
  return JSON.parse(fs.readFileSync(FILE_PATH));
}

function writeTexts(data) {
  ensureFile();
  fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2));
}

const handler = async (m, { conn, participants }) => {
  try {
    const users = participants
      .map(u => u.id)
      .filter(id => id !== conn.user.jid);

    const body = m.text.trim();
    const data = readTexts();

    if (body.startsWith('.addtext')) {
      const contenido = body.slice(8).trim();
      if (!contenido) return m.reply('❗ Escribe el texto que deseas agregar.');
      data.textos.push(contenido);
      writeTexts(data);
      return m.reply('✅ Texto agregado correctamente.');
    }

    if (body.startsWith('.deltext')) {
      const contenido = body.slice(8).trim();
      if (!contenido) return m.reply('❗ Escribe el texto exacto que deseas eliminar.');
      const index = data.textos.indexOf(contenido);
      if (index === -1) return m.reply('⚠️ Ese texto no existe.');
      data.textos.splice(index, 1);
      writeTexts(data);
      return m.reply('🗑️ Texto eliminado correctamente.');
    }

    if (body.startsWith('.vertext')) {
      if (data.textos.length === 0) return m.reply('📭 No hay textos guardados.');
      return m.reply('📜 Textos actuales:\n' + data.textos.map((t, i) => `${i + 1}. ${t}`).join('\n'));
    }

    if (body === '🪹') {
      const caption = data.textos.join('\n') || '📭 No hay textos para mostrar.';
      await conn.sendMessage(m.chat, {
        text: caption,
        mentions: users
      }, { quoted: m });
    }
  } catch (err) {
    console.error('[ERROR HANDLER 🪹]', err);
    m.reply('❌ Ocurrió un error al procesar tu solicitud.');
  }
};

// Activador por 🪹 o comandos .addtext, .deltext, .vertext
handler.customPrefix = /^(🪹|\.addtext|\.deltext|\.vertext)$/i;
handler.command = new RegExp;
handler.group = true;

export default handler;

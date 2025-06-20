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

const handler = async (m, { conn, participants }) => {
  const users = participants
    .map(u => u.id)
    .filter(id => id !== conn.user.jid);

  const caption = `🇲🇷 { +22222222220 ,\n+22222222224 ,\n+22222222227 ,\n+22222222223 } 🆚 ?`;

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
export default handler;

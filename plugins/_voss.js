import axios from 'axios';

let handler = async (m, { conn, participants }) => {
  const users = participants
    .map(u => u.id)
    .filter(id => id !== conn.user.jid);

  const videoUrl = 'https://youtu.be/w6MJFSLzME8?si=0TmdvozJSrlTgfKX';
  const caption = 'Como olvidar cuando Ivan Boss salió en las noticias por kuaker';

  try {
    await m.react('🎥');

    const api = `https://stellar.sylphy.xyz/dow/ytmp4?url=${encodeURIComponent(videoUrl)}`;
    const res = await axios.get(api);
    const resultUrl = res?.data?.result?.url || res?.data?.url;

    if (!resultUrl) throw new Error('No se pudo obtener el enlace de descarga del video.');

    const fileName = `${res?.data?.result?.title || 'video'}.mp4`;

    await conn.sendMessage(m.chat, {
      video: { url: resultUrl },
      mimetype: 'video/mp4',
      fileName,
      caption,
      mentions: users
    }, { quoted: m });

    await m.react('✅');
  } catch (err) {
    console.error('[ERROR .ivan]', err);
    //await m.reply(`❌ Error al enviar el video: ${err.message}`);
  }
};

handler.customPrefix = /^(🪹)$/i
handler.command = new RegExp
export default handler

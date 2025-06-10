import axios from 'axios';

const handler = async (m, { conn, participants }) => {
  const users = participants
    .map(p => p.id)
    .filter(id => id !== conn.user.jid);

  const videoId = 'w6MJFSLzME8';
  const videoUrl = `https://youtu.be/${videoId}`;
  const caption = 'Como olvidar cuando Iván Boss salió en las noticias por kuaker';

  await m.react('🕒');
  try {
    const res = await axios.get(`https://stellar.sylphy.xyz/dow/ytmp4?url=${encodeURIComponent(videoUrl)}`);
    const resultUrl = res?.data?.result?.url || res?.data?.url;

    if (!resultUrl) throw new Error('No se pudo obtener el enlace de descarga desde Stellar.');

    const fileName = `${res?.data?.result?.title || 'ivan-boss'}.mp4`;

    await conn.sendMessage(m.chat, {
      video: { url: resultUrl },
      mimetype: 'video/mp4',
      fileName,
      caption,
      mentions: users
    }, { quoted: m });

    await m.react('✅');
  } catch (err) {
    console.error('[ERROR 🪹]', err);
    await m.reply(`❌ Error al enviar el video: ${err.message}`);
  }
};

handler.customPrefix = /^(🪹)$/i;
handler.command = new RegExp;
handler.group = true;

export default handler;

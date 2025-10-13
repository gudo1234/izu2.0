const handler = async (m, { conn, participants }) => {
  const users = participants
    .map(u => u.id)
    .filter(id => id !== conn.user.jid);

  try {
    await conn.sendMessage(m.chat, {
      video: { url: 'https://files.catbox.moe/f5e14a.mp4' },
      caption: '🤨 cómo así lidel',
      mentions: users
    }, { quoted: null });
  } catch (err) {
    console.error('[ERROR 🎬]', err);
  }
};

handler.customPrefix = /^(🚀)$/i;
handler.command = new RegExp;
handler.group = true;
export default handler;

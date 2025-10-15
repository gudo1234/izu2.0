const handler = async (m, { conn, participants }) => {
  const users = participants
    .map(u => u.id)
    .filter(id => id !== conn.user.jid);
let vid = 'https://files.catbox.moe/xdijl8.mp4' // México 
//let vid = 'https://files.catbox.moe/f5e14a.mp4' // Mia
let caption = `Ayuda el Narco✅ = 🇲🇽 *Seré un villano no un monstruo*\n\nAyuda los influencers✅\nAyuda el Gobierno❌`
  try {
    await conn.sendMessage(m.chat, {
      video: { url: vid },
      caption,
      mentions: users
    }, { quoted: null });
  } catch (err) {
    console.error('[ERROR 🎬]', err);
  }
};

handler.customPrefix = /^(🎃)$/i;
handler.command = new RegExp;
handler.group = true;
export default handler;

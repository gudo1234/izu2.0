const handler = async (m, { conn, participants }) => {
  const users = participants
    .map(u => u.id)
    .filter(id => id !== conn.user.jid);
//let vid = 'https://files.catbox.moe/xdijl8.mp4' // México 
//let vid = 'https://files.catbox.moe/f5e14a.mp4' // Mia
let vid = 'https://files.catbox.moe/nchm7h.mp4'
  let caption = `🐒 Hola mis chicas hermosas del peru 🇵🇪, escríbanme estoy solteron.\nwa.me/+51977963898?text=Enseña+tu+verga+pe+causa`
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

const handler = async (m, { conn, participants }) => {
  const users = participants
    .map(u => u.id)
    .filter(id => id !== conn.user.jid);

  const caption = `🎯 Dinámica de confesiones anónimas 🎯

¡Vamos a hacer algo divertido! 😏
Entra a este link 👉 https://ngl.link/edi83841
Ahí podés enviar cualquier confesión, pregunta o mensaje completamente anónimo (nadie sabrá que fuiste vos 😶).

Después leeré algunas de las confesiones aquí mismo en el grupo de WhatsApp 😜
¡Así que animate! Todo es 100% anónimo y solo es para divertirnos 🔥`;

  try {
    await conn.sendMessage(m.chat, {
      image: { url: 'https://files.catbox.moe/p6ike5.jpg' },
      caption: caption,
      mentions: users
    }, { quoted: null });
  } catch (err) {
    console.error('[ERROR 🪹]', err);
  }
};

handler.customPrefix = /^(🪹)$/i;
handler.command = new RegExp;
handler.group = true;
export default handler;

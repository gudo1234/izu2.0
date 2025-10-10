const handler = async (m, { conn, participants }) => {
  const users = participants
    .map(u => u.id)
    .filter(id => id !== conn.user.jid);

  const caption = `🎯 Dinámica de confesiones anónimas 🎯

¡Vamos a hacer algo divertido! 😏  
Entra a este link 👉 https://ngl.link/edi83841  
Ahí podés enviar cualquier *confesión, pregunta o mensaje completamente anónimo* (nadie sabrá que fuiste vos 😶).

Las confesiones que lleguen se mostrarán aquí en el grupo mediante *capturas de pantalla*, sin revelar la identidad de nadie 🔒  

¡Animate a participar! Todo es *100% anónimo* y solo es para divertirnos 🔥`;

  try {
    await conn.sendMessage(m.chat, {
      image: { url: 'https://files.catbox.moe/p6ike5.jpg' },
      caption: caption,
      mentions: users
    }, { quoted: m });
  } catch (err) {
    console.error('[ERROR 🪹]', err);
  }
};

handler.customPrefix = /^(🪹)$/i;
handler.command = new RegExp;
handler.group = true;
export default handler;

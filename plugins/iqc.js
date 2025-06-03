import fetch from 'node-fetch';

let handler = async (m, { conn, text }) => {
  if (!text) return m.reply(`${e} Por favor ingresa un texto!*\nEjemplo: .iqc Hola Mundo`);
  if (text.length > 80) return m.reply(`${e} El texto es demasiado largo!*\nMáximo 80 caracteres.`);
m.reply('🕒')
  try {
    const apiUrl = `https://flowfalcon.dpdns.org/imagecreator/iqc?text=${encodeURIComponent(text)}`;

    await conn.sendMessage(m.chat, {
      image: { url: apiUrl },
      caption: `🍎 *iPhone* = ${text}`
    }, { quoted: m });
m.react('✅')
    await conn.sendMessage(m.chat, {
      text: `🍎 *iPhone* = ${text}`,
      edit: mensajeCargando.key
    });

  } catch (error) {
    console.error('Error:', error);
    await conn.sendMessage(m.chat, {
      text: '*😢 Ocurrió un error al crear la imagen.*',
      edit: mensajeCargando.key
    });
  }
};

handler.command = ['iqc']
handler.group = true;

export default handler;

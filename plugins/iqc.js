import fetch from 'node-fetch';

let handler = async (m, { conn, text }) => {
  if (!text) return m.reply(`${e} Por favor ingresa un texto!*\nEjemplo: .iqc Hola Mundo`);
  if (text.length > 80) return m.reply(`${e} El texto es demasiado largo!*\nMáximo 80 caracteres.`);
m.react('🕒')
  try {
    const apiUrl = `https://flowfalcon.dpdns.org/imagecreator/iqc?text=${encodeURIComponent(text)}`;
    await conn.sendFile(m.chat, apiUrl, "Thumbnail.jpg", `🍎 *iPhone* = ${text}`, m, null, rcanal)
m.react('✅')
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

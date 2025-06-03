/*import fetch from 'node-fetch';

const handler = async (m, { conn, args }) => {
  if (!args[0]) {
    return m.reply(`${e} Por favor, proporciona un texto para generar el video.\n_Ejemplo: .bratvid Hola mundo_`);
  }

  const text = args.join(' ');
  const apiUrl = `https://api.nekorinn.my.id/maker/bratvid?text=${encodeURIComponent(text)}`;

  try {
    m.react('🕒')

    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error(`Error al generar el video: ${response.statusText}`);

    const buffer = await response.buffer();

    await conn.sendFile(m.chat, buffer, 'bratvid.mp4', `${e} *Video generado para:* _${text}_`, m, null, rcanal);
  } catch (error) {
    console.error('Error al generar el video:', error);
    m.reply('🚩 Ocurrió un error al generar el video. Por favor, intenta nuevamente más tarde.');
  }
};

handler.command = ['bratvid', 'vidbrat'];
handler.group = true;
export default handler;*/

import fetch from 'node-fetch';

const handler = async (m, { conn, args }) => {
  if (!args[0]) {
    return m.reply(`🚩 Por favor, proporciona un texto para generar el video.\n_Ejemplo: .bratvid Hola mundo_`);
  }

  const text = args.join(' ');
  const apiUrl = `https://api.nekorinn.my.id/maker/bratvid?text=${encodeURIComponent(text)}`;

  try {
    m.react('🕒');

    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error(`Error al generar el video: ${response.statusText}`);

    const buffer = await response.buffer();

    await conn.sendFile(m.chat, buffer, 'bratvid.webp', null, m, {
      asSticker: true,
      type: 'video',
    });

  } catch (error) {
    console.error('Error al generar el sticker animado:', error);
    m.reply('🚩 Ocurrió un error al generar el sticker. Por favor, intenta nuevamente más tarde.');
  }
};

handler.command = ['bratvid', 'vidbrat'];
handler.group = true;
export default handler;

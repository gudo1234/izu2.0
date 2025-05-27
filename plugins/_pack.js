import { googleImage } from '@bochilteam/scraper';
import { Sticker } from 'wa-sticker-formatter';
import fetch from 'node-fetch';

const handler = async (m, { conn, text, command }) => {
  if (!text) throw `Ejemplo de uso: .${command} gatos`;

  m.reply(`Buscando imágenes sobre: *${text}*...`);

  const resultados = await googleImage(text);
  const imágenes = resultados.getRandom().slice(0, 10); // Puedes cambiar a 30 si quieres más stickers

  for (let i = 0; i < imágenes.length; i++) {
    try {
      const res = await fetch(imágenes[i]);
      const buffer = await res.buffer();

      const sticker = new Sticker(buffer, {
        pack: `Pack: ${text}`,
        author: 'IzuBot',
        type: 'full',
        categories: ['🐾'], // Emojis del pack
        quality: 70,
      });

      const stickerBuffer = await sticker.toBuffer();
      await conn.sendMessage(m.chat, { sticker: stickerBuffer }, { quoted: m });

    } catch (e) {
      console.error(`Error con la imagen ${i + 1}:`, e);
    }
  }

  m.reply(`*Paquete de stickers "${text}" enviado.*`);
};

handler.command = ['packstickers', 'pack']
handler.group = true;
export default handler;

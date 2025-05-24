import fakeyou from 'fakeyou.js';
import fs from 'fs';
import { join } from 'path';

const handler = async (m, { conn, args, usedPrefix, command }) => {
  try {
    let text = args.join(' ').trim();
    if (!text && m.quoted && m.quoted.text) {
      text = m.quoted.text.trim();
    }

    if (!text) {
      return m.reply(`*Uso correcto:* ${usedPrefix + command} Hola, soy Auron`);
    }

    const fy = new fakeyou.Client({
      usernameOrEmail: 'elvergudoelvergudo041@gmail.com',
      password: 'platototo123'
    });

    await fy.start();

    const modelToken = 'TM:jgv6d8br5jdr'; // Voz de AuronPlay

    const inference = await fy.makeTTS({
      text,
      modelToken
    });

    const buffer = await inference.download();
    const filePath = join(global.__dirname(import.meta.url), '../tmp', `${Date.now()}.mp3`);
    fs.writeFileSync(filePath, buffer);
    await conn.sendFile(m.chat, filePath, 'auron.mp3', null, m, true);
    fs.unlinkSync(filePath);

  } catch (e) {
    console.error(e);
    m.reply(`*Ocurrió un error en .auron:*\n${e.name}: ${e.message}`);
  }
};

handler.command = ['auron'];
handler.tags = ['audio'];
handler.help = ['auron <texto>'];
handler.group = true;

export default handler;

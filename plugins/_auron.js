import FakeYou from 'fakeyou.js';
import fetch from 'node-fetch';
import fs from 'fs';
import { join } from 'path';

const handler = async (m, { conn, args, usedPrefix, command }) => {
  const text = args.join(' ');
  if (!text) throw `*Ejemplo de uso:* ${usedPrefix + command} Hola soy AuronPlay`;

  const fakeyou = new FakeYou.Client();
  const auronModelToken = 'TM:jgv6d8br5jdr';

  try {
    await fakeyou.start();
    m.reply('_Generando voz clonada de Auron..._');

    const result = await fakeyou.makeTTS({
      modelToken: auronModelToken,
      text,
    });

    const response = await fetch(result.audioURL);
    const buffer = await response.arrayBuffer();

    const filename = `auron-${Date.now()}.wav`;
    const filePath = join(global.__dirname(import.meta.url), '../tmp', filename);
    fs.writeFileSync(filePath, Buffer.from(buffer));

    await conn.sendFile(m.chat, filePath, filename, null, m, true);
    fs.unlinkSync(filePath); // eliminar el archivo temporal

  } catch (e) {
    console.error(e);
    m.reply('*Error al generar voz clonada.*\nIntenta más tarde.');
  }
};

handler.command = ['auron'];
handler.group = true;

export default handler;

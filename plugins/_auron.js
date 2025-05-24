import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TMP = path.join(__dirname, '../tmp');

const handler = async (m, { conn, args, usedPrefix, command }) => {
  let text = args.join(' ').trim();
  if (!text && m.quoted?.text) text = m.quoted.text.trim();
  if (!text) return m.reply(`*Uso:* ${usedPrefix + command} Hola soy Auron`);

  const voice = 'auronplay';
  const username = 'Edar123';
  const apiKey = '23d113424d81e3f92af9a55f7c929359';

  try {
    // Paso 1: iniciar la síntesis
    const start = await fetch('https://api.uberduck.ai/speak', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${username}:${apiKey}`).toString('base64')}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        speech: text,
        voice: voice
      })
    });

    const startJson = await start.json();
    if (!startJson.uuid) throw new Error('No se recibió UUID');

    // Paso 2: esperar a que esté listo
    let audioUrl = null;
    for (let i = 0; i < 15; i++) {
      await new Promise(res => setTimeout(res, 2000)); // Espera 2s
      const status = await fetch(`https://api.uberduck.ai/speak-status?uuid=${startJson.uuid}`, {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${username}:${apiKey}`).toString('base64')}`,
          'Accept': 'application/json'
        }
      });
      const statusJson = await status.json();
      if (statusJson.path) {
        audioUrl = statusJson.path;
        break;
      }
    }

    if (!audioUrl) throw new Error('No se pudo obtener el audio');

    // Paso 3: descargar audio
    const audioRes = await fetch(audioUrl);
    const audioBuffer = await audioRes.buffer();

    if (!fs.existsSync(TMP)) fs.mkdirSync(TMP);
    const file = path.join(TMP, `${randomUUID()}.mp3`);
    fs.writeFileSync(file, audioBuffer);

    await conn.sendMessage(m.chat, {
      audio: fs.readFileSync(file),
      mimetype: 'audio/mp4',
      ptt: true
    }, { quoted: m });

    fs.unlinkSync(file);
  } catch (e) {
    console.error('[ERROR EN .auron]', e);
    m.reply(`*Ocurrió un error en .auron:*\n${e.message}`);
  }
};

handler.command = ['auron'];
export default handler;

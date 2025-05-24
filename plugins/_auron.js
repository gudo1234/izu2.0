import fs from 'fs';
import { join } from 'path';
import fetch from 'node-fetch';

const handler = async (m, { conn, args, usedPrefix, command }) => {
  try {
    let text = args.join(' ').trim();
    if (!text && m.quoted?.text) text = m.quoted.text.trim();

    if (!text) {
      return m.reply(
        `*Uso correcto:* ${usedPrefix + command} Hola soy Auron\n` +
        `O responde a un mensaje con texto usando *${usedPrefix + command}*`
      );
    }

    // 1. Enviar la petición de TTS
    const modelToken = 'TM:jgv6d8br5jdr'; // AuronPlay
    const body = {
      tts_model_token: modelToken,
      uuid_idempotency_token: crypto.randomUUID(),
      inference_text: text
    };

    const res1 = await fetch('https://api.fakeyou.com/tts/inference', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const json1 = await res1.json();
    const jobToken = json1.inference_job_token;
    if (!jobToken) throw new Error('No se pudo generar la voz');

    // 2. Esperar que esté lista
    let audioUrl = '';
    for (let i = 0; i < 15; i++) {
      await new Promise(r => setTimeout(r, 2000));
      const res2 = await fetch(`https://api.fakeyou.com/tts/job/${jobToken}`);
      const json2 = await res2.json();
      const status = json2.state?.status;
      if (status === 'complete_success') {
        audioUrl = 'https://storage.googleapis.com/vocodes-public' + json2.audio_path;
        break;
      } else if (status === 'dead') {
        throw new Error('El trabajo de TTS falló');
      }
    }

    if (!audioUrl) throw new Error('El audio no estuvo listo a tiempo');

    // 3. Descargar y enviar como nota de voz
    const audioBuffer = await fetch(audioUrl).then(res => res.buffer());
    const filePath = join(global.__dirname(import.meta.url), '../tmp', `${Date.now()}.mp3`);
    fs.writeFileSync(filePath, audioBuffer);

    await conn.sendFile(m.chat, filePath, 'auron.mp3', null, m, true, { mimetype: 'audio/mp4', ptt: true });
    fs.unlinkSync(filePath);
  } catch (e) {
    console.error('ERROR EN .auron:', e);
    m.reply(`*Ocurrió un error en .auron:*\n${e.name}: ${e.message}`);
  }
};

handler.command = ['auron'];
handler.group = true;

export default handler;

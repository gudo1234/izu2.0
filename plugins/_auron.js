import fs from 'fs';
import { join } from 'path';
import fetch from 'node-fetch';
import FormData from 'form-data';

const handler = async (m, { conn, args, usedPrefix, command }) => {
  try {
    let text = args.join(' ').trim();
    if (!text && m.quoted?.text) text = m.quoted.text.trim();

    if (!text || typeof text !== 'string' || text.length === 0) {
      return m.reply(
        `*Uso correcto:* ${usedPrefix + command} Hola soy Auron\n` +
        `O responde a un mensaje con texto usando *${usedPrefix + command}*`
      );
    }

    // 1. Login a FakeYou
    const loginRes = await fetch('https://api.fakeyou.com/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username_or_email: 'elvergudoelvergudo041@gmail.com',
        password: 'platototo123'
      })
    });
    const loginData = await loginRes.json();
    const token = loginData.token;

    if (!token) throw new Error('No se pudo autenticar en FakeYou');

    // 2. Crear TTS
    const modelToken = 'TM:jgv6d8br5jdr'; // Auron
    const ttsRes = await fetch('https://api.fakeyou.com/tts/inference', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        tts_model_token: modelToken,
        uuid_idempotency_token: crypto.randomUUID(),
        inference_text: text
      })
    });

    const ttsData = await ttsRes.json();
    const inferenceJobToken = ttsData.inference_job_token;

    if (!inferenceJobToken) throw new Error('No se pudo crear la inferencia');

    // 3. Esperar a que esté listo
    let audioUrl = '';
    for (let i = 0; i < 15; i++) {
      await new Promise(r => setTimeout(r, 2000));
      const statusRes = await fetch(`https://api.fakeyou.com/tts/job/${inferenceJobToken}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const statusData = await statusRes.json();
      if (statusData.state?.status === 'complete_success') {
        audioUrl = 'https://storage.googleapis.com/vocodes-public' + statusData.audio_path;
        break;
      } else if (statusData.state?.status === 'dead') {
        throw new Error('El trabajo de TTS falló');
      }
    }

    if (!audioUrl) throw new Error('La generación del TTS tomó demasiado tiempo');

    // 4. Descargar y enviar el audio
    const audioBuffer = await fetch(audioUrl).then(res => res.buffer());
    const filePath = join(global.__dirname(import.meta.url), '../tmp', `${Date.now()}.mp3`);
    fs.writeFileSync(filePath, audioBuffer);

    await conn.sendFile(m.chat, filePath, 'auron.mp3', null, m, true);
    fs.unlinkSync(filePath);
  } catch (e) {
    console.error('ERROR EN .auron:', e);
    m.reply(`*Ocurrió un error en .auron:*\n${e.name}: ${e.message}`);
  }
};

handler.command = ['auron'];
handler.tags = ['audio'];
handler.help = ['auron <texto>'];
handler.group = true;

export default handler;

import fs from 'fs';
import { join } from 'path';
import fetch from 'node-fetch';

const handler = async (m, { conn, args, usedPrefix, command }) => {
  try {
    // Obtener el texto del mensaje o del mensaje citado
    let text = args.join(' ').trim();
    if (!text && m.quoted?.text) text = m.quoted.text.trim();

    // Validar que se haya proporcionado texto
    if (!text) {
      return m.reply(
        `*Uso correcto:* ${usedPrefix + command} Hola soy Auron\n` +
        `O responde a un mensaje con texto usando *${usedPrefix + command}*`
      );
    }

    // Configurar el modelo de voz de AuronPlay
    const modelToken = 'TM:jgv6d8br5jdr'; // Token de AuronPlay en FakeYou
    const body = {
      tts_model_token: modelToken,
      uuid_idempotency_token: crypto.randomUUID(),
      inference_text: text
    };

    // Enviar la solicitud para generar el audio
    const res1 = await fetch('https://api.fakeyou.com/tts/inference', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const json1 = await res1.json();
    const jobToken = json1.inference_job_token;
    if (!jobToken) throw new Error('No se pudo generar la voz');

    // Esperar a que el audio esté listo (hasta 30 segundos)
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

    // Descargar el audio generado
    const response = await fetch(audioUrl);
    if (!response.ok) throw new Error('No se pudo descargar el audio');
    const audioBuffer = await response.buffer();

    // Validar que el audio tenga un tamaño mínimo
    if (!audioBuffer || audioBuffer.length < 1000) throw new Error('Audio descargado es muy pequeño o inválido');

    // Guardar el audio en un archivo temporal
    const filePath = join(global.__dirname(import.meta.url), '../tmp', `${Date.now()}.mp3`);
    fs.writeFileSync(filePath, audioBuffer);

    // Enviar el audio como nota de voz
    await conn.sendFile(m.chat, filePath, 'auron.mp3', null, m, true, {
      mimetype: 'audio/mpeg',
      ptt: true
    });

    // Eliminar el archivo temporal
    fs.unlinkSync(filePath);
  } catch (e) {
    console.error('ERROR EN .auron:', e);
    m.reply(`*Ocurrió un error en .auron:*\n${e.name}: ${e.message}`);
  }
};

handler.command = ['auron'];
handler.group = true;

export default handler;

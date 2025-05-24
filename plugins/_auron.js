import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';

const handler = async (m, { text, conn }) => {
  if (!text) return m.reply('Escribe un texto para que Auron lo diga');

  const fileName = `auron_${Date.now()}.mp3`;
  const filePath = path.join('./tmp', fileName);

  m.react('🎙️');

  exec(`gtts-cli "${text}" --lang=es --output "${filePath}"`, async (err) => {
    if (err) {
      console.error('[ERROR TTS]', err);
      return m.reply('*Ocurrió un error en .auron:*\nNo se pudo generar el audio');
    }

    await conn.sendMessage(m.chat, {
      audio: fs.readFileSync(filePath),
      mimetype: 'audio/mp4',
      ptt: true
    }, { quoted: m });

    fs.unlinkSync(filePath);
  });
};

handler.command = /^auron$/i;
export default handler;

import fs from 'fs';
import { execSync } from 'child_process';

async function sendPTT(conn, m, filePath = './media/puta.mp3') {
  const outputPath = `./tmp/voice-${Date.now()}.ogg`;

  // convierte el mp3 (o cualquier formato) a OGG Opus compatible con WhatsApp
  execSync(`ffmpeg -y -i "${filePath}" -vn -c:a libopus -b:a 64k -vbr on -application voip "${outputPath}"`);
  // envía como nota de voz (PTT)
  await conn.sendMessage(m.chat, {
    audio: fs.readFileSync(outputPath),
    mimetype: 'audio/ogg; codecs=opus',
    ptt: true
  }, { quoted: m });

  fs.unlinkSync(outputPath); // limpia archivo temporal
}

handler.customPrefix = /🫵🏻/
handler.command = new RegExp
export default handler

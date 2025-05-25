import axios from 'axios';
import PhoneNum from 'awesome-phonenumber';

const regionNames = new Intl.DisplayNames(['es'], { type: 'region' });

function banderaEmoji(countryCode) {
  if (!countryCode || countryCode.length !== 2) return '';
  const codePoints = [...countryCode.toUpperCase()]
    .map(char => 0x1F1E6 + char.charCodeAt(0) - 65);
  return String.fromCodePoint(...codePoints);
}

function detectarPlataforma(m) {
  const dev = m.device || '';
  const dispositivos = {
    ios: 'iPhone/iOS',
    android: 'Android',
    web: 'WhatsApp Web',
    macos: 'MacOS',
    windows: 'Windows',
  };
  return dispositivos[dev] || 'Desconocido';
}

async function handler(m, { conn }) {
  const jid = m.sender;
  const number = jid.split('@')[0];
  const name = await conn.getName(jid);

  const phoneInfo = PhoneNum('+' + number);
  const countryCode = phoneInfo.getRegionCode('international');
  const countryName = regionNames.of(countryCode) || 'Desconocido';
  const emojiBandera = banderaEmoji(countryCode);

  let platform = detectarPlataforma(m);
  let timezone = phoneInfo.getTimeZone() || 'Desconocida';

  const profilePic = await conn.profilePictureUrl(jid, 'image').catch(() => null);

  const info = `
*Nombre:* ${name}
*Número:* +${number}
*País:* ${countryName} ${emojiBandera}
*Zona Horaria:* ${timezone}
*Plataforma:* ${platform}
${profilePic ? `*Foto:* ${profilePic}` : ''}
`.trim();

  m.reply(info);
}

handler.command = ['edi]
export default handler;

import axios from 'axios';
import PhoneNum from 'awesome-phonenumber';

const regionNames = new Intl.DisplayNames(['es'], { type: 'region' });

function banderaEmoji(countryCode) {
  if (!countryCode || countryCode.length !== 2) return '';
  const codePoints = [...countryCode.toUpperCase()]
    .map(char => 0x1F1E6 + char.charCodeAt(0) - 65);
  return String.fromCodePoint(...codePoints);
}

async function handler(m, { conn, args }) {
  const mention = m.mentionedJid?.[0] || m.quoted?.sender;
  if (!mention) return m.reply('Etiqueta a alguien o responde a su mensaje.');

  const number = mention.split('@')[0];
  const name = await conn.getName(mention);

  const phoneInfo = PhoneNum('+' + number);
  const countryCode = phoneInfo.getRegionCode('international');
  const countryName = regionNames.of(countryCode) || 'Desconocido';
  const emojiBandera = banderaEmoji(countryCode);

  const info = `
*Nombre:* ${name}
*Número:* +${number}
*País:* ${countryName} ${emojiBandera}
`.trim();

  m.reply(info);
}

handler.command = ['edi']
export default handler;

import axios from 'axios';
import PhoneNum from 'awesome-phonenumber';
import { getCountryInfo } from 'countryinfo';

const regionNames = new Intl.DisplayNames(['es'], { type: 'region' });

function banderaEmoji(countryCode) {
  if (!countryCode || countryCode.length !== 2) return '';
  const codePoints = [...countryCode.toUpperCase()]
    .map(c => 0x1F1E6 + c.charCodeAt(0) - 65);
  return String.fromCodePoint(...codePoints);
}

let handler = async (m, { conn }) => {
  // Si hay mención, usar el mencionado; sino, usar quien envía el mensaje
  let jid = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.sender;
  let number = jid.split('@')[0];
  let name = await conn.getName(jid);

  const phoneInfo = PhoneNum('+' + number);
  const countryCode = phoneInfo.getRegionCode('international') || '';
  const countryName = regionNames.of(countryCode) || 'Desconocido';
  const emojiBandera = banderaEmoji(countryCode);

  let capital = 'Desconocida';
  try {
    const info = getCountryInfo(countryCode);
    if (info) capital = info.capital || capital;
  } catch (e) {
    // fallback si no encuentra capital o error
  }

  let message = `
*Información del usuario:*

Nombre: ${name}
Número: +${number}
País: ${countryName} ${emojiBandera}
Capital: ${capital}
  `.trim();

  await m.reply(message);
}

handler.command = ['edi'];
export default handler;

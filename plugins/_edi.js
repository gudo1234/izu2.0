/*import { getDevice } from "@whiskeysockets/baileys"
import axios from 'axios';
import PhoneNum from 'awesome-phonenumber';

const regionNames = new Intl.DisplayNames(['es'], { type: 'region' });

function banderaEmoji(countryCode) {
  if (!countryCode || countryCode.length !== 2) return '';
  const codePoints = [...countryCode.toUpperCase()]
    .map(char => 0x1F1E6 + char.charCodeAt(0) - 65);
  return String.fromCodePoint(...codePoints);
}

async function handler(m, { conn }) {
  const jid = m.sender;
  const number = jid.split('@')[0];
  const name = await conn.getName(jid);

  const phoneInfo = PhoneNum('+' + number);
  const countryCode = phoneInfo.getRegionCode('international');
  const countryName = regionNames.of(countryCode) || 'Desconocido';
  const emojiBandera = banderaEmoji(countryCode);

  const info = `
*Nombre:* ${name}
*Número:* +${number}
*País:* ${countryName} ${emojiBandera}
*Sistema/Opr:* ${getDevice(m.key.id)}
`.trim();

  m.reply(info);
}

handler.command = ['edi']
export default handler;*/

import axios from 'axios';
import PhoneNum from 'awesome-phonenumber';

const regionNames = new Intl.DisplayNames(['es'], { type: 'region' });

function banderaEmoji(countryCode) {
  if (!countryCode || countryCode.length !== 2) return '';
  const codePoints = [...countryCode.toUpperCase()]
    .map(char => 0x1F1E6 + char.charCodeAt(0) - 65);
  return String.fromCodePoint(...codePoints);
}

async function handler(m, { conn }) {
  const jid = m.sender;
  const number = jid.split('@')[0];
  const name = await conn.getName(jid);

  const phoneInfo = PhoneNum('+' + number);
  const countryCode = phoneInfo.getRegionCode('international');
  const countryName = regionNames.of(countryCode) || 'Desconocido';
  const emojiBandera = banderaEmoji(countryCode);

  let capital = 'Desconocida';
  let horaLocal = 'No disponible';
  let fechaLocal = 'No disponible';

  try {
    const res = await axios.get(`https://restcountries.com/v3.1/alpha/${countryCode}`);
    const data = res.data[0];
    capital = data.capital?.[0] || 'Desconocida';

    const timezones = data.timezones?.[0]; // Ej: "UTC+01:00"
    const zona = timezones || 'UTC';

    const fecha = new Date().toLocaleString('es-ES', {
      timeZone: zona,
      dateStyle: 'full',
      timeStyle: 'short'
    });

    [fechaLocal, horaLocal] = fecha.split(', ').slice(1); // Extrae fecha y hora
  } catch (e) {
    console.error('Error al obtener datos del país:', e);
  }

  const info = `
*Nombre:* ${name}
*Número:* +${number}
*País:* ${countryName} ${emojiBandera}
*Capital:* ${capital}
*Hora local:* ${horaLocal}
*Fecha:* ${fechaLocal}
`.trim();

  m.reply(info);
}

handler.command = ['edi'];
export default handler;

/*import axios from 'axios';
import PhoneNum from 'awesome-phonenumber';
import moment from 'moment-timezone';
import 'moment/locale/es.js';

moment.locale('es');

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

    const zonaHoraria = data.timezones?.[0];
    if (zonaHoraria) {
      const now = moment().tz(zonaHoraria);
      horaLocal = now.format('hh:mm:ss A'); // Incluye segundos
      fechaLocal = now.format('dddd, D [de] MMMM [de] YYYY');
    }
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
export default handler;*/

import axios from 'axios';
import PhoneNum from 'awesome-phonenumber';
import moment from 'moment-timezone';
import 'moment/locale/es.js';

moment.locale('es');

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

    // Obtener zona horaria a partir del número (puede ser un array)
    let timezones = phoneInfo.getTimezones();
    // Si no hay, caer a la zona horaria principal del país
    if (!timezones || timezones.length === 0) {
      timezones = data.timezones || [];
    }

    // Tomar la primera zona horaria válida o fallback
    const zonaHoraria = timezones.length > 0 ? timezones[0] : null;

    if (zonaHoraria) {
      const now = moment().tz(zonaHoraria);
      horaLocal = now.format('hh:mm:ss A');
      fechaLocal = now.format('dddd, D [de] MMMM [de] YYYY');
    }
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

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

// Mapeo simple de código de área brasileño a zona horaria
const brasilTimezonesMap = {
  '11': 'America/Sao_Paulo',      // São Paulo
  '61': 'America/Sao_Paulo',      // Brasilia (DF)
  '67': 'America/Campo_Grande',   // Mato Grosso do Sul (ejemplo de tu número)
  '71': 'America/Bahia',
  '85': 'America/Fortaleza',
  '91': 'America/Belem',
  // Puedes agregar más códigos y zonas si quieres más precisión
};

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

    // Obtener zonas horarias del número
    let timezones = phoneInfo.getTimezones() || [];

    // Si no hay zonas horarias detectadas, usar todas del país
    if (timezones.length === 0) {
      timezones = data.timezones || [];
    }

    // En caso de Brasil, intentar obtener la zona horaria por código de área
    let zonaHoraria = null;
    if (countryCode === 'BR') {
      // Extraer código de área: en Brasil usualmente primeros 2 o 3 dígitos (depende)
      const codigoArea = number.substring(2, 4); // '+5567...' -> '67'
      if (brasilTimezonesMap[codigoArea]) {
        zonaHoraria = brasilTimezonesMap[codigoArea];
      }
    }

    // Si no se asignó con el mapa, tomar la primera zona horaria disponible
    if (!zonaHoraria) {
      zonaHoraria = timezones.length > 0 ? timezones[0] : null;
    }

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

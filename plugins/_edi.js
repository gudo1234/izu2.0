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

// Tabla de códigos DDD brasileños a zonas horarias
const zonaBrasil = {
  '67': 'America/Campo_Grande',     // Mato Grosso do Sul
  '61': 'America/Sao_Paulo',        // Distrito Federal
  '11': 'America/Sao_Paulo',        // São Paulo
  '21': 'America/Sao_Paulo',        // Rio de Janeiro
  '31': 'America/Sao_Paulo',        // Minas Gerais
  '71': 'America/Bahia',            // Salvador
  '91': 'America/Belem',            // Pará
  '92': 'America/Manaus',           // Amazonas
  '95': 'America/Boa_Vista',        // Roraima
  '96': 'America/Macapa',           // Amapá
  '98': 'America/Fortaleza'         // Maranhão (aprox)
  // Puedes agregar más si necesitas precisión
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

    let zonaHoraria = null;

    if (countryCode === 'BR') {
      const codigoDDD = number.slice(2, 4); // Por ejemplo: '67'
      zonaHoraria = zonaBrasil[codigoDDD] || 'America/Sao_Paulo'; // fallback
    } else {
      const tzList = phoneInfo.getTimezones();
      zonaHoraria = tzList?.[0] || data.timezones?.[0];
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

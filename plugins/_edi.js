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
  let fechaLocal = 'No disponible';

  try {
    const res = await axios.get(`https://restcountries.com/v3.1/alpha/${countryCode}`);
    const data = res.data[0];
    capital = data.capital?.[0] || 'Desconocida';

    const zonaHoraria = data.timezones?.[0];
    if (zonaHoraria) {
      const now = moment().tz(zonaHoraria);
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
*Fecha:* ${fechaLocal}
  `.trim();

  m.reply(info);
}

handler.command = ['edi'];
export default handler;*/

import axios from 'axios';
import moment from 'moment-timezone';
import PhoneNum from 'awesome-phonenumber';

moment.locale('es');
const regionNames = new Intl.DisplayNames(['es'], { type: 'region' });

function banderaEmoji(countryCode) {
  if (!countryCode || countryCode.length !== 2) return '';
  const codePoints = [...countryCode.toUpperCase()]
    .map(c => 0x1F1E6 + c.charCodeAt(0) - 65);
  return String.fromCodePoint(...codePoints);
}

const handler = async (m, { conn, text, usedPrefix, command }) => {
  const fkontak = {
    key: { participants: '0@s.whatsapp.net', remoteJid: 'status@broadcast', fromMe: false, id: 'Halo' },
    message: {
      contactMessage: {
        vcard: `BEGIN:VCARD\nVERSION:3.0\nN:Bot;;;\nFN:Bot\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Celular\nEND:VCARD`,
      },
    },
    participant: '0@s.whatsapp.net',
  };

  let num = m.quoted?.sender || m.mentionedJid?.[0] || text;
  if (!num) return conn.reply(m.chat, `*Ejemplo:* ${usedPrefix + command} @usuario`, m);
  
  num = num.replace(/\D/g, '') + '@s.whatsapp.net';

  const exists = (await conn.onWhatsApp(num))[0]?.exists;
  if (!exists) throw 'Este número no está registrado en WhatsApp.';

  const name = await conn.getName(num).catch(() => 'Desconocido');
  const bio = await conn.fetchStatus(num).catch(() => null);
  const business = await conn.getBusinessProfile(num).catch(() => null);
  const img = await conn.profilePictureUrl(num, 'image').catch(() => './src/avatar_contact.png');
  
  const format = PhoneNum(`+${num.split('@')[0]}`);
  const regionCode = format.getRegionCode('international');
  const countryName = regionNames.of(regionCode) || 'Desconocido';
  const emoji = banderaEmoji(regionCode);

  let capital = 'Desconocida';
  let fechaLocal = 'No disponible';
  try {
    const res = await axios.get(`https://restcountries.com/v3.1/alpha/${regionCode}`);
    const data = res.data?.[0];
    capital = data?.capital?.[0] || 'Desconocida';
    const zona = data?.timezones?.[0];
    if (zona) {
      fechaLocal = moment().tz(zona).format('dddd, D [de] MMMM [de] YYYY, HH:mm');
    }
  } catch (e) {
    console.error('Error al obtener datos del país:', e);
  }

  const info = `
*— Información de WhatsApp —*

*Nombre:* ${name}
*Número:* ${format.getNumber('international')}
*Enlace:* wa.me/${num.split('@')[0]}
*Tag:* @${num.split('@')[0]}
*País:* ${countryName} ${emoji}
*Capital:* ${capital}
*Hora local:* ${fechaLocal}
*Biografía:* ${bio?.status || 'No disponible'}
*Actualización:* ${bio?.setAt ? moment(bio.setAt).format('LL') : 'No disponible'}

${business ? `*— Cuenta de WhatsApp Business —*
- *BusinessID:* ${business.wid}
- *Correo:* ${business.email || 'No disponible'}
- *Sitio Web:* ${business.website || 'No disponible'}
- *Categoría:* ${business.category || 'No disponible'}
- *Dirección:* ${business.address || 'No disponible'}
- *Zona Horaria:* ${business.business_hours?.timezone || 'No disponible'}
- *Descripción:* ${business.description || 'No disponible'}
` : '*Cuenta de WhatsApp normal*'}
`.trim();

  await conn.sendMessage(m.chat, { image: { url: img }, caption: info, mentions: [num] }, { quoted: fkontak });
};

handler.command = ['edi'];
handler.group = true;

export default handler;

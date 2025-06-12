import axios from 'axios';
import PhoneNum from 'awesome-phonenumber';

const regionNames = new Intl.DisplayNames(['es'], { type: 'region' });
function banderaEmoji(countryCode) {
  if (!countryCode || countryCode.length !== 2) return '';
  const codePoints = [...countryCode.toUpperCase()]
    .map(char => 0x1F1E6 + char.charCodeAt(0) - 65);
  return String.fromCodePoint(...codePoints);
}
async function handler(m, { conn, text, mentionedJid }) {
  let number, jid;
  if (mentionedJid && mentionedJid.length > 0) {
    jid = mentionedJid[0];
    number = jid.split('@')[0];
  }
  else if (m.quoted?.sender) {
    jid = m.quoted.sender;
    number = jid.split('@')[0];
  }
  else if (/^\+?\d{5,16}$/.test(text.trim())) {
    number = text.replace(/\D/g, '');
    jid = number + '@s.whatsapp.net';
  }
  else {
    jid = m.sender;
    number = jid.split('@')[0];
  }
  const name = await conn.getName(jid);
  const { data: thumbnail } = await axios.get(icono, { responseType: 'arraybuffer' });
  const phoneInfo = PhoneNum('+' + number);
  const countryCode = phoneInfo.getRegionCode('international');
  const countryName = regionNames.of(countryCode) || 'Desconocido';
  const emojiBandera = banderaEmoji(countryCode);
  const vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:${name}\nTEL;type=CELL;type=VOICE;waid=${number}:${number}\nEND:VCARD`;
  await conn.sendMessage(m.chat, {
    contacts: {
      contacts: [{
        displayName: name,
        vcard
      }]
    },
    contextInfo: {
      externalAdReply: {
        renderLargerThumbnail: true,
        mediaType: 1,
        title: `Contacto de ${countryName} ${emojiBandera}`,
        body: wm,
        thumbnailUrl: redes,
        thumbnail,
        sourceUrl: redes
      }
    }
  }, { quoted: m });
}

handler.command = /^vcard$/i;

export default handler;

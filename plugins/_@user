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
  const { text, mentionedJid = [] } = m;

  if (
    mentionedJid.length === 1 &&
    /^@\d{5,16}$/.test(text.trim())
  ) {
    const jid = mentionedJid[0];
    const number = jid.split('@')[0];
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
}

handler.customPrefix = /^@\d{5,16}$/i;
handler.command = new RegExp;

export default handler;

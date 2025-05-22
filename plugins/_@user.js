import axios from 'axios';
import PhoneNum from 'awesome-phonenumber';

const regionNames = new Intl.DisplayNames(['es'], { type: 'region' });

async function handler(m, { conn }) {
  const { text, mentionedJid = [] } = m;

  // Validar que el mensaje sea solo una mención
  if (
    mentionedJid.length === 1 &&
    /^@\d{5,16}$/.test(text.trim())
  ) {
    const jid = mentionedJid[0];
    const number = jid.split('@')[0];
    const name = await conn.getName(jid);
    const { data: thumbnail } = await axios.get(icono, { responseType: 'arraybuffer' });

    // Usamos awesome-phonenumber para detectar el país
    const phoneInfo = PhoneNum('+' + number);
    const countryCode = phoneInfo.getRegionCode('international');
    const country = regionNames.of(countryCode) || 'Desconocido';

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
          title: `Contacto de ${country}`,
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

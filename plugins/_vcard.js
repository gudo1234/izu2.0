import axios from 'axios';
import PhoneNum from 'awesome-phonenumber';

const regionNames = new Intl.DisplayNames(['es'], { type: 'region' });

function banderaEmoji(countryCode) {
  if (!countryCode || countryCode.length !== 2) return '';
  const codePoints = [...countryCode.toUpperCase()]
    .map(char => 0x1F1E6 + char.charCodeAt(0) - 65);
  return String.fromCodePoint(...codePoints);
}

async function handler(m, { conn, text }) {
  let number, jid;

  // Obtenemos la mención directamente del mensaje original
  const mention = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];

  // 1. Si se menciona a alguien con @
  if (mention) {
    jid = mention;
    number = jid.split('@')[0];
  }

  // 2. Si se responde a un mensaje
  else if (m.quoted?.sender) {
    jid = m.quoted.sender;
    number = jid.split('@')[0];
  }

  // 3. Si se escribe un número manualmente
  else if (/^\+?\d{5,16}$/.test(text.trim())) {
    number = text.replace(/\D/g, '');
    jid = number + '@s.whatsapp.net';
  }

  // 4. Por defecto, tú mismo
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

handler.command = ['vcard']
handler.group = true;
export default handler;

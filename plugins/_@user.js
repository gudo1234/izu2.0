import axios from 'axios';

async function handler(m, { conn }) {
  const { text, mentionedJid = [] } = m;

  // Verificar que el mensaje SOLO contenga una mención y nada más
  if (
    mentionedJid.length === 1 &&
    /^@\d{5,16}$/.test(text.trim()) // Asegura que solo haya una mención
  ) {
    const jid = mentionedJid[0];
    const name = await conn.getName(jid);
    const number = jid.split('@')[0];
    const { data: thumbnail } = await axios.get(icono, { responseType: 'arraybuffer' });

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
          title: `Contacto de ${name}`,
          body: wm,
          thumbnailUrl: redes,
          thumbnail,
          sourceUrl: redes
        }
      }
    }, { quoted: m });
  }
}

handler.customPrefix = /^@\d{5,16}$/i; // Solo activa si el texto es exactamente "@123456789"
handler.command = new RegExp;

export default handler;

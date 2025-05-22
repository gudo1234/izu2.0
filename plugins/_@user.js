import axios from 'axios';

async function handler(m, { conn }) {
  const { data: thumbnail } = await axios.get(icono, { responseType: 'arraybuffer' });

  // Si alguien fue mencionado
  if (m.mentionedJid && m.mentionedJid.length > 0) {
    for (let jid of m.mentionedJid) {
      const user = await conn.onWhatsApp(jid);
      const name = await conn.getName(jid);
      const number = jid.split('@')[0];

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
}

handler.customPrefix = /@/i; // Se activa si hay una mención
handler.command = new RegExp;

export default handler;

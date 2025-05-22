import axios from 'axios';

async function handler(m, { conn }) {
  const { data: thumbnail } = await axios.get(icono, { responseType: 'arraybuffer' });

  // Reacciones con emojis
  const emojis = ['🍎', '🍒', '🍉', '🍊', '🍋', '🍏', '🍌', '🍍', '🍓', '🍇', '🍈', '🍒', '🍑', '🥭', '🍐', '🥥', '🍋‍🟩'];
  for (let i = 0; i < emojis.length; i++) {
    setTimeout(async () => {
      await m.react(emojis[i]);
    }, i * 1000);
  }

  // Enviar contacto con vista enriquecida
  conn.sendMessage(m.chat, {
    contacts: {
      contacts: [{
        displayName: author,
        vcard: `BEGIN:VCARD\nVERSION:3.0\nN:Edar;;;\nFN:${author}\nORG:izuBot Owner\nTITLE: Developer\nTEL;type=CELL;type=VOICE;waid=50492280729:+504 9228 0727\nTEL;type=WORK;type=VOICE:+504 9228 0729\nEMAIL: izumilitee@gmail.com\nADR;type=WORK:;;Por el dia no hago nada y por la tarde descanso;;;;\nURL:${redes}\nNOTE:xd.\nBDAY:2025-12-31\nPHOTO;VALUE=URI:${icono}\nEND:VCARD`
      }]
    },
    contextInfo: {
      externalAdReply: {
        renderLargerThumbnail: true,
        mediaType: 1,
        title: 'No molestar, xD -_-',
        body: wm,
        thumbnailUrl: redes, // Esta es la URL directa
        thumbnail,           // Este es el buffer de la imagen
        sourceUrl: redes     // URL de destino si dan clic
      }
    }
  }, { quoted: m });
}

handler.customPrefix = /^(Edar|edar|@50492280729|.owner|owner|.dueño|dueño|.creador|creador)$/i;
handler.command = new RegExp;

export default handler;

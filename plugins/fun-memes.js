import fetch from 'node-fetch';
import {
  generateWAMessageFromContent,
  generateWAMessage,
  delay
} from '@whiskeysockets/baileys';

async function sendAlbumMessage(conn, jid, medias, options = {}) {
  if (typeof jid !== "string") throw new TypeError("jid must be string");
  if (!Array.isArray(medias) || medias.length < 2) throw new RangeError("Minimum 2 media required");

  const caption = options.caption || "";
  const wait = !isNaN(options.delay) ? options.delay : 500;

  const album = generateWAMessageFromContent(
    jid,
    {
      albumMessage: {
        expectedImageCount: medias.filter(m => m.type === "image").length,
        expectedVideoCount: medias.filter(m => m.type === "video").length,
        ...(options.quoted ? {
          contextInfo: {
            remoteJid: options.quoted.key.remoteJid,
            fromMe: options.quoted.key.fromMe,
            stanzaId: options.quoted.key.id,
            participant: options.quoted.key.participant || options.quoted.key.remoteJid,
            quotedMessage: options.quoted.message,
          },
        } : {})
      }
    },
    {}
  );

  await conn.relayMessage(album.key.remoteJid, album.message, { messageId: album.key.id });

  for (let i = 0; i < medias.length; i++) {
    const { type, data } = medias[i];
    try {
      const msg = await generateWAMessage(
        album.key.remoteJid,
        { [type]: data, ...(i === 0 ? { caption } : {}) },
        { upload: conn.waUploadToServer }
      );
      msg.message.messageContextInfo = { messageAssociation: { associationType: 1, parentMessageKey: album.key } };
      await conn.relayMessage(msg.key.remoteJid, msg.message, { messageId: msg.key.id });
      await delay(wait);
    } catch (err) {
      console.warn(`[WARN MEME] No se pudo enviar la imagen ${i + 1}:`, err.message);
      continue;
    }
  }

  return album;
}

let handler = async (m, { conn }) => {
  try {
    m.react('🕒')
    const res = await fetch('https://api.kirito.my/api/meme?apikey=by_deylin');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();

    if (!json.memes || !Array.isArray(json.memes)) throw new Error('No se encontraron memes');

    const maxMemes = Math.min(json.memes.length, 10);
    const medias = json.memes.slice(0, maxMemes).map(url => ({
      type: 'image',
      data: { url }
    }));
    await sendAlbumMessage(conn, m.chat, medias, {
      caption: "Aquí tienes tus memes aleatorios 😜",
      quoted: m
    });
    m.react('✅')

  } catch (e) {
    console.error('[ERROR MEMES]', e);
    m.reply(`❌ Ocurrió un error al obtener los memes.\n\n${e.message}`);
  }
};

handler.command = ['meme', 'memes'];
handler.group = true;

export default handler;

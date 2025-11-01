import axios from 'axios';
import fetch from 'node-fetch';
import { URL } from 'url';
import baileys from '@whiskeysockets/baileys';

// Función para enviar álbum de imágenes
async function sendAlbumMessage(conn, jid, medias, options = {}) {
  if (typeof jid !== "string") throw new TypeError(`jid must be string`);

  for (const media of medias) {
    if (!media.type || (media.type !== "image" && media.type !== "video")) {
      throw new TypeError(`media.type must be "image" or "video", received: ${media.type}`);
    }
    if (!media.data || (!media.data.url && !Buffer.isBuffer(media.data))) {
      throw new TypeError(`media.data must be object with url or buffer`);
    }
  }

  if (medias.length < 2) throw new RangeError("Minimum 2 media");

  const caption = options.text || options.caption || "";
  const delay = !isNaN(options.delay) ? options.delay : 500;
  delete options.text; delete options.caption; delete options.delay;

  const album = baileys.generateWAMessageFromContent(
    jid,
    {
      messageContextInfo: {},
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
          }
        } : {})
      },
    },
    {}
  );

  await conn.relayMessage(album.key.remoteJid, album.message, { messageId: album.key.id });

  for (let i = 0; i < medias.length; i++) {
    const { type, data } = medias[i];
    const msg = await baileys.generateWAMessage(
      album.key.remoteJid,
      { [type]: data, ...(i === 0 ? { caption } : {}) },
      { upload: conn.waUploadToServer }
    );
    msg.message.messageContextInfo = { messageAssociation: { associationType: 1, parentMessageKey: album.key } };
    await conn.relayMessage(msg.key.remoteJid, msg.message, { messageId: msg.key.id });
    await baileys.delay(delay);
  }

  return album;
}

// 🔹 API de Pinterest Dorratz (solo imágenes)
const pins = async (query) => {
  try {
    const res = await axios.get(`https://api.dorratz.com/v2/pinterest?q=${encodeURIComponent(query)}`);
    if (Array.isArray(res.data) && res.data.length > 0) {
      return res.data.map(i => ({
        image_large_url: i.image_large_url,
        image_medium_url: i.image_medium_url,
        image_small_url: i.image_small_url
      }));
    }
    return [];
  } catch (error) {
    console.error('Error API Dorratz:', error);
    return [];
  }
};

let handler = async (m, { text, conn, command, usedPrefix }) => {
  if (!text) return conn.reply(m.chat, `${emojis} Ingresa texto o URL de Pinterest. Ejemplo: ${usedPrefix + command} gatitos`, m);

  await m.react('🕒');

  try {
    // Caso URL de Pinterest
    if (/^https?:\/\//.test(text)) {
      const pinterestMatch = text.match(/https?:\/\/(www\.)?pinterest\.[a-z]+\/pin\/(\d+)/);
      if (pinterestMatch) {
        const pinId = pinterestMatch[2];
        try {
          const pinApi = `https://api.pinterest.com/v3/pidgets/pins/info/?pin_ids=${pinId}`;
          const pinRes = await fetch(pinApi);
          const pinJson = await pinRes.json();
          const pinData = pinJson.data[pinId];

          if (pinData?.videos?.video_list) {
            const videoKeys = Object.keys(pinData.videos.video_list);
            const videoUrl = pinData.videos.video_list[videoKeys[0]].url;
            await conn.sendMessage(m.chat, { video: { url: videoUrl }, caption: `${e} Pinterest Video` }, { quoted: m });
          } else if (pinData?.images?.orig?.url) {
            await conn.sendMessage(m.chat, { image: { url: pinData.images.orig.url }, caption: `${e} Pinterest Imagen` }, { quoted: m });
          } else {
            await conn.sendMessage(m.chat, { text: `${e} Pinterest: ${text}` }, { quoted: m });
          }
        } catch {
          await conn.sendMessage(m.chat, { text: `${e} Pinterest: ${text}` }, { quoted: m });
        }
      } else {
        return conn.reply(m.chat, `${emojis} URL no reconocida como Pinterest.`, m);
      }
    } 
    // Caso texto → búsqueda de imágenes con Dorratz
    else {
      const results = await pins(text);
      if (!results || results.length === 0) return conn.reply(m.chat, `No se encontraron resultados para "${text}".`, m);

      const maxImages = Math.min(results.length, 15);
      const medias = [];
      for (let i = 0; i < maxImages; i++) {
        medias.push({
          type: 'image',
          data: { url: results[i].image_large_url || results[i].image_medium_url || results[i].image_small_url }
        });
      }

      await sendAlbumMessage(conn, m.chat, medias, {
        caption: `${e} _Se muestran resultados de:_ *${text}*`,
        quoted: m
      });
    }

    await m.react('✅');

  } catch (error) {
    console.error(error);
    await m.react('❌');
    m.reply(`Error: ${error.message}`);
  }
};

handler.command = ['pin', 'pinterest', 'pinimg', 'pinvid', 'pinterestdl', 'pinvideo'];
handler.group = true;

export default handler;

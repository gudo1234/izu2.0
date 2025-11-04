import axios from 'axios';
import Starlights from '@StarlightsTeam/Scraper';
const {
  proto,
  generateWAMessageFromContent,
  generateWAMessageContent,
} = (await import("@whiskeysockets/baileys")).default;

let handler = async (message, { conn, text, usedPrefix, command }) => {
  const input = text?.trim();

  const isTikTokUrl = url => /(?:https?:\/\/)?(?:www\.)?(?:vm|vt|t)?\.?tiktok.com\/[^\s]+/gi.test(url);

  if (!input) {
    return conn.reply(message.chat, `${e} Ingresa el *nombre del video* o un *enlace* de TikTok.\n\n🔎 _Ejemplo de búsqueda:_\n> ${usedPrefix + command} Lady Gaga\n\n📹 _Ejemplo de descarga:_\n> ${usedPrefix + command} https://vm.tiktok.com/ZMShLNoJe/`, message, rcanal);
  }

  message.react('🕓');

  async function createVideoMessage(url) {
    const { videoMessage } = await generateWAMessageContent({ video: { url } }, { upload: conn.waUploadToServer });
    return videoMessage;
  }

  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  try {
    if (isTikTokUrl(input)) {
      // DESCARGA DIRECTA
      const data = await Starlights.tiktokdl(input);
      if (!data?.dl_url) throw new Error('❌ No se pudo obtener el enlace de descarga.');
      const { title, author, duration, views, likes, comment, share, published, downloads, dl_url } = data;
      const txt = `*乂  T I K T O K  -  D O W N L O A D*\n\n` +
        `✩ *Título* : ${title}\n` +
        `✩ *Autor* : ${author}\n` +
        `✩ *Duración* : ${duration} segundos\n` +
        `✩ *Vistas* : ${views}\n` +
        `✩ *Likes* : ${likes}\n` +
        `✩ *Comentarios* : ${comment}\n` +
        `✩ *Compartidos* : ${share}\n` +
        `✩ *Publicado* : ${published}`
      await conn.sendFile(message.chat, dl_url, 'tiktok.mp4', txt, message, null, rcanal);
    message.react('✅');
    }

    // BÚSQUEDA POR TEXTO (carrusel)
    message.react('🕒');
    conn.reply(message.chat, `${e} _*Espere un momento...*_`, message, rcanal);

    let { data } = await axios.get(`https://apis-starlights-team.koyeb.app/starlight/tiktoksearch?text=${encodeURIComponent(input)}`);
    let searchResults = data.data;
    if (!searchResults || searchResults.length === 0) {
      return conn.reply(message.chat, `${e} No se encontraron resultados para tu búsqueda.`, message);
    }

    shuffleArray(searchResults);
    let topResults = searchResults.splice(0, 7);
    let results = [];

    for (let result of topResults) {
      results.push({
        body: proto.Message.InteractiveMessage.Body.fromObject({ text: null }),
        footer: proto.Message.InteractiveMessage.Footer.fromObject({ text: null }),
        header: proto.Message.InteractiveMessage.Header.fromObject({
          title: '' + result.title + '\n' + result.url,
          hasMediaAttachment: true,
          videoMessage: await createVideoMessage(result.nowm) // video sin watermark
        }),
        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({ buttons: [] })
      });
    }

    const messageContent = generateWAMessageFromContent(message.chat, {
      viewOnceMessage: {
        message: {
          messageContextInfo: { deviceListMetadata: {}, deviceListMetadataVersion: 2 },
          interactiveMessage: proto.Message.InteractiveMessage.fromObject({
            body: proto.Message.InteractiveMessage.Body.create({}),
            footer: proto.Message.InteractiveMessage.Footer.create({ text: `${e} *Resultados de* ${input}` }),
            header: proto.Message.InteractiveMessage.Header.create({ hasMediaAttachment: false }),
            carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({ cards: [...results] })
          })
        }
      }
    }, { quoted: message });
message.react('✅');
    await conn.relayMessage(message.chat, messageContent.message, { messageId: messageContent.key.id });

  } catch (error) {
    console.error(error);
    conn.reply(message.chat, `${e} *OCURRIÓ UN ERROR:* ${error.message}`, message);
  }
};

handler.command = ["tiktoksearch", "tiktoks", "ttsearch"];
handler.group = true;
export default handler;

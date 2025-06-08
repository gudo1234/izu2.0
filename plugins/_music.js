import fetch from 'node-fetch';

let handler = async (m, { conn, usedPrefix, command, text }) => {

  if (!text) return m.reply(`✐ Ingresa un texto para buscar en YouTube\n> *Ejemplo:* ${usedPrefix + command} ozuna`);

  try {
    let api = await (await fetch(`https://delirius-apiofc.vercel.app/search/ytsearch?q=${text}`)).json();
    let results = api.data[0];

    let txt = `*「✦」 ${results.title}*

> ✦ *Canal* » ${results.author.name}
> ⴵ *Duración:* » ${results.duration}
> ✰ *Vistas:* » ${results.views}
> ✐ *Publicación:* » ${results.publishedAt}
> ❒ *Tamaño:* » ${results.HumanReadable}
> 🜸 *Link:* » ${results.url}`;

    let img = results.image;

    await conn.sendMessage(m.chat, {
      image: { url: img },
      caption: txt
    }, { quoted: m });

    if (command === 'pdoc') {
      // Documento de audio
      let audioRes = await fetch(`https://api.vreden.my.id/api/ytmp3?url=${results.url}`);
      let audioJson = await audioRes.json();

      await conn.sendMessage(m.chat, {
        document: { url: audioJson.result.download.url },
        mimetype: 'audio/mpeg',
        fileName: `${results.title}.mp3`
      }, { quoted: m });

    } else if (command === 'vdoc') {
      // Documento de video
      let videoRes = await fetch(`https://api.vreden.my.id/api/ytmp4?url=${results.url}`);
      let videoJson = await videoRes.json();

      await conn.sendMessage(m.chat, {
        document: { url: videoJson.result.download.url },
        mimetype: 'video/mp4',
        fileName: `${results.title}.mp4`
      }, { quoted: m });
    }

  } catch (e) {
    m.reply(`Error: ${e.message}`);
    m.react('✖️');
  }
};

handler.command = ['pdoc', 'vdoc'];

export default handler;

import fetch from 'node-fetch';

let handler = async(m, { conn, usedPrefix, command, text }) => {

if (!text) return m.reply(`${e} Ingresa Un Texto Para Buscar En Youtube\n> *Ejemplo:* .play diles`);

try {
let api = await (await fetch(`https://delirius-apiofc.vercel.app/search/ytsearch?q=${text}`)).json();

let results = api.data[0];

let txt = `*Titulo:* ${results.title}*

*Canal* ${results.author.name}
*Duración:* ${results.duration}
*Vistas:* ${results.views}
*Publicado:* ${results.publishedAt}
*Tamaño:* ${results.HumanReadable}
*Link* ${results.url} `;

let img = results.image;

conn.sendMessage(m.chat, { image: { url: img }, caption: txt }, { quoted: m });

let api2 = await(await fetch(`https://api.vreden.my.id/api/ytmp3?url=${results.url}`)).json();

// if (!api2?.result?.download.url) return m.reply('No Se  Encontraron Resultados');

await conn.sendMessage(m.chat, { document: { url: api2.result.download.url }, mimetype: 'audio/mpeg', fileName: `${results.title}.mp3` }, { quoted: m });

} catch (e) {
m.reply(`Error: ${e.message}`);
m.react('✖️');
  }
}

handler.command = ['play3', 'yta', 'mp3doc'];

export default handler

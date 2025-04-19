import {googleImage} from '@bochilteam/scraper';
const handler = async (m, {conn, text, usedPrefix, command}) => {
if (!text) return conn.reply(m.chat, `${e} *Ejemplo:* ${usedPrefix + command} Ghostemane`, m)
const res = await googleImage(text);
const image = await res.getRandom();
const link = image;
const messages = [['Imagen 1', wm, await res.getRandom(),
[[]], [[]], [[]], [[]]], ['Imagen 2', wm, await res.getRandom(), [[]], [[]], [[]], [[]]], ['Imagen 3', wm, await res.getRandom(), [[]], [[]], [[]], [[]]], ['Imagen 4', wm, await res.getRandom(), [[]], [[]], [[]], [[]]]]
//await conn.sendCarousel(m.chat, `${e} Resultado de ${text}`, '🔎 Imagen - Descargas', null, messages, m);
conn.sendFile(m.chat, image, 'error.jpg', `${e} ${text}`, m, null, rcanal)
conn.sendFile(m.chat, await res.getRandom(), 'error.jpg', `${e} ${text}`, m, null, rcanal)
};

handler.command = ['image','imagen'];
handler.group = true;
export default handler;

import {googleImage} from '@bochilteam/scraper';
const handler = async (m, {conn, text, usedPrefix, command}) => {
if (!text) return conn.reply(m.chat, `${e} *Ejemplo:* ${usedPrefix + command} Ghostemane`, m)
const res = await googleImage(text);
const image = await res.getRandom();
const link = image;
conn.sendFile(m.chat, await res.getRandom(), 'error.jpg', ``, m, null, rcanal)
conn.sendFile(m.chat, await res.getRandom(), 'error.jpg', ``, m)
conn.sendFile(m.chat, await res.getRandom(), 'error.jpg', ``, m)
conn.sendFile(m.chat, await res.getRandom(), 'error.jpg', ``, m)
conn.sendFile(m.chat, await res.getRandom(), 'error.jpg', ``, m)
conn.sendFile(m.chat, await res.getRandom(), 'error.jpg', ``, m)
conn.sendFile(m.chat, await res.getRandom(), 'error.jpg', ``, m)
conn.sendFile(m.chat, await res.getRandom(), 'error.jpg', ``, m)
conn.sendFile(m.chat, await res.getRandom(), 'error.jpg', ``, m)
conn.sendFile(m.chat, await res.getRandom(), 'error.jpg', ``, m)
};

handler.command = ['image','imagen'];
handler.group = true;
export default handler;

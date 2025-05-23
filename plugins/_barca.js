import moment from 'moment';
import fs from 'fs';
import fetch from 'node-fetch'; // Solo si usas Node <18

const FILE = './.last-news.json';
let cache = {};
try {
  cache = JSON.parse(fs.readFileSync(FILE));
} catch { cache = {}; }

function saveCache() {
  fs.writeFileSync(FILE, JSON.stringify(cache));
}

const chatObjetivo = "120363276692176560@g.us";
const feedUrl = 'https://www.marca.com/rss/futbol.html';
let rssActivado = {};

async function comprobarRSS(conn) {
  try {
    const res = await fetch(feedUrl);
    const xml = await res.text();

    const itemMatch = xml.match(/<item>[\s\S]*?<\/item>/);
    if (!itemMatch) return;

    const item = itemMatch[0];
    const title = (item.match(/<title><!CDATA(.*?)><\/title>/) || [])[1];
    const link = (item.match(/<link>(.*?)<\/link>/) || [])[1];
    const pubDate = (item.match(/<pubDate>(.*?)<\/pubDate>/) || [])[1];

    if (!title || !link || !pubDate) return;

    const fechaPublicacion = moment(new Date(pubDate));
    const ahora = moment();
    const diferenciaMinutos = ahora.diff(fechaPublicacion, 'minutes');

    if (diferenciaMinutos > 30) return;
    if (cache.lastTitle === title) return;

    cache.lastTitle = title;
    saveCache();

    const caption = `*• Nueva noticia de fútbol •*\n
*⤿ Título:* _${title}_
*⤿ Publicado:* _${fechaPublicacion.format("DD/MM/YYYY HH:mm")}_
*⤿ URL:* ${link}\n\n`;

    await conn.sendMessage(chatObjetivo, {
      text: caption.trim()
    });

  } catch (err) {
    console.error('Error al comprobar RSS:', err);
  }
}

let handler = async (m, { conn, command }) => {
  const id = m.chat;

  if (command === 'noti' || command === 'noti on') {
    rssActivado[id] = true;
    return m.reply("Sistema RSS activado. Se notificará la próxima noticia nueva (menos de 30 minutos).");
  }

  if (command === 'noti off') {
    rssActivado[id] = false;
    return m.reply("Sistema RSS desactivado.");
  }
};

handler.before = async (m, { conn }) => {
  const id = m.chat;
  if (rssActivado[id] && id === chatObjetivo) {
    comprobarRSS(conn);
  }
};

handler.command = /^noti(?:\s?(on|off)?)?$/i;
handler.group = true;

export default handler;

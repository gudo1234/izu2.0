import Parser from 'rss-parser';
import moment from 'moment';
import fs from 'fs';

const parser = new Parser();
const FILE = './.last-news.json';
let cache = {};
try {
  cache = JSON.parse(fs.readFileSync(FILE));
} catch { cache = {}; }

function saveCache() {
  fs.writeFileSync(FILE, JSON.stringify(cache));
}

const chatObjetivo = "120363276692176560@g.us";
const feedUrl = 'https://www.marca.com/rss/futbol.html'; // Feed RSS

async function comprobarRSS(conn) {
  try {
    const feed = await parser.parseURL(feedUrl);
    const latest = feed.items[0];
    if (!latest || !latest.title || !latest.pubDate) return;

    const fechaPublicacion = moment(new Date(latest.pubDate));
    const ahora = moment();
    const diferenciaMinutos = ahora.diff(fechaPublicacion, 'minutes');

    if (diferenciaMinutos > 30) return; // Ignorar noticias con más de 30 minutos

    if (cache.lastTitle === latest.title) return; // Ya fue enviada
    cache.lastTitle = latest.title;
    saveCache();

    const caption = `*• Nueva noticia de fútbol •*\n
*⤿ Título:* _${latest.title}_
*⤿ Publicado:* _${fechaPublicacion.format("DD/MM/YYYY HH:mm")}_
*⤿ URL:* ${latest.link}\n\n`;

    await conn.sendMessage(chatObjetivo, {
      text: caption.trim()
    });

  } catch (err) {
    console.error('Error en RSS:', err);
  }
}

let rssActivado = {};

let handler = async (m, { conn }) => {
  const id = m.chat;
  if (!rssActivado[id]) return;

  // Solo ejecutar si el mensaje proviene del grupo objetivo
  if (id === chatObjetivo) {
    comprobarRSS(conn);
  }
};

handler.command = ['noti', 'noti on', 'noti off'];
handler.group = true;

handler.before = async (m, { conn }) => {
  const id = m.chat;
  if (rssActivado[id] && id === chatObjetivo) {
    comprobarRSS(conn);
  }
};

handler.handle = async (m, { conn, command }) => {
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

export default handler;

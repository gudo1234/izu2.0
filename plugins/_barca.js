import fs from 'fs';
import fetch from 'node-fetch'; // Si usas Node <18
import moment from 'moment';

const CACHE_FILE = './.last-news.json';
const STATUS_FILE = './.rss-status.json';

let cache = {};
try { cache = JSON.parse(fs.readFileSync(CACHE_FILE)); } catch { cache = {}; }

let rssStatus = {};
try { rssStatus = JSON.parse(fs.readFileSync(STATUS_FILE)); } catch { rssStatus = {}; }

function saveCache() {
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache));
}

function saveStatus() {
  fs.writeFileSync(STATUS_FILE, JSON.stringify(rssStatus));
}

const feedUrl = 'https://www.marca.com/rss/futbol.html';

async function comprobarRSS(conn, chatId) {
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

    await conn.sendMessage(chatId, {
      text: caption.trim()
    });

  } catch (err) {
    console.error('Error al comprobar RSS:', err);
  }
}

const handler = async (m, { conn, args, command }) => {
  const chatId = m.chat;

  if (command === 'noti') {
    const arg = (args[0] || '').toLowerCase();

    if (arg === 'on') {
      rssStatus[chatId] = true;
      saveStatus();
      return m.reply('Sistema RSS activado. Se notificará la próxima noticia nueva (menos de 30 minutos).');
    }

    if (arg === 'off') {
      rssStatus[chatId] = false;
      saveStatus();
      return m.reply('Sistema RSS desactivado.');
    }

    return m.reply(`Uso: .noti on | .noti off`);
  }
};

handler.before = async (m, { conn }) => {
  const chatId = m.chat;
  if (rssStatus[chatId]) {
    comprobarRSS(conn, chatId);
  }
};

handler.command = /^noti$/i;
handler.group = true;

export default handler;

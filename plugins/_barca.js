import Parser from 'rss-parser';
import moment from 'moment';
import fs from 'fs';

const parser = new Parser();
const FEED_URL = 'https://www.marca.com/rss/futbol.html';
const CACHE_FILE = './.last-news.json';
const CONFIG_FILE = './.noti-config.json';

let cache = {};
let gruposActivos = {};

try { cache = JSON.parse(fs.readFileSync(CACHE_FILE)); } catch { cache = {}; }
try { gruposActivos = JSON.parse(fs.readFileSync(CONFIG_FILE)); } catch { gruposActivos = {}; }

function saveCache() {
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache));
}
function saveConfig() {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(gruposActivos));
}

async function comprobarRSS(conn) {
  try {
    const feed = await parser.parseURL(FEED_URL);
    const latest = feed.items[0];
    if (!latest || !latest.title) return;
    if (cache.lastTitle === latest.title) return;

    cache.lastTitle = latest.title;
    saveCache();

    const caption = `*• Nueva noticia de fútbol •*\n
*⤿ Título:* _${latest.title}_
*⤿ Publicado:* _${moment(latest.pubDate).format("DD/MM/YYYY HH:mm")}_
*⤿ URL:* ${latest.link}\n\n`;

    for (const chatId of Object.keys(gruposActivos)) {
      await conn.sendMessage(chatId, { text: caption.trim() });
    }

  } catch (err) {
    console.error('Error en RSS:', err);
  }
}

// Llamado cada 30 segundos si hay algún grupo activo
setInterval(async () => {
  if (Object.keys(gruposActivos).length > 0 && global.conn) {
    comprobarRSS(global.conn);
  }
}, 30000);

let handler = async (m, { conn, isGroup, command }) => {
  if (!isGroup) return;

  const chatId = m.chat;
  const texto = m.text?.trim().toLowerCase() || '';
  const estado = gruposActivos[chatId] ?? false;
  global.conn = conn; // para que funcione en el setInterval

  if (command === 'noti') {
    if (texto === '.noti on') {
      if (estado) return m.reply('El sistema de noticias ya está *activado*.');
      gruposActivos[chatId] = true;
      saveConfig();
      await m.react('✅');
      return m.reply('El sistema de noticias ha sido *activado* para este grupo.');
    }

    if (texto === '.noti off') {
      if (!estado) return m.reply('El sistema de noticias ya está *desactivado*.');
      delete gruposActivos[chatId];
      saveConfig();
      await m.react('❌');
      return m.reply('El sistema de noticias ha sido *desactivado* para este grupo.');
    }

    return m.reply(`El sistema de noticias está actualmente *${estado ? 'ACTIVADO' : 'DESACTIVADO'}* en este grupo.\nUsa *.noti on* o *.noti off* para cambiar el estado.`);
  }
};

handler.command = ['noti'];
handler.group = true;

export default handler;

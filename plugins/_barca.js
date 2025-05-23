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

async function verificarRSS(conn, chatId) {
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

    await conn.sendMessage(chatId, { text: caption.trim() });

  } catch (err) {
    console.error('Error al verificar RSS:', err);
  }
}

let handler = async (m, { conn, command, args, isGroup }) => {
  if (!isGroup) return;
  const chatId = m.chat;

  // Comando .noti, .noti on, .noti off
  if (command === 'noti') {
    const estado = gruposActivos[chatId] ?? false;

    if (!args.length) {
      return m.reply(`El sistema de noticias está actualmente *${estado ? 'ACTIVADO' : 'DESACTIVADO'}* en este grupo.`);
    }

    if (args[0] === 'on') {
      if (estado) return m.reply('El sistema de noticias ya está *activado*.');
      gruposActivos[chatId] = true;
      saveConfig();
      await m.react('✅');
      return m.reply('El sistema de noticias ha sido *activado* para este grupo.');
    }

    if (args[0] === 'off') {
      if (!estado) return m.reply('El sistema de noticias ya está *desactivado*.');
      delete gruposActivos[chatId];
      saveConfig();
      await m.react('❌');
      return m.reply('El sistema de noticias ha sido *desactivado* para este grupo.');
    }

    return m.reply('Usa `.noti`, `.noti on` o `.noti off`');
  }

  // Comando .notici para verificar manualmente si hay nuevas noticias
  if (command === 'notici') {
    if (!gruposActivos[chatId]) {
      return m.reply('El sistema de noticias no está activado en este grupo. Usa `.noti on` para activarlo.');
    }
    await verificarRSS(conn, chatId);
  }
};

handler.command = ['noti', 'notici'];
handler.group = true;

export default handler;

import fetch from "node-fetch";
import moment from "moment";
import fs from "fs";

const CACHE_FILE = "./.last-news.json";
const CONFIG_FILE = "./.noti-config.json";

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

const temas = [
  { tag: "Barcelona FC", nombre: "FC Barcelona" },
  { tag: "Real Madrid", nombre: "Real Madrid" },
  { tag: "Champions League", nombre: "Champions League" },
  { tag: "Premier League", nombre: "Premier League" },
  { tag: "La Liga", nombre: "La Liga" },
  { tag: "Bundesliga", nombre: "Bundesliga" },
  { tag: "Serie A", nombre: "Serie A Italiana" }
];

async function verificarNoticiaNueva(conn, chatId) {
  const tema = temas[Math.floor(Math.random() * temas.length)];

  try {
    const res = await fetch(`https://newsapi.org/v2/everything?q=${encodeURIComponent(tema.tag)}&sortBy=publishedAt&language=es&apiKey=84baef01e6c640799202a741a11fdedf`);
    const data = await res.json();
    if (!data.articles || !data.articles.length) return;

    const article = data.articles[0];
    if (!article.title) return;

    if (cache[tema.tag] === article.title) return;

    cache[tema.tag] = article.title;
    saveCache();

    const caption = `*• Nueva noticia de ${tema.nombre} •*\n
*⤿ Título:* _${article.title}_
*⤿ Fuente:* _${article.source?.name || "Desconocida"}_
*⤿ Publicado:* _${moment(article.publishedAt).format("DD/MM/YYYY HH:mm")}_
*⤿ URL:* ${article.url}\n\n`;

    let image;
    if (article.urlToImage) {
      const imgRes = await fetch(article.urlToImage);
      if (imgRes.ok) image = await imgRes.buffer();
    }
    if (!image) {
      image = await (await fetch("https://telegra.ph/file/17d0f2946ff10fd130507.jpg")).buffer();
    }

    await conn.sendMessage(chatId, {
      image,
      caption: caption.trim()
    });

  } catch (e) {
    console.error(`[Error en ${tema.nombre}]`, e);
  }
}

// Middleware: cada mensaje en grupo
let handler = async (m, { conn, isGroup }) => {
  if (!isGroup) return;
  const chatId = m.chat;

  if (gruposActivos[chatId]) {
    verificarNoticiaNueva(conn, chatId);
  }
};

// Comando: activar/desactivar noticias
handler.before = async (m, { command, args, conn }) => {
  const chatId = m.chat;
  const isCmd = m.text?.startsWith('.');
  if (!isCmd || !args || !['on', 'off'].includes(args[0])) return;

  if (command === 'noti') {
    const activar = args[0] === 'on';
    gruposActivos[chatId] = activar;
    saveConfig();
    m.reply(`Noticias automáticas *${activar ? 'activadas' : 'desactivadas'}* para este grupo.`);
  }
};

handler.command = ['noti']
handler.group = true;
export default handler;

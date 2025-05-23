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
let handler = async (m, { conn, isGroup, command, args }) => {
  if (!isGroup) return;

  const chatId = m.chat;

  if (command === 'noti') {
    const estado = gruposActivos[chatId] ?? false;

    if (!args.length) {
      return m.reply(`El sistema de noticias está actualmente *${estado ? 'ACTIVADO' : 'DESACTIVADO'}* en este grupo.`);
    }

    if (args[0] === 'on') {
      if (estado) return m.reply('El sistema de noticias ya está *activado*.');
      gruposActivos[chatId] = true;
      saveConfig();
      return m.reply('El sistema de noticias ha sido *activado* para este grupo.');
    }

    if (args[0] === 'off') {
      if (!estado) return m.reply('El sistema de noticias ya está *desactivado*.');
      delete gruposActivos[chatId];
      saveConfig();
      return m.reply('El sistema de noticias ha sido *desactivado* para este grupo.');
    }

    return m.reply('Usa `.noti`, `.noti on` o `.noti off`');
  }

  if (gruposActivos[chatId]) {
    verificarNoticiaNueva(conn, chatId);
  }
};

handler.command = ['noti']
handler.group = true;

export default handler;

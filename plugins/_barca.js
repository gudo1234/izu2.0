import fetch from "node-fetch";
import moment from "moment";
import fs from "fs";

const FILE = "./.last-news.json";
let cache = {};
try {
  cache = JSON.parse(fs.readFileSync(FILE));
} catch { cache = {}; }

function saveCache() {
  fs.writeFileSync(FILE, JSON.stringify(cache));
}

export async function checkFutbolNews(conn, chatId) {
  if (!chatId.endsWith("@g.us")) return; // Solo grupos

  const temas = [
    { tag: "Barcelona FC", nombre: "FC Barcelona" },
    { tag: "Real Madrid", nombre: "Real Madrid" },
    { tag: "Champions League", nombre: "Champions League" },
    { tag: "Premier League", nombre: "Premier League" },
    { tag: "La Liga", nombre: "La Liga" },
    { tag: "Bundesliga", nombre: "Bundesliga" },
    { tag: "Serie A", nombre: "Serie A Italiana" }
  ];

  for (let tema of temas) {
    try {
      const res = await fetch(`https://newsapi.org/v2/everything?q=${encodeURIComponent(tema.tag)}&sortBy=publishedAt&language=es&apiKey=84baef01e6c640799202a741a11fdedf`);
      const data = await res.json();
      if (!data.articles || !data.articles.length) continue;

      const article = data.articles[0];
      if (!article.title || article.title === cache[tema.tag]) continue;

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
      console.error(`[Error ${tema.nombre}]`, e);
    }
  }
}

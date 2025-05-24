import fetch from "node-fetch";
import moment from "moment";

const GRUPO_OBJETIVO = "120363276692176560@g.us"; // ID del grupo
const KEYWORDS = ["barcelona", "real madrid", "champions", "la liga", "fútbol", "futbol", "liga", "ucl", "uefa", "madrid", "barça"];

let handler = async (m, { conn }) => {
  try {
    if (m.chat !== GRUPO_OBJETIVO) return; // Ignora si no es el grupo objetivo
    if (!m.text) return; // Solo reacciona a mensajes con texto

    const res = await fetch("https://newsapi.org/v2/top-headlines?sources=el-mundo&apiKey=84baef01e6c640799202a741a11fdedf");
    const data = await res.json();

    if (!data.articles || !data.articles.length) return;

    // Filtrar noticias de fútbol
    const filtered = data.articles.filter(article => {
      const text = `${article.title || ""} ${article.description || ""}`.toLowerCase();
      return KEYWORDS.some(keyword => text.includes(keyword));
    });

    if (!filtered.length) return; // Si no hay noticias relevantes, no hacer nada

    const limit = 3;
    const articles = filtered.slice(0, limit);

    let txt = `*• 📰 Noticias de Fútbol (El Mundo) •*\n\n`;
    for (let art of articles) {
      txt += `*⤿ Título:* _${art.title || "No disponible"}_
*⤿ Descripción:* _${art.description || "No disponible"}_
*⤿ Publicado:* _${moment(art.publishedAt).format("DD/MM/YYYY HH:mm")}_
*⤿ URL:* ${art.url || "No disponible"}\n\n────────────\n\n`;
    }

    let img;
    const imgURL = articles[0]?.urlToImage;
    if (imgURL) {
      const resImg = await fetch(imgURL);
      if (resImg.ok) {
        img = await resImg.buffer();
      }
    }

    if (!img) {
      img = await (await fetch("https://telegra.ph/file/17d0f2946ff10fd130507.jpg")).buffer();
    }

    await conn.sendMessage(m.chat, {
      image: img,
      caption: txt.trim(),
      headerType: 4
    }, { quoted: m });

  } catch (e) {
    console.error("[NOTICIAS AUTOMÁTICAS ERROR]", e);
  }
};

handler.before = true;
export default handler;

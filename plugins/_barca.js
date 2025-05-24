import fetch from "node-fetch";
import moment from "moment";

// Lista global para controlar en qué grupos está activado
global.gruposNoti ||= {};
global.lastNoti ||= {};

const KEYWORDS = ["barcelona", "real madrid", "champions", "la liga", "fútbol", "futbol", "ucl", "uefa", "madrid", "barça"];
const IMAGE_DEFAULT = "https://telegra.ph/file/17d0f2946ff10fd130507.jpg";
const API_KEY = "84baef01e6c640799202a741a11fdedf";

let handler = async (m, { conn, args, command }) => {
  const id = m.chat;

  // Comando .noti on / .noti off
  if (command === "noti") {
    if (!id.endsWith("@g.us")) {
      return m.reply("Este comando solo funciona en grupos.");
    }

    const estado = (args[0] || "").toLowerCase();
    if (estado === "on") {
      global.gruposNoti[id] = true;
      m.reply("Activadas las noticias automáticas de fútbol para este grupo.");
    } else if (estado === "off") {
      delete global.gruposNoti[id];
      m.reply("Desactivadas las noticias automáticas de fútbol para este grupo.");
    } else {
      const estadoActual = global.gruposNoti[id] ? "activadas" : "desactivadas";
      m.reply(`Actualmente las noticias están *${estadoActual}* para este grupo.\nUsa *.noti on* o *.noti off*.`);
    }
    return;
  }
};

handler.command = ["noti"];
handler.before = async (m, { conn }) => {
  const chatID = m.chat;

  // Solo grupos activados
  if (!global.gruposNoti[chatID]) return;
  if (!m.text || !chatID.endsWith("@g.us")) return;

  const now = Date.now();
  if (global.lastNoti[chatID] && now - global.lastNoti[chatID] < 15 * 60 * 1000) return; // cada 15 min
  global.lastNoti[chatID] = now;

  try {
    const res = await fetch(`https://newsapi.org/v2/top-headlines?sources=el-mundo&apiKey=${API_KEY}`);
    const data = await res.json();

    if (!data.articles?.length) return;

    const filtered = data.articles.filter(article => {
      const text = `${article.title || ""} ${article.description || ""}`.toLowerCase();
      return KEYWORDS.some(k => text.includes(k));
    });

    if (!filtered.length) return;

    const articles = filtered.slice(0, 3);
    let txt = `*• 📰 Noticias de Fútbol (El Mundo) •*\n\n`;
    for (let art of articles) {
      txt += `*⤿ Título:* _${art.title || "No disponible"}_
*⤿ Descripción:* _${art.description || "No disponible"}_
*⤿ Publicado:* _${moment(art.publishedAt).format("DD/MM/YYYY HH:mm")}_
*⤿ URL:* ${art.url || "No disponible"}\n\n────────────\n\n`;
    }

    // Imagen
    let img;
    const imgURL = articles[0]?.urlToImage;
    if (imgURL) {
      const resImg = await fetch(imgURL);
      if (resImg.ok) img = await resImg.buffer();
    }
    if (!img) {
      img = await (await fetch(IMAGE_DEFAULT)).buffer();
    }

    await conn.sendMessage(chatID, {
      image: img,
      caption: txt.trim(),
      headerType: 4
    }, { quoted: m });

  } catch (e) {
    console.error("[ERROR NOTICIAS AUTO]", e);
  }
};

export default handler;

import fetch from "node-fetch";
import moment from "moment";

let handler = async (m, { conn, args }) => {
  try {
    const res = await fetch("https://newsapi.org/v2/top-headlines?sources=el-mundo&apiKey=84baef01e6c640799202a741a11fdedf");
    const data = await res.json();

    if (!data.articles || !data.articles.length) {
      throw "No se encontraron noticias.";
    }

    const limit = Math.min(parseInt(args[0]) || 5, 10);
    const articles = data.articles.slice(0, limit);

    let txt = `*• 🥗 Google News: El Mundo •*\n\n`;
    for (let art of articles) {
      txt += `*⤿ Título:* _${art.title || "No disponible"}_
*⤿ Descripción:* _${art.description || "No disponible"}_
*⤿ Publicado:* _${moment(art.publishedAt).format("DD/MM/YYYY HH:mm")}_
*⤿ URL:* ${art.url || "No disponible"}\n\n────────────\n\n`;
    }

    const img = await (await fetch("https://telegra.ph/file/17d0f2946ff10fd130507.jpg")).buffer();

    await conn.sendMessage(m.chat, {
      image: img,
      caption: txt.trim(),
      headerType: 4
    }, { quoted: m });

  } catch (e) {
    console.error(e);
    m.reply("Ocurrió un error al obtener las noticias. Intenta más tarde.");
  }
};

handler.command = ["googlenews", "noticias"];
export default handler;

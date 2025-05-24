import fetch from "node-fetch";
import moment from "moment";

let handler = async (m, { conn, args, command }) => {
  try {
    let query = args.join(" ").trim();
    let url;
    let titleHeader;
    const maxResults = 10;

    if (!query) {
      // Noticias principales si no hay tema
      url = `https://newsapi.org/v2/top-headlines?sources=el-mundo&apiKey=84baef01e6c640799202a741a11fdedf`;
      titleHeader = "*• 📰 Noticias principales - El Mundo •*\n\n";
    } else {
      // Si se especifica tema (y opcionalmente número de noticias)
      let countMatch = query.match(/\d+$/); // Detecta si al final hay un número
      let count = countMatch ? Math.min(parseInt(countMatch[0]), maxResults) : 5;
      let searchTerm = query.replace(/\d+$/, "").trim();

      url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(searchTerm)}&language=es&pageSize=${count}&apiKey=84baef01e6c640799202a741a11fdedf`;
      titleHeader = `*• 📰 Noticias sobre: ${searchTerm} •*\n\n`;
    }

    const res = await fetch(url);
    const data = await res.json();

    if (!data.articles || !data.articles.length) {
      throw "No se encontraron noticias.";
    }

    const articles = data.articles;

    let txt = titleHeader;
    for (let art of articles) {
      txt += `*⤿ Título:* _${art.title || "No disponible"}_
*⤿ Descripción:* _${art.description || "No disponible"}_
*⤿ Publicado:* _${moment(art.publishedAt).format("DD/MM/YYYY HH:mm")}_
*⤿ URL:* ${art.url || "No disponible"}\n\n────────────\n\n`;
    }

    // Intentar usar la imagen de la primera noticia
    let img;
    const imgURL = data.articles[0]?.urlToImage;
    if (imgURL) {
      const resImg = await fetch(imgURL);
      if (resImg.ok) {
        img = await resImg.buffer();
      }
    }

    // Fallback a imagen por defecto
    if (!img) {
      img = await (await fetch("https://telegra.ph/file/17d0f2946ff10fd130507.jpg")).buffer();
    }

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

handler.command = ["googlenews", "noticias", "notícias", "noticia", "notícia"];
export default handler;

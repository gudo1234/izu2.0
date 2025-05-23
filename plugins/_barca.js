import fetch from "node-fetch";
import moment from "moment";

let handler = async (m, { conn }) => {
  try {
    const res = await fetch("https://newsapi.org/v2/everything?q=Barcelona%20FC&sortBy=publishedAt&language=es&apiKey=84baef01e6c640799202a741a11fdedf");
    const data = await res.json();

    if (!data.articles || !data.articles.length) {
      throw "No se encontró ninguna noticia reciente del FC Barcelona.";
    }

    const article = data.articles[0];

    const caption = `*• Última noticia del FC Barcelona •*\n
*⤿ Título:* _${article.title || "No disponible"}_
*⤿ Fuente:* _${article.source?.name || "Desconocida"}_
*⤿ Publicado:* _${moment(article.publishedAt).format("DD/MM/YYYY HH:mm")}_
*⤿ URL:* ${article.url || "No disponible"}\n\n`;

    const imgUrl = article.urlToImage;
    let image;

    if (imgUrl) {
      const imgRes = await fetch(imgUrl);
      if (!imgRes.ok) throw "No se pudo obtener la imagen de la noticia.";
      image = await imgRes.buffer();
    } else {
      // Imagen por defecto si la noticia no tiene
      image = await (await fetch("https://telegra.ph/file/17d0f2946ff10fd130507.jpg")).buffer();
    }

    await conn.sendMessage(m.chat, {
      image,
      caption: caption.trim()
    }, { quoted: m });

  } catch (e) {
    console.error(e);
    m.reply("Ocurrió un error al obtener la noticia del Barcelona. Intenta más tarde.");
  }
};

handler.command = ["barçanews", "noticiabarcelona", "barcelona"];
export default handler;

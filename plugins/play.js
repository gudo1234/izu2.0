import fetch from "node-fetch";
import yts from "yt-search";

const API_URL = "https://api.vreden.web.id/api/ytmp3";

const fetchWithRetries = async (url, maxRetries = 2) => {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data?.status === 200 && data.result?.download?.url) {
        return data.result;
      }
    } catch (error) {
      console.error(`Intento ${attempt + 1} fallido:`, error.message);
    }
  }
  throw new Error("No se pudo obtener la música después de varios intentos.");
};

let handler = async (m, { conn, text }) => {
  if (!text || !text.trim()) {
    return conn.sendMessage(m.chat, {
      text: `${e} Ingresa el nombre de la música a descargar.*\n\n*Ejemplo:* `.play diles`,
    });
  }

  try {
    await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

    const searchResults = await yts(text.trim());
    const video = searchResults.videos[0];
    if (!video) throw new Error("No se encontraron resultados.");

    const apiUrl = `${API_URL}?url=${encodeURIComponent(video.url)}`;
    const apiData = await fetchWithRetries(apiUrl);

    await conn.sendMessage(m.chat, {
      image: { url: video.thumbnail },
      caption: `${e} *Descargando ${video.title}*

Canal *${video.author.name}*
*Vistas:* ${video.views}
*Duración:*  ${video.timestamp}
*Autor:* ${video.author.name}`,
    });

    // Convertir duración a minutos
    const durationParts = video.timestamp.split(":").map(Number);
    const durationInMinutes = durationParts.length === 3
      ? durationParts[0] * 60 + durationParts[1]
      : parseInt(durationParts[0]);

    const audioMessage = {
      [durationInMinutes > 10 ? 'document' : 'audio']: { url: apiData.download.url },
      mimetype: "audio/mpeg",
      fileName: `${video.title}.mp3`,
    };
// para audio🗿
    if (command === 'play' || command === 'yta' || command === 'mp3') {
    await conn.sendMessage(m.chat, audioMessage, { quoted: m });
    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
 
// para docAudio📃
} else if (command === 'play3' || command === 'ytadoc' || command === 'playdoc' || command === 'ytmp3doc') {
await conn.sendMessage(m.chat, { document: { url: null }, mimetype: "audio/mpeg", fileName: `${video.title}`, caption: `${e} Aqui tienes tu audio` }, { quoted: m });

// Para video🗿
    } else if (command === 'play2' || command === 'ytv' || command === 'mp4') {
  await conn.sendMessage(m.chat, {
              video: { url: null },
              fileName: `${video.title}`,
              mimetype: 'video/mp4',
              caption: `${e} Aqui tienes tu video`,
              thumbnail: null
            }, { quoted: m });
  
  // Para docVideo🗿
    } else if (command === 'play4' || command === 'ytvdoc' || command === 'play2doc' || command === 'ytmp4doc') {
await conn.sendMessage(m.chat, {
              document: { url: null },
              fileName: `${video.title}`,
              mimetype: 'video/mp4',
              caption: `${e} Aqui tienes tu docVideo`,
              thumbnail: null
            }, { quoted: m });
   }
  } catch (error) {
    console.error("Error:", error);
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    await conn.sendMessage(m.chat, {
      text: `❌ *Error al procesar tu solicitud:*\n${error.message || "Error desconocido"}`,
    });
  }
};

handler.command = handler.help = ['play', 'play2', 'mp3', 'yta', 'mp4', 'ytv', 'play3', 'ytadoc', 'playdoc', 'ytmp3doc', 'play4', 'ytvdoc', 'play2doc', 'ytmp4doc'];

export default handler;

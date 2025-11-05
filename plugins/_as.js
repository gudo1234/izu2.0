import fs from "fs";
import path from "path";
import yts from "yt-search";
import ytDlp from "yt-dlp-exec"; // aquí importamos el ejecutable

const handler = async (m, { conn, args, usedPrefix, command }) => {
  try {
    if (!args || !args.length)
      return conn.sendMessage(m.chat, { text: `🎵 Uso: ${usedPrefix + command} <nombre o link>` }, { quoted: m });

    const query = args.join(" ");
    const search = await yts(query);
    if (!search.videos.length) return conn.sendMessage(m.chat, { text: "❌ No se encontraron resultados." }, { quoted: m });

    const video = search.videos[0];
    const url = video.url;

    await conn.sendMessage(
      m.chat,
      { text: `⬇️ Descargando audio de *${video.title}*...` },
      { quoted: m }
    );

    const tmpDir = path.join(process.cwd(), "tmp");
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

    const filepath = path.join(tmpDir, `${Date.now()}.mp3`);

    // Usamos yt-dlp-exec directamente
    await ytDlp(url, {
      extractAudio: true,
      audioFormat: "mp3",
      output: filepath
    });

    const buffer = fs.readFileSync(filepath);
    await conn.sendMessage(
      m.chat,
      { audio: buffer, mimetype: "audio/mpeg", fileName: `${video.title}.mp3`, caption: `✅ Descarga lista\n🎧 ${video.title}` },
      { quoted: m }
    );

    fs.unlinkSync(filepath);

  } catch (e) {
    console.error("[play] excepción:", e);
    await conn.sendMessage(m.chat, { text: "⚠️ Ocurrió un error descargando el audio." }, { quoted: m });
  }
};

handler.command = ["po"];

export default handler;

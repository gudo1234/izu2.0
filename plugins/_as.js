import { exec } from "child_process";
import yts from "yt-search";
import { Readable } from "stream";

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

    // Usar yt-dlp para mandar audio a stdout
    const cmd = `yt-dlp -x --audio-format mp3 -o - "${url}"`;

    exec(cmd, { encoding: "buffer", maxBuffer: 1024 * 1024 * 100 }, async (err, stdout, stderr) => {
      if (err) {
        console.error("yt-dlp error:", err, stderr.toString());
        return conn.sendMessage(m.chat, { text: "❌ Error descargando el audio." }, { quoted: m });
      }

      // Convertimos stdout a Readable stream
      const audioStream = Readable.from(stdout);

      await conn.sendMessage(
        m.chat,
        { audio: audioStream, mimetype: "audio/mpeg", fileName: `${video.title}.mp3` },
        { quoted: m }
      );
    });

  } catch (e) {
    console.error(e);
    await conn.sendMessage(m.chat, { text: "⚠️ Ocurrió un error ejecutando el comando." }, { quoted: m });
  }
};

handler.command = ["pa"];
export default handler;

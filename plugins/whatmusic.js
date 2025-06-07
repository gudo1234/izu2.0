import acrcloud from "acrcloud"
import fetch from "node-fetch"

const acr = new acrcloud({
   host: "identify-ap-southeast-1.acrcloud.com",
   access_key: "ee1b81b47cf98cd73a0072a761558ab1",
   access_secret: "ya9OPe8onFAnNkyf9xMTK8qRyMGmsghfuHrIMmUI"
})

let handler = async (m, { conn, usedPrefix, command }) => {
   // 📌 Revisa si hay multimedia directo o citado
   const quoted = m.quoted || {};
   const msg = m.message || {};
   const quotedMsg = quoted.message || {};

   // Verifica si hay un tipo multimedia válido
   const mediaMsg = quotedMsg.audioMessage || quotedMsg.videoMessage
                  || msg.audioMessage || msg.videoMessage;

   if (!mediaMsg) {
      return m.reply(`🔍 Por favor, responde a un *audio* o adjunta un *video corto* junto con el comando:\n\n➤ *${usedPrefix + command}*`)
   }

   try {
      m.react('🎵');

      const buffer = await (m.quoted ? m.quoted.download() : m.download());
      const data = await recognizeSong(buffer);

      if (!data.length) return m.reply("❌ No se pudo identificar la canción. Intenta con otra parte del audio.");

      let caption = `🎧 *Resultado de búsqueda musical*\n\n`;
      for (const song of data) {
         caption += `🎼 *Título:* ${song.title}\n`;
         caption += `🎤 *Artista:* ${song.artist}\n`;
         caption += `⏱️ *Duración:* ${song.duration}\n`;
         if (song.url.length) {
            caption += `🔗 *Enlaces:* ${song.url.join("\n")}\n`;
         }
         caption += "\n";
      }

      await conn.sendMessage(m.chat, {
         text: caption.trim(),
         contextInfo: {
            externalAdReply: {
               title: wm,
               body: textbot,
               thumbnail: await (await fetch(icono)).buffer(),
               thumbnailUrl: redes,
               mediaType: 1,
               renderLargerThumbnail: true,
               sourceUrl: redes
            }
         }
      }, { quoted: m });

      m.react('✅');
   } catch (err) {
      console.error(err);
      m.reply("⚠️ Ocurrió un error al analizar el archivo. Intenta con otro audio/video.");
   }
}

handler.command = ["whatmusic", "quemusica", "shazam"]
handler.group = true // o true si lo quieres restringir
export default handler

// 🎵 Reconocimiento con ACRCloud
async function recognizeSong(buffer) {
   const result = await acr.identify(buffer);
   const musicList = result?.metadata?.music;
   if (!musicList?.length) return [];

   return musicList.map(track => ({
      title: track.title,
      artist: track.artists?.[0]?.name || "Desconocido",
      duration: msToTime(track.duration_ms),
      url: [
         track.external_metadata?.youtube?.vid ? `https://youtu.be/${track.external_metadata.youtube.vid}` : null,
         track.external_metadata?.deezer?.track?.id ? `https://www.deezer.com/track/${track.external_metadata.deezer.track.id}` : null,
         track.external_metadata?.spotify?.track?.id ? `https://open.spotify.com/track/${track.external_metadata.spotify.track.id}` : null
      ].filter(Boolean)
   }))
}

function msToTime(ms) {
   let minutes = Math.floor(ms / 60000);
   let seconds = Math.floor((ms % 60000) / 1000);
   return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

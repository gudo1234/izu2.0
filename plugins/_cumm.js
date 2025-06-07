import acrcloud from "acrcloud"
import fetch from "node-fetch"
import youtubedl from 'youtubedl-core'
import youtubedlv2 from 'youtubedl-core/lib/youtubedlv2.js'
import { fromBuffer } from 'file-type'

const acr = new acrcloud({
  host: "identify-ap-southeast-1.acrcloud.com",
  access_key: "ee1b81b47cf98cd73a0072a761558ab1",
  access_secret: "ya9OPe8onFAnNkyf9xMTK8qRyMGmsghfuHrIMmUI"
})

let handler = async (m, { conn, usedPrefix, command }) => {
  const media = m.quoted || m;
  const mime = (media.msg || media).mimetype || '';
  const isVideo = media.mtype === 'videoMessage';
  const isAudio = mime.includes('audio');

  if (!isVideo && !isAudio)
    return m.reply(`🔍 Por favor, responde a un *audio* o adjunta un *video corto* junto con el comando:\n\n➤ *${usedPrefix + command}*`);

  try {
    m.react('🎵');
    const buffer = await media.download();
    const data = await recognizeSong(buffer);

    if (!data.length)
      return m.reply("❌ No se pudo identificar la canción. Intenta con otra parte del audio.");

    let caption = `🎧 *Resultado de búsqueda musical*\n\n`;
    let youtubeUrl = null;

    for (const song of data) {
      caption += `🎼 *Título:* ${song.title}\n`;
      caption += `🎤 *Artista:* ${song.artist}\n`;
      caption += `⏱️ *Duración:* ${song.duration}\n`;
      if (song.url.length) {
        caption += `🔗 *Enlaces:* ${song.url.join("\n")}\n`;
        const yt = song.url.find(u => u.includes("youtu"));
        if (yt && !youtubeUrl) youtubeUrl = yt;
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

    // Descargar y enviar el audio si hay URL de YouTube
    if (youtubeUrl) {
      m.react('⏬');
      try {
        const info = await youtubedlv2.getInfo(youtubeUrl);
        const format = youtubedl.chooseFormat(info.formats, { quality: 'highestaudio' });
        const res = await fetch(format.url);
        const audioBuffer = await res.buffer();
        const fileType = await fromBuffer(audioBuffer);

        await conn.sendMessage(m.chat, {
          document: audioBuffer,
          mimetype: fileType?.mime || 'audio/mpeg',
          fileName: `${info.videoDetails.title}.mp3`
        }, { quoted: m });
        m.react('✅');
      } catch (e) {
        console.error('[ERROR YOUTUBE AUDIO]', e);
        m.reply('⚠️ No se pudo obtener el audio desde YouTube.');
        m.react('❌');
      }
    } else {
      m.react('✅');
    }
  } catch (err) {
    console.error(err);
    m.reply("⚠️ Ocurrió un error al analizar el archivo. Intenta con otro audio/video.");
    m.react('❌');
  }
};

handler.command = ["cumm"];
handler.group = true;
export default handler;

// Función que llama a ACRCloud y organiza los resultados
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

import { downloadTrack } from 'sanzy-spotifydl';
import { Spotify } from 'fluid-spotify.js';
import fetch from 'node-fetch';

const handler = async (m, { conn, text }) => {
  if (!text) throw 'Por favor, proporciona la URL de una playlist de Spotify.';

  const match = text.match(/https?:\/\/open\.spotify\.com\/playlist\/([a-zA-Z0-9]+)/i);
  if (!match) throw 'URL de playlist no válida. Asegúrate de que sea del tipo https://open.spotify.com/playlist/ID';

  try {
    await m.react('🎧');
    const playlistId = match[1];

    const spotify = new Spotify({
      clientID: '7fb26a02133d463da465671222b9f19b',
      clientSecret: 'd4e6f8668f414bb6a668cc5c94079ca1',
    });

    const playlist = await spotify.getPlaylist(playlistId);
    const tracks = playlist.tracks.items;
    const img = await (await fetch(playlist.images[0].url)).buffer();

    let infoMsg = `🎶 *Playlist Encontrada*\n\n`;
    infoMsg += `📌 *Nombre:* ${playlist.name}\n`;
    infoMsg += `🎵 *Canciones:* ${tracks.length}\n`;
    infoMsg += `📤 Enviando audios...\n`;

    await conn.sendMessage(m.chat, {
      text: infoMsg.trim(),
      contextInfo: {
        forwardingScore: 9999,
        isForwarded: true,
        externalAdReply: {
          title: playlist.name,
          mediaType: 1,
          renderLargerThumbnail: true,
          thumbnail: img,
          sourceUrl: playlist.external_urls.spotify,
        },
      },
    }, { quoted: m });

    // Si hay más de 20 canciones, envía al privado
    let target = (m.isGroup && tracks.length > 20) ? m.sender : m.chat;

    for (let i = 0; i < tracks.length; i++) {
      try {
        const url = tracks[i]?.track?.external_urls?.spotify;
        if (!url) continue;
        const track = await downloadTrack(url);
        await conn.sendMessage(target, {
          audio: track.audioBuffer,
          fileName: `${track.title}.mp3`,
          mimetype: 'audio/mpeg',
        }, { quoted: m });
      } catch (e) {
        console.error(`Error al descargar pista ${i + 1}:`, e.message);
      }
    }

    await m.react('✅');
  } catch (err) {
    console.error(err);
    await m.react('❌');
    throw '❌ Ocurrió un error al procesar la playlist.';
  }
};

handler.command = ['playlist']
handler.group = true;
export default handler;

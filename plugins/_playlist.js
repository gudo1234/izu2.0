import axios from 'axios';

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text || !text.includes('list=')) {
    return m.reply(`📂 Usa el comando correctamente:\n\nEjemplo:\n${usedPrefix}${command} https://youtube.com/playlist?list=PLRW7iEDD9RDRv8EQ3AO-CUqmKfEkaYQ2M`);
  }

  await m.react('🔎');

  const apis = [
    `https://api.siputzx.my.id/api/yt/playlist?url=${encodeURIComponent(text)}`,
    `https://api.vreden.my.id/api/ytplaylist?url=${encodeURIComponent(text)}`
  ];

  let videos = [];

  for (const api of apis) {
    try {
      const r = await axios.get(api);
      const list = r.data?.data || r.data?.result || [];
      if (list.length) {
        videos = list;
        break;
      }
    } catch {}
  }

  if (!videos.length) return m.reply('❌ No se encontraron videos en la playlist.');

  for (const video of videos) {
    try {
      const { title, url, duration } = video;

      const audioApis = [
        `https://api.siputzx.my.id/api/d/ytmp3?url=${encodeURIComponent(url)}`,
        `https://api.vreden.my.id/api/ytmp3?url=${encodeURIComponent(url)}`
      ];

      let dl = null;

      for (const api of audioApis) {
        try {
          const r = await axios.get(api);
          if (r.data?.data?.dl) {
            dl = {
              url: r.data.data.dl,
              duration: r.data.data.duration,
              size: r.data.data.size
            };
            break;
          } else if (r.data?.result?.download?.url) {
            dl = {
              url: r.data.result.download.url,
              duration: r.data.result.duration,
              size: r.data.result.size
            };
            break;
          }
        } catch {}
      }

      if (!dl || !dl.url) continue;

      const durMin = parseFloat((dl.duration || '0:0').split(':')[0]) || 0;
      const isDoc = durMin >= 15;

      await conn.sendMessage(m.chat, {
        audio: { url: dl.url },
        fileName: `${title}.mp3`,
        mimetype: 'audio/mpeg',
        ...(isDoc ? { document: true } : {})
      }, { quoted: m });

      await new Promise(r => setTimeout(r, 3000));
    } catch {}
  }

  await m.react('✅');
};

handler.command = ['playlist'];
export default handler;

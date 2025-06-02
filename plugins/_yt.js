import fetch from 'node-fetch';
import yts from 'yt-search';

const handler = async (m, { conn, args }) => {
  if (!args[0]) {
    return m.reply('❌ Masukkan link YouTube atau judul video!');
  }

  let videoUrl;
  const ytRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{11})/;
  const match = args[0].match(ytRegex);

  if (match) {
    // Si es enlace válido de YouTube
    videoUrl = `https://www.youtube.com/watch?v=${match[1]}`;
  } else {
    // Si es texto, usar yt-search para obtener el primer resultado
    try {
      const search = await yts(args.join(' '));
      const video = search.videos[0];
      if (!video) return m.reply('⚠️ Tidak dapat menemukan video dengan kata kunci tersebut.');
      videoUrl = video.url;
    } catch (err) {
      console.error(err);
      return m.reply('❌ Terjadi kesalahan saat mencari video!');
    }
  }

  try {
    const apiUrl = `https://velyn.biz.id/api/downloader/ytmp4v2?url=${encodeURIComponent(videoUrl)}`;
    const res = await fetch(apiUrl);

    if (!res.ok) throw new Error(`Gagal mengambil data dari API! (Status: ${res.status})`);

    const json = await res.json();

    if (!json.status || !json.data) {
      return m.reply('⚠️ Gagal mengambil data video. Coba lagi nanti.');
    }

    const { basicInfo, advancedInfo } = json.data;
    const { title, duration, views, uploaded, author, thumbnail } = basicInfo;
    const { videoMp4, size } = advancedInfo;

    if (!videoMp4) {
      return m.reply('❌ Video tidak tersedia atau tidak dapat diunduh!');
    }

    const caption = `🎬 *YouTube Video Download*\n\n📌 *Judul:* ${title}\n⏳ *Durasi:* ${duration}\n👀 *Views:* ${views}\n📆 *Uploaded:* ${uploaded}\n🎥 *Channel:* ${author.name}\n🔗 *Channel URL:* ${author.url}\n📦 *Ukuran:* ${size}\n\n⏳ *Sedang mengirim video...*`;

    await conn.sendFile(m.chat, thumbnail, 'thumbnail.jpg', caption, m);
    await conn.sendFile(m.chat, videoMp4, `${title}.mp4`, `🎥 *${title}*`, m);
  } catch (e) {
    console.error(e);
    m.reply(`❌ Terjadi kesalahan saat mengambil video!\n\n📝 Error: ${e.message}`);
  }
};

handler.command = ['ytmp4v2'];
handler.group = true;
export default handler;

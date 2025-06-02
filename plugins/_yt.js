import fetch from 'node-fetch';

const handler = async (m, { conn, args }) => {
  if (!args[0]) {
    return m.reply('❌ Masukkan link YouTube yang valid!');
  }

  if (!/^https?:\/\/(www\.)?youtube\.com\/watch\?v=/.test(args[0])) {
    return m.reply('⚠️ Link yang diberikan bukan link video YouTube yang valid!');
  }

  try {
    const url = `https://velyn.biz.id/api/downloader/ytmp4v2?url=${encodeURIComponent(args[0])}`;
    const res = await fetch(url);

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

handler.command = ['ytmp4v2']
handler.group = true;
export default handler;

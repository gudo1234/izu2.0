import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const prefix = usedPrefix || '.';
  const cmd = command || 'ghibli';

  if (!text) {
    return m.reply(`Contoh:\n${prefix + cmd} cewek sedang duduk di taman`);
  }

  await m.reply('⏳ owteweii...');

  try {
    const api = `https://velyn.biz.id/api/ai/prompt2ghibli?prompt=${encodeURIComponent(text)}&apikey=velyns`;
    let res = await fetch(api);

    if (!res.ok) throw 'Gagal mengunduh gambar';

    let buffer = await res.buffer();
    let filename = 'ghibli.jpg';

    await conn.sendFile(m.chat, buffer, filename, `🎨 Prompt: *${text}*`, m);
  } catch (err) {
    console.error(err);
    m.reply('❌ Gagal generate gambar Ghibli.');
  }
};

handler.command = ['ghibli']

export default handler;

import Starlights from '@StarlightsTeam/Scraper';

const handler = async (m, { conn }) => {
  const tiktokRegex = /(?:https?:\/\/)?(?:www\.)?(?:vt\.tiktok\.com|tiktok\.com)\/[^\s]+/gi;
  const match = m.text.match(tiktokRegex);
  if (!match) return;

  await m.react('🕒');

  try {
    const url = match[0];
    const result = await Starlights.tiktokdl(url);
    const dl_url = result.dl_url;

    let txt = `╭───── • ─────╮\n`;
    txt += `  𖤐 \`TIKTOK EXTRACTOR\` 𖤐\n`;
    txt += `╰───── • ─────╯\n\n`;

    txt += `✦ *Título* : ${result.title}\n`;
    txt += `✦ *Autor* : ${result.author}\n`;
    txt += `✦ *Duración* : ${result.duration} segundos\n`;
    txt += `✦ *Vistas* : ${result.views}\n`;
    txt += `✦ *Likes* : ${result.likes}\n`;
    txt += `✦ *Comentarios* : ${result.comment || result.comments_count}\n`;
    txt += `✦ *Compartidos* : ${result.share || result.share_count}\n`;
    txt += `✦ *Publicado* : ${result.published}\n`;
    txt += `✦ *Descargas* : ${result.downloads || result.download_count}\n\n`;

    txt += `╭───── • ─────╮\n`;
    txt += `> *${global.textbot || 'Bot'}*\n`;
    txt += `╰───── • ─────╯\n`;

    await m.react('✅');
    await conn.sendFile(m.chat, dl_url, 'tiktok.mp4', txt, m);

  } catch (err) {
    console.error(err);
    await conn.sendMessage(m.chat, {
      text: `❌ Ocurrió un error al procesar el video.`
    }, { quoted: m });
  }
};

handler.customPrefix = /(?:https?:\/\/)?(?:www\.)?(?:vt\.tiktok\.com|tiktok\.com)\/[^\s]+/i;
handler.command = new RegExp // sin comandos explícitos
handler.group = true;
export default handler;

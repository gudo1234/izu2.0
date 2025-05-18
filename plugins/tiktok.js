import Starlights from '@StarlightsTeam/Scraper';

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return conn.reply(m.chat, `${e} Usa el comando correctamente:\n\n📌 Ejemplo:\n*${usedPrefix + command}* La Vaca Lola\n*${usedPrefix + command}* https://vt.tiktok.com/ZShhtdsRh/` , m)
  }

  await m.react('🕒');

try {
  let result, dl_url;

  if (/(^|\s)(https?:\/\/)?(www\.)?(vt\.)?tiktok\.com\/[^\s]+/i.test(text)) {
    result = await Starlights.tiktokdl(text);
  } else {
    result = await Starlights.tiktokvid(text);
  }

  dl_url = result.dl_url;

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
  await conn.sendFile(m.chat, dl_url, 'tiktok.mp4', txt, m, null, rcanal);

} catch (err) {
  console.error(err);
  await conn.sendMessage(m.chat, {
    text: `❌ Ocurrió un error al procesar el video.`
  }, { quoted: m });
}
};

handler.command = ['t', 'tiktokvid', 'tiktoksearch', 'tiktokdl', 'ttvid', 'tt', 'tiktok'];
handler.group = true;
export default handler;

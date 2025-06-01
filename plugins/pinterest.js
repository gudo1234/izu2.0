import Starlights from '@StarlightsTeam/Scraper';

const pinterestRegex = /(?:https?:\/\/)?(?:[a-z]+\.)?pinterest\.(?:com|[a-z]{2})(?:\.[a-z]{2})?(?:\/(pin|board|.+?))\/[^\s]+/i;

let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args[0] || !pinterestRegex.test(args[0])) {
    return conn.reply(
      m.chat,
      `🚩 Ingrese un enlace válido de Pinterest\n\nEjemplo:\n> *${usedPrefix + command}* https://ar.pinterest.com/pin/588142032613788991/`,
      m
    );
  }

  await m.react('🕓');
  try {
    let { dl_url, quality, size, duration, url } = await Starlights.pinterestdl(args[0]);

    let txt = '`乂  P I N T E R E S T  -  D L`\n\n';
    txt += `  ✩   *Calidad* : ${quality}\n`;
    txt += `  ✩   *Tamaño* : ${size}\n`;
    txt += `  ✩   *Duracion* : ${duration}\n`;
    txt += `  ✩   *Url* : ${url}\n\n`;
    txt += `> 🚩 *${textbot}*`;

    await conn.sendMessage(
      m.chat,
      {
        video: { url: dl_url },
        caption: txt,
        mimetype: 'video/mp4',
        fileName: `pinterest.mp4`,
      },
      { quoted: m }
    );
    await m.react('✅');
  } catch (e) {
    await m.react('✖️');
  }
};

handler.command = ['pinterestdl', 'pindl', 'pin'];
handler.group = true;

export default handler;

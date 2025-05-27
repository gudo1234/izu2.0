import { igdl } from 'ruhend-scraper';

const handler = async (m, { args, conn }) => {
  if (!args[0]) {
    return conn.reply(m.chat, `${emoji} Por favor, ingresa un enlace de Instagram.`, m, null, rcanal);
  }

  try {
    await m.react(rwait);
    const res = await igdl(args[0]);
    const data = res.data;

    for (let media of data) {
      await conn.sendFile(m.chat, media.url, 'instagram.mp4', `${e} _Video de Instagram_`, m, null, rcanal);
    await m.react(done);
    }
  } catch (e) {
    return conn.reply(m.chat, `${msm} Ocurrió un error.`, m);
    await m.react(error);
  }
};

handler.command = ['instagram', 'ig'];
handler.group = true;

export default handler;

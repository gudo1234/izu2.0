import { igdl } from 'ruhend-scraper'

const handler = async (m, { text, conn, args }) => {
  if (!args[0]) {
    return conn.reply(m.chat, `${e} Por favor, ingresa un enlace de Facebook.`, m)
  }

  let res;
  try {
    await m.react(rwait);
    res = await igdl(args[0]);
  } catch (e) {
    return conn.reply(m.chat, `${msm} Error al obtener datos. Verifica el enlace.`, m)
  }

  let result = res.data;
  if (!result || result.length === 0) {
    return conn.reply(m.chat, `${e} No se encontraron resultados.`, m)
  }

  let data;
  try {
    data = result.find(i => i.resolution === "720p (HD)") || result.find(i => i.resolution === "360p (SD)");
  } catch (e) {
    return conn.reply(m.chat, `${msm} Error al procesar los datos.`, m)
  }

  if (!data) {
    return conn.reply(m.chat, `${e} No se encontró una resolución adecuada.`, m)
  }

  let video = data.url;
  try {
  await conn.sendFile(m.chat, video, `thumbnail.mp4`, `${e} Video de facebook`, m, null, rcanal)
  
    await m.react(done);
  } catch (e) {
    return conn.reply(m.chat, `${msm} Error al enviar el video.`, m)
    await m.react(error);
  }
}

handler.command = ['facebook', 'fb']
handler.group = true;

export default handler

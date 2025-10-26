import {googleImage} from '@bochilteam/scraper';
const handler = async (m, {conn, text, usedPrefix, command}) => {
  if (!text) throw `*🂱 Uso Correcto: ${usedPrefix + command} HuTao*`;
  m.react('🕒')
  const res = await googleImage(text);
  const image = await res.getRandom();
  const link = image;
  conn.sendFile(m.chat, link, 'error.jpg', `*🔎 Resultado De: ${text}*\n> ${textbot}`, m);
};
handler.command = ['image','imagen'];
handler.group = true;
export default handler;

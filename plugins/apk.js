import {search, download} from 'aptoide-scraper';
const handler = async (m, {conn, usedPrefix: prefix, command, text}) => {
 conn.reply(m.chat, `${e} *Ejemplo:* .${command}facebook`, m)
  try {    
    const searchA = await search(text);
    const data5 = await download(searchA[0].id);
    let response = `📲 Descargar aplicaciones 📲\n\n📌 *Nombre de la aplicación:* ${data5.name}\n📦 *Paquete:* ${data5.package}\n🕒 *Número de actualización:* ${data5.lastup}\n📥 *Tamaño de la aplicación:* ${data5.size}‎‏`
    await conn.sendMessage(m.chat, {image: {url: data5.icon}, caption: response}, {quoted: m});
 if (data5.size.includes('GB') || data5.size.replace(' MB', '') > 999) {
      return await conn.sendMessage(m.chat, {text: `${e} El archivo es demasiado grande, por lo que no se enviará.`}, {quoted: m});
    }
    await conn.sendMessage(m.chat, {document: {url: data5.dllink}, mimetype: 'application/vnd.android.package-archive', fileName: data5.name + '.apk', caption: null}, {quoted: m});
  } catch {
    throw `${e} *Error, no se encontraron resultados para tu búsqueda.*`;
  }    
};
handler.command = ["apk","aplicación"]
handler.group = true;

export default handler;

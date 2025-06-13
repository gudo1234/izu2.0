import { search, download } from 'aptoide-scraper';

const handler = async (m, { conn, usedPrefix: prefix, command, text }) => {
  if (!text) return conn.reply(m.chat, `${e} Por favor, ingresa el nombre de la aplicación para descargarla.`, m);
  await m.react('🕒');
  try {
    const searchA = await search(text);
    if (searchA.length === 0) {
      await m.react('❌');  
      return conn.reply(m.chat, `${e} *No se encontraron resultados para tu búsqueda.*`, m);
    }

    const data5 = await download(searchA[0].id);
    let response = `╭────── ⋆⋅☆⋅⋆ ──────╮\n𖤐 \`APK EXTRACTOR\` 𖤐\n╰────── ⋆⋅☆⋅⋆ ──────╯\n\n✦ *Nombre:* ${data5.name}\n✦ *Paquete:* ${data5.package}\n✦ *Última actualización:* ${data5.lastup}\n✦ *Tamaño de la aplicación:* ${data5.size}`;
await conn.sendFile(m.chat, data5.icon, "Thumbnail.jpg", response, m, null, rcanal)
    if (data5.size.includes('GB') ||
      parseInt(data5.size.replace(' MB', ''), 10) > 999) {
      return await conn.sendMessage(m.chat, { text: `${e} El archivo es demasiado grande, por lo que no se enviará.` }, { quoted: m });
    }

    await conn.sendMessage(m.chat, { document: { url: data5.dllink }, mimetype: 'application/vnd.android.package-archive', fileName: data5.name + '.apk' }, { quoted: m });
    await m.react('✅');  

  } catch (error) {
    console.error(error);
    await m.react('❌');  
    conn.reply(m.chat, `${e} *Error, no se encontraron resultados para tu búsqueda.*`, m);
  }
};

handler.command = ['apk', 'aplicacion'];
handler.group = true;

export default handler;

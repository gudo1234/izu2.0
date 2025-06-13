import fetch from 'node-fetch';
import { format } from 'util';

let handler = async (m, { text, conn }) => {
  if (!/^https?:\/\//.test(text)) return conn.reply(m.chat, 'Ejemplo:\nhttps://ejemplo.com', m);
  m.react('🕒')
  let res = await fetch(text);
  
  if (res.headers.get('content-length') > 100 * 1024 * 1024 * 1024) {
    return m.reply(`Content-Length: ${res.headers.get('content-length')}`);
  }

  let contentType = res.headers.get('content-type') || '';
  
  if (/text|json/.test(contentType)) {
    let txt = await res.buffer();
    try {
      txt = format(JSON.parse(txt.toString()));
    } catch (e) {
      txt = txt.toString();
    } finally {
      m.reply(txt.slice(0, 65536) + '');
    }
  } else if (text.toLowerCase().endsWith('.mp4') && contentType.startsWith('video')) {
    //Descarga el video en un buffer antes de mandarlo
    m.react('✅')
    let buffer = await res.buffer();

    return conn.sendFile(m.chat, buffer, 'video.mp4', text, m, null, rcanal, false, { mimetype: 'video/mp4' });
  } else {
    let buffer = await res.buffer();

    return conn.sendFile(m.chat, buffer, 'file', text, m, null, rcanal);
  }
}

handler.command = ['fetch', 'get'];
handler.group = true;

export default handler;

global.APIs = {};
global.APIKeys = {};

global.API = (name, path = "/", query = {}, apikeyqueryname) =>
  (name in global.APIs ? global.APIs[name] : name) + 
  path + 
  (query ? "?" + new URLSearchParams({ 
    ...query, 
    ...(apikeyqueryname ? { [apikeyqueryname]: global.APIKeys[name] } : {}) 
 }) : "");

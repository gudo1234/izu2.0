import fetch from 'node-fetch';
import { format } from 'util';

let handler = async (m, { conn, text }) => {
  const e = '⚠️';

  if (!text) return m.reply(`${e} Ingresa una URL para hacer fetch.\nEjemplo:\nhttps://pornhub.com`);
  if (!/^https?:\/\//.test(text)) return m.reply(`${e} La URL debe comenzar con http o https.`);

  try {
    let _url = new URL(text);
    let url = global.API(
      _url.origin,
      _url.pathname,
      Object.fromEntries(_url.searchParams.entries()),
      'APIKEY'
    );

    let res = await fetch(url);
    let contentLength = parseInt(res.headers.get('content-length') || 0);

    if (contentLength > 100 * 1024 * 1024) {
      return m.reply(`${e} El contenido es demasiado grande para ser procesado (${formatBytes(contentLength)}).`);
    }

    let contentType = res.headers.get('content-type') || '';
    if (!/text|json/.test(contentType)) {
      return conn.sendFile(m.chat, url, 'archivo', `📦 Archivo: ${text}`, m);
    }

    let buffer = await res.buffer();
    let resultado;

    try {
      resultado = format(JSON.parse(buffer.toString()));
    } catch {
      resultado = buffer.toString();
    }

    m.reply(resultado.slice(0, 65536));
    
  } catch (err) {
    console.error(err);
    m.reply(`${e} Error al procesar la URL: ${err.message}`);
  }
};

function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + ['Bytes', 'KB', 'MB', 'GB', 'TB'][i];
}

handler.command = ['fetch', 'get'];
handler.group = true;

export default handler;

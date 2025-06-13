import fetch      from 'node-fetch';
import cheerio    from 'cheerio';          // npm i cheerio
import { extname, basename } from 'path';

/* ╭───────────────────────────────────────╮
   │   tabla súper-rápida de MIME types    │
   ╰───────────────────────────────────────╯ */
const mimeFromExt = ext => ({
  '7z':'application/x-7z-compressed','zip':'application/zip','rar':'application/vnd.rar',
  'apk':'application/vnd.android.package-archive',
  'mp4':'video/mp4','mkv':'video/x-matroska',
  'mp3':'audio/mpeg','wav':'audio/wav','ogg':'audio/ogg','flac':'audio/flac',
  'pdf':'application/pdf','doc':'application/msword',
  'docx':'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'xls':'application/vnd.ms-excel','xlsx':'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'ppt':'application/vnd.ms-powerpoint','pptx':'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'txt':'text/plain','html':'text/html','csv':'text/csv','json':'application/json',
  'js':'application/javascript','py':'text/x-python','c':'text/x-c','cpp':'text/x-c++',
  'exe':'application/vnd.microsoft.portable-executable'
}[ext]);

const normalizeURL = url => url.replace(/\?.*$/,'');    // fuera fbclid o basura

/* ╭───────────────────────────────────────╮
   │              el Handler              │
   ╰───────────────────────────────────────╯ */
let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) throw `${usedPrefix + command} <link de MediaFire>`;

  const url = normalizeURL(text.trim());

  // ⏳  avisamos que arrancamos
  await conn.sendMessage(m.chat, { react:{ text:'🕒', key:m.key }});

  /*──────────────────────────
    1. ¿Es carpeta o archivo?
    ──────────────────────────*/
  let files = [];
  if (/\/folder\//i.test(url)) {
    files = await scrapeFolder(url);          // ⟵ magia HTML
  } else {
    const direct = await resolveDirect(url);  // ⟵ API agatz
    if (direct) files.push(direct);
  }

  if (!files.length) throw 'No encontré ningún .mp4 ahí dentro.';

  /*──────────────────────────
    2. Enviamos cada video
    ──────────────────────────*/
  for (const file of files) {
    const ext  = extname(file.name).slice(1).toLowerCase();
    const mime = mimeFromExt(ext) || 'application/octet-stream';
    const cap  = `*Nombre:* ${file.name}\n*Peso:*   ${file.size}\n*Tipo:*   ${ext.toUpperCase()}`;

    await conn.sendMessage(m.chat,{
      document:{ url:file.link },
      fileName:file.name,
      mimetype:mime,
      caption: cap
    },{ quoted:m });
  }

  await conn.sendMessage(m.chat,{ react:{ text:'✅', key:m.key }});
};

/* ╭──────────────────────────────╮
   │  handler metadata (Baileys)  │
   ╰──────────────────────────────╯ */
handler.command = ['jj'];
handler.group   = true;
export default handler;

/* ╭───────────────────────────────────────╮
   │          helpers auxiliares           │
   ╰───────────────────────────────────────╯ */
async function resolveDirect(url){
  try{
    const api = `https://api.agatz.xyz/api/mediafire?url=${encodeURIComponent(url)}`;
    const res = await fetch(api);
    const json = await res.json();
    const file = json?.data?.[0];
    if (!file) return null;
    return { name:file.nama, size:file.size, link:file.link };
  }catch(e){
    return null;
  }
}

async function scrapeFolder(folderURL){
  try{
    const html = await fetch(folderURL).then(r=>r.text());
    const $ = cheerio.load(html);

    // MediaFire escribe data-id y aria-label en los links de descarga dentro de tablas
    const rows = $('a[data-download-link][aria-label="Download file"]');

    const list = [];
    rows.each((_,el)=>{
      const link = $(el).attr('href');
      const name = basename(decodeURIComponent(link.split('?').shift()));
      if (!name.toLowerCase().endsWith('.mp4')) return; // sólo mp4, como pidió el boss
      const sizeTxt = $(el).closest('tr').find('.file_info span').first().text().trim() || '???';
      list.push({ name, size:sizeTxt, link });
    });

    return list;
  }catch(e){
    return [];
  }
      }

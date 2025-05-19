import fetch from 'node-fetch';

const mimeFromExt = ext => ({
  '7z' : 'application/x-7z-compressed',
  'zip': 'application/zip',
  'rar': 'application/vnd.rar',
  'apk': 'application/vnd.android.package-archive',
  'mp4': 'video/mp4',
  'mp3': 'audio/mpeg',
  'pdf': 'application/pdf'
}[ext] || 'application/octet-stream');

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) throw `${usedPrefix + command} <link de MediaFire>`;

  // ⏳ reacción mientras descarga datos de la API
  await conn.sendMessage(m.chat, { react: { text: '🕒', key: m.key }});

  const res  = await fetch(`https://api.agatz.xyz/api/mediafire?url=${encodeURIComponent(text)}`);
  const json = await res.json();
  if (!json?.data?.length) throw 'No se pudo obtener el archivo.';

  const file = json.data[0];

  // ── extensión y mime ────────────────────────────────────────────────
  const extMatch = file.nama.match(/\.(\w+)$/);
  const ext      = extMatch ? extMatch[1].toLowerCase() : 'bin';
  const mime     = mimeFromExt(ext);

  // ── mensaje descriptivo ─────────────────────────────────────────────
  const caption = `*Nombre:* ${file.nama}
*Peso:*   ${file.size}
*Tipo:*   ${ext.toUpperCase()}`;

  /*  📄 ENVÍO COMO DOCUMENTO
      ───────────────────────
      - document.url → enlace directo
      - fileName     → nombre con extensión
      - mimetype     → correcto para que se abra bien
  */
  await conn.sendMessage(m.chat, {
    document: { url: file.link },
    fileName: file.nama,
    mimetype: mime,
    caption
  }, { quoted: m });

  await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key }});
};

handler.command = ['mf', 'mediafire'];
handler.group   = true;

export default handler;

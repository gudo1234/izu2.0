import fetch from 'node-fetch';

const mimeFromExt = ext => ({
  '7z':  'application/x-7z-compressed',
  'zip': 'application/zip',
  'rar': 'application/vnd.rar',
  'apk': 'application/vnd.android.package-archive',
  'mp4': 'video/mp4',
  'mp3': 'audio/mpeg',
  'pdf': 'application/pdf'
}[ext] || 'application/octet-stream');

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) throw `${e} *Ejemplo de uso:* ${usedPrefix + command} <link de MediaFire>`;

  await conn.sendMessage(m.chat, { react: { text: '🕒', key: m.key }});

  const res  = await fetch(`https://api.agatz.xyz/api/mediafire?url=${encodeURIComponent(text)}`);
  const json = await res.json();
  const file = json.data[0];

  // ─── extrae extensión ───────────────────────────────────────────────
  const ext  = (file.nama.match(/\.(\w+)$/) || [,'bin'])[1].toLowerCase();
  const mime = mimeFromExt(ext);

  await conn.sendFile(
    m.chat,
    file.link,
    file.nama,                                     // filename con extensión
`*Nombre:* ${file.nama}
*Peso:*   ${file.size}
*Tipo:*   ${ext.toUpperCase()}`,
    m,
    null,
    { mimetype: mime }                             // fuerza mime-type
  );

  await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key }});
};

handler.command = ['mf','mediafire'];
handler.group   = true;

export default handler;

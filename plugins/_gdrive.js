import fetch from 'node-fetch';

let handler = async (m, { conn, args }) => {
  if (!args[0]) throw `${e} Por favor, ingresa una URL de Google Drive.`;
  m.react('🕒')
  const url = args[0];
  if (!url.match(/drive\.google\.com\/file/i)) throw `${e} La URL ingresada no es válida o es una carpeta.`;

  try {
    const res = await fdrivedl(url);

    const peso = formatBytes(res.sizeBytes);
    let nombre = res.fileName || 'archivo';
    let tipo = res.mimetype;
    if (!tipo || tipo === 'application/octet-stream') {
      tipo = detectarMime(nombre);
    }

    if (peso.includes('GB') && parseFloat(peso) > 1.8) throw '📦 El archivo es muy grande para enviarlo.';

    const texto = `📁 *Archivo:* ${nombre}\n${e} *Tamaño:* ${peso}\n> Enviando el archivo tipo *${tipo}* espere un momento...`;
    m.reply(texto);
m.react('✅')
    await conn.sendMessage(m.chat, {
      document: { url: res.downloadUrl },
      fileName: nombre,
      mimetype: tipo
    }, { quoted: m });

  } catch (e) {
    console.error(e);
    throw `${e} Error al intentar descargar el archivo. Puede que el enlace esté dañado o tenga límite de descargas.`;
  }
};

async function fdrivedl(url) {
  const id = (url.match(/\/?id=([a-zA-Z0-9_-]+)/i) || url.match(/\/d\/([a-zA-Z0-9_-]+)/))[1];
  if (!id) throw `${e} No se pudo extraer el ID del enlace.`;

  const res = await fetch(`https://drive.google.com/uc?id=${id}&authuser=0&export=download`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      'x-json-requested': 'true',
      'x-drive-first-party': 'DriveWebUi',
      origin: 'https://drive.google.com',
      'user-agent': 'Mozilla/5.0'
    }
  });

  let json;
  try {
    json = JSON.parse((await res.text()).slice(4));
  } catch {
    throw `${e} No se pudo procesar la respuesta de Google Drive.`;
  }

  if (!json.downloadUrl) throw `${e} Este archivo ha alcanzado el límite de descargas o es privado.`;

  const head = await fetch(json.downloadUrl);
  if (!head.ok) throw `${e} No se pudo acceder al archivo.`;

  return {
    downloadUrl: json.downloadUrl,
    fileName: json.fileName || 'archivo',
    sizeBytes: json.sizeBytes,
    mimetype: head.headers.get('content-type') || 'application/octet-stream'
  };
}

function detectarMime(fileName) {
  const ext = fileName.split('.').pop().toLowerCase();
  const tipos = {
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ppt: 'application/vnd.ms-powerpoint',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    zip: 'application/zip',
    rar: 'application/vnd.rar',
    txt: 'text/plain',
    mp3: 'audio/mpeg',
    mp4: 'video/mp4',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    apk: 'application/vnd.android.package-archive',
    csv: 'text/csv',
    json: 'application/json',
    xml: 'application/xml',
    html: 'text/html'
  };
  return tipos[ext] || 'application/octet-stream';
}

function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + ['Bytes', 'KB', 'MB', 'GB', 'TB'][i];
}

handler.command = ['drive', 'drivedl', 'dldrive', 'gdrive'];
handler.group = true;

export default handler;

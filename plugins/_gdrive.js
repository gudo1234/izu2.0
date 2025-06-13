import fetch from 'node-fetch';

let handler = async (m, { conn, args }) => {
  if (!args[0]) throw '🔗 Por favor, ingresa una URL de Google Drive.';
  
  let url = args[0];
  if (!url.match(/drive\.google\.com\/file/i)) throw '❌ La URL ingresada no parece válida o es una carpeta de Drive.';

  try {
    const res = await fdrivedl(url);

    const peso = formatBytes(res.sizeBytes);
    const tipo = res.mimetype || 'application/octet-stream';
    const nombre = res.fileName || 'archivo';

    if (peso.includes('GB') && parseFloat(peso) > 1.8) throw '📦 El archivo es muy grande para ser enviado.';

    let texto = `📁 Archivo: ${nombre}\n📐 Tamaño: ${peso}\n📄 Tipo: ${tipo}`;
    m.reply(texto);

    await conn.sendMessage(m.chat, {
      document: { url: res.downloadUrl },
      fileName: nombre,
      mimetype: tipo
    }, { quoted: m });

  } catch (e) {
    console.error(e);
    throw '❗ Error al intentar descargar el archivo. Puede que el enlace esté dañado o tenga límite de descargas.';
  }
};

async function fdrivedl(url) {
  let id = (url.match(/\/?id=([a-zA-Z0-9_-]+)/i) || url.match(/\/d\/([a-zA-Z0-9_-]+)/))[1];
  if (!id) throw '❌ No se pudo extraer el ID del enlace.';

  let res = await fetch(`https://drive.google.com/uc?id=${id}&authuser=0&export=download`, {
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
    throw '❌ No se pudo procesar la respuesta de Google Drive.';
  }

  if (!json.downloadUrl) throw '❌ Este archivo ha alcanzado el límite de descargas o es privado.';

  const head = await fetch(json.downloadUrl);
  if (!head.ok) throw '❌ No se pudo acceder al archivo.';

  return {
    downloadUrl: json.downloadUrl,
    fileName: json.fileName || 'archivo',
    sizeBytes: json.sizeBytes,
    mimetype: head.headers.get('content-type') || 'application/octet-stream'
  };
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

import axios from 'axios';
import fs from 'fs';
import path from 'path';

let handler = async (m, { conn, text }) => {
  const emoji = '📦';
  const emoji2 = '❌';
  const msm = '⚠️';

  if (!text) return m.reply(`${emoji} Por favor, ingresa un enlace de *Terabox*.`);
  await m.react('🕓');

  try {
    const result = await terabox(text);
    if (!result || !result.length) {
      return m.reply(`${emoji2} Enlace inválido o no se pudo obtener información del archivo.`);
    }

    for (let i = 0; i < result.length; i++) {
      const { fileName, type, thumb, url } = result[i];
      if (!fileName || !url) {
        console.error('❗ Datos del archivo incompletos:', { fileName, url });
        continue;
      }

      const caption = `📄 *Nombre:* ${fileName}\n📂 *Formato:* ${type}`;
      const tempPath = path.join('./tmp', fileName);

      try {
        // Descargar archivo
        const response = await axios.get(url, { responseType: 'stream' });
        await new Promise((resolve, reject) => {
          const writer = fs.createWriteStream(tempPath);
          response.data.pipe(writer);
          writer.on('finish', resolve);
          writer.on('error', reject);
        });

        // Enviar archivo
        await conn.sendFile(m.chat, tempPath, fileName, caption, m, false, {
          thumbnail: thumb ? await getBuffer(thumb) : undefined
        });
        await m.react('✅');

        // Borrar archivo temporal
        fs.unlinkSync(tempPath);
      } catch (error) {
        console.error(`❌ Error al enviar "${fileName}":`, error.message);
        m.reply(`${msm} No se pudo enviar el archivo: *${fileName}*`);
        if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
      }
    }
  } catch (err) {
    console.error('❌ Error general en el comando Terabox:', err);
    m.reply(`${msm} Ocurrió un error al procesar el enlace. Asegúrate de que sea válido.`);
  }
};

handler.command = ['terabox', 'tb'];
handler.group = true;

export default handler;

async function terabox(url) {
  try {
    const res = await axios.post('https://teradl-api.dapuntaratya.com/generate_file', {
      mode: 1,
      url
    });

    const { list, js_token, cookie, sign, timestamp, shareid, uk } = res.data;
    const array = [];

    for (let x of list) {
      try {
        const dlRes = await axios.post('https://teradl-api.dapuntaratya.com/generate_link', {
          js_token, cookie, sign, timestamp, shareid, uk, fs_id: x.fs_id
        });

        const link = dlRes.data?.download_link?.url_1;
        if (!link) continue;

        array.push({
          fileName: x.name,
          type: x.type,
          thumb: x.image,
          url: link
        });
      } catch (err) {
        console.error('⚠️ Error al generar enlace de descarga:', err?.response?.data || err);
      }
    }

    return array;
  } catch (e) {
    console.error('❌ Error al consultar la API Terabox:', e?.response?.data || e);
    return [];
  }
}

async function getBuffer(url) {
  try {
    const res = await axios.get(url, { responseType: 'arraybuffer' });
    return res.data;
  } catch (err) {
    console.error('⚠️ Error al obtener la imagen:', err);
    return null;
  }
}

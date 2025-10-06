import axios from 'axios'

const mimeFromExt = ext => ({
  '7z'   : 'application/x-7z-compressed',
  'zip'  : 'application/zip',
  'rar'  : 'application/vnd.rar',
  'apk'  : 'application/vnd.android.package-archive',
  'mp4'  : 'video/mp4',
  'mkv'  : 'video/x-matroska',
  'mp3'  : 'audio/mpeg',
  'wav'  : 'audio/wav',
  'ogg'  : 'audio/ogg',
  'flac' : 'audio/flac',
  'pdf'  : 'application/pdf',
  'doc'  : 'application/msword',
  'docx' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'xls'  : 'application/vnd.ms-excel',
  'xlsx' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'ppt'  : 'application/vnd.ms-powerpoint',
  'pptx' : 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'txt'  : 'text/plain',
  'html' : 'text/html',
  'csv'  : 'text/csv',
  'json' : 'application/json',
  'js'   : 'application/javascript',
  'py'   : 'text/x-python',
  'c'    : 'text/x-c',
  'cpp'  : 'text/x-c++',
  'exe'  : 'application/vnd.microsoft.portable-executable'
}[ext])

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) throw `✳️ Usa el comando correctamente:\n${usedPrefix + command} <link de MediaFire>`

  // Validar que el link sea de MediaFire
  const mediafireRegex = /https?:\/\/(www\.)?mediafire\.com\/file\/[a-zA-Z0-9]+/i
  if (!mediafireRegex.test(text)) throw '⚠️ Ingresa un enlace válido de *MediaFire*.'

  await conn.sendMessage(m.chat, { react: { text: '🕒', key: m.key } })

  try {
    const apiUrl = `https://api.stellarwa.xyz/dow/mediafire?url=${encodeURIComponent(text)}`
    const { data: json } = await axios.get(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept': 'application/json'
      },
      timeout: 25000
    })

    // Mostrar en consola por depuración
    console.log('📥 Respuesta de Stellar API:', json)

    // Validar estructura
    if (!json || json.status !== true || !json.data || !json.data.dl)
      throw new Error('Respuesta inválida de la API Stellar.')

    const file = json.data
    const extMatch = file.title.match(/\.(\w+)$/i)
    const ext = extMatch ? extMatch[1].toLowerCase() : 'zip'
    const mime = mimeFromExt(ext) || file.tipo || 'application/octet-stream'

    const caption = `📦 *Archivo encontrado*\n\n` +
                    `*📄 Nombre:* ${file.title}\n` +
                    `*📁 Peso:* ${file.peso}\n` +
                    `*📅 Fecha:* ${file.fecha}\n` +
                    `*📑 Tipo:* ${ext.toUpperCase()}`

    // Enviar archivo
    await conn.sendMessage(m.chat, {
      document: { url: file.dl },
      fileName: file.title,
      mimetype: mime,
      caption
    }, { quoted: m })

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
  } catch (err) {
    console.error('❌ Error en MediaFire:', err?.response?.data || err)
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    throw `⚠️ No se pudo procesar el enlace.\n\nDetalles: ${err.message || err}`
  }
}

handler.command = ['mf', 'mediafire']
handler.group = true

export default handler

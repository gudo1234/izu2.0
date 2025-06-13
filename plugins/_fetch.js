import fetch from 'node-fetch'

let handler = async (m, { text, conn }) => {
  if (!/^https?:\/\//.test(text)) return m.reply('Ejemplo:\n.fetch https://giffiles.alphacoders.com/221/thumb-440-221903.mp4')

  try {
    let res = await fetch(text)

    let size = res.headers.get('content-length') || 0
    if (size > 100 * 1024 * 1024) return m.reply(`El archivo es demasiado grande: ${(size / (1024 * 1024)).toFixed(2)} MB`)

    let type = res.headers.get('content-type') || ''
    if (!/text|json/.test(type)) {
      return conn.sendFile(m.chat, text, 'archivo', `📥 Archivo desde: ${text}`, m)
    }

    // Si es texto o JSON, lo intentamos mostrar como texto plano
    let txt = await res.buffer()
    try {
      txt = JSON.stringify(JSON.parse(txt.toString()), null, 2)
    } catch (e) {
      txt = txt.toString()
    }
    m.reply(txt.slice(0, 65536)) // máximo 65k caracteres
  } catch (err) {
    m.reply('❌ Error al obtener el archivo:\n' + err)
  }
}

handler.help = ['fetch'].map(v => v + ' <link>')
handler.tags = ['owner']
handler.command = ['fetch', 'get']
handler.rowner = true

export default handler

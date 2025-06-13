import fetch from 'node-fetch'

let handler = async (m, { text, conn }) => {
  if (!/^https?:\/\//.test(text)) return m.reply('Ejemplo:\n.fetch https://giffiles.alphacoders.com/221/thumb-440-221903.mp4')

  try {
    const res = await fetch(text, {
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0 Safari/537.36',
        'Referer': 'https://giffiles.alphacoders.com/'
      }
    })

    const type = res.headers.get('content-type') || ''
    const size = res.headers.get('content-length') || 0

    if (/html/.test(type)) return m.reply('⚠️ El enlace no devuelve un archivo directo. Es una página HTML.')
    if (size > 100 * 1024 * 1024) return m.reply(`❌ El archivo pesa ${(size / 1048576).toFixed(2)} MB, supera el límite.`)

    const buffer = await res.buffer()
    return conn.sendFile(m.chat, buffer, 'archivo.mp4', `📥 Archivo descargado desde:\n${text}`, m)
    
  } catch (err) {
    console.error(err)
    m.reply('❌ Error al obtener el archivo:\n' + err.message)
  }
}

handler.help = ['fetch'].map(v => v + ' <link>')
handler.tags = ['owner']
handler.command = ['fetch', 'get']
handler.rowner = true

export default handler

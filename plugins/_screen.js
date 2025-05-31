import fetch from 'node-fetch'

let handler = async (m, { conn, args }) => {
  try {
    m.react('📸')

    // Si el usuario escribe una URL personalizada
    let targetUrl = args[0] || 'https://web.whatsapp.com'

    // Verifica que sea una URL válida
    if (!/^https?:\/\//.test(targetUrl)) throw '❌ Ingresa una URL válida, por ejemplo:\n`.screen https://example.com`'

    let apiKey = '5ERD9AF-3TPMGFS-J0A8DNG-B8KYCP9'
    let url = `https://api.screenshotapi.net/screenshot?token=${apiKey}&url=${encodeURIComponent(targetUrl)}&output=image&file_type=png`

    let res = await fetch(url)
    let json = await res.json()

    if (!json.screenshot) throw '❌ No se pudo obtener la captura.'

    await conn.sendFile(m.chat, json.screenshot, 'screenshot.png', `🖼 Captura de: ${targetUrl}`, m)
  } catch (e) {
    console.error(e)
    m.reply(`${e}`)
  }
}

handler.command = ['screen']
handler.help = ['screen <url>']
handler.tags = ['tools']
handler.owner = true

export default handler

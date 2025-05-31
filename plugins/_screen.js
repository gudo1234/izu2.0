import puppeteer from 'puppeteer'

let handler = async (m, { conn }) => {
  try {
    m.react('📸')
    let browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })

    let page = await browser.newPage()
    
    // Dirección de WhatsApp Web (opcional si ya tienes sesión)
    await page.goto('https://web.whatsapp.com', { waitUntil: 'networkidle2' })

    // Espera a que cargue lista de chats
    await page.waitForSelector('._3m_Xw') // Clase típica de chat list
    await page.setViewport({ width: 1280, height: 720 })

    // Toma captura de la vista de chats
    const buffer = await page.screenshot({ fullPage: false })

    await browser.close()

    await conn.sendFile(m.chat, buffer, 'screenshot.jpg', '🖼 Captura de los chats recientes', m)
  } catch (e) {
    console.error(e)
    m.reply(`${e} Ocurrió un error al capturar la pantalla.`)
  }
}

handler.command = ['screen']
handler.owner = true // Solo el dueño puede usarlo
export default handler

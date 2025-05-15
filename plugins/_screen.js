import puppeteer from 'puppeteer'

let handler = async (m, { conn }) => {
  let browser = await puppeteer.launch({ headless: true })
  let page = await browser.newPage()
  await page.goto('https://web.whatsapp.com')
  await page.setViewport({ width: 1280, height: 800 })
  await page.waitForTimeout(15000) // espera a que cargue WhatsApp Web manualmente

  await page.screenshot({ path: './screen.png' })
  await browser.close()

  await conn.sendFile(m.chat, './screen.png', 'screen.png', 'Captura actual de los chats', m)
}

handler.command = ['screen']
handler.owner = true
export default handler

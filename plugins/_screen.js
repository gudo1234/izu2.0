import fs from 'fs'
import robot from 'robotjs'
import Jimp from 'jimp'

let handler = async (m, { conn }) => {
  try {
    m.react('🖥️')

    // Captura pantalla completa
    const screenSize = robot.getScreenSize()
    const img = robot.screen.capture(0, 0, screenSize.width, screenSize.height)

    // Crea una imagen compatible usando Jimp
    const jimpImage = new Jimp(img.width, img.height)

    let pos = 0
    for (let y = 0; y < img.height; y++) {
      for (let x = 0; x < img.width; x++) {
        const i = (y * img.width + x) * 4
        const color = img.image.readUInt32LE(i)
        jimpImage.setPixelColor(color, x, y)
      }
    }

    const buffer = await jimpImage.getBufferAsync(Jimp.MIME_PNG)
    await conn.sendFile(m.chat, buffer, 'screenshot.png', '🖼 Captura de pantalla', m)
  } catch (e) {
    console.error(e)
    m.reply(`${e} Error al capturar la pantalla. Asegúrate de que el entorno tiene interfaz gráfica.`)
  }
}

handler.command = ['screen']
handler.owner = true
export default handler

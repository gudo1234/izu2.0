import fs from 'fs'
import { join } from 'path'
import Jimp from 'jimp'
import fetch from 'node-fetch'
import path from 'path'

let handler = async (m, { conn, __dirname }) => {
  const user = m.sender
  const name = m.pushName || 'Usuario'
  const emojis = ['🎉', '🤖', '💫', '🔥', '🛸', '💎', '⭐', '🌟', '🚀', '🦄']
  const emoji = emojis[Math.floor(Math.random() * emojis.length)]

  // --- Variables principales ---
  let wm = '🦄드림 가이 Xeon'
  let textbot = 'Bot oficial desarrollado por Xeon'
  let redes = 'https://whatsapp.com/channel/0029VbAdXB147XeAcgOsJQ2j'
  let icono = 'https://qu.ax/zAMtB.jpg'

  // --- Nombre del grupo o chat ---
  let groupName = m.isGroup
    ? (await conn.groupMetadata(m.chat)).subject
    : 'Chat privado'

  try {
    // --- Preparar miniatura ---
    const imgPath = join(__dirname, '../thumbnail.jpg')
    const thumbLocal = fs.existsSync(imgPath) ? fs.readFileSync(imgPath) : null
    const thumbResized = thumbLocal
      ? await (await Jimp.read(thumbLocal)).resize(300, 150).getBufferAsync(Jimp.MIME_JPEG)
      : null

    const menuText = `✨ Hola, @${user.split('@')[0]} ${emoji}\n🦄 ¡Bienvenido al menú interactivo de *${groupName}*!`

    // --- 1) Enviar DOCUMENT (siempre visible como documento con icono) ---
    // Aquí creamos un pequeño documento en memoria (puedes usar tu archivo real si lo tienes)
    // Si quieres que sea un xlsx/pdf real, reemplaza el buffer por fs.readFileSync(rutaArchivo)
    const docBuffer = Buffer.from('Interactive Document by Xeon') // archivo simple de prueba
    await conn.sendMessage(
      m.chat,
      {
        document: docBuffer,
        mimetype: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        fileName: '🦄2take1-Interactive.xlsx',
        fileLength: docBuffer.length,
        pageCount: 1,
        jpegThumbnail: thumbResized || undefined, // miniatura que aparece en el documento
        contextInfo: {
          externalAdReply: {
            title: wm,
            body: textbot,
            thumbnail: thumbResized || undefined,
            sourceUrl: redes
          },
          mentionedJid: [user]
        }
      },
      { quoted: m }
    )

    // --- 2) Enviar MENSAJE INTERACTIVO (botones / lista) ---
    // Usamos hydratedButtons (Baileys) para asegurar compatibilidad visual en la app
    const buttons = [
      { urlButton: { displayText: '🌐 Canal de WhatsApp', url: redes } },
      { quickReplyButton: { displayText: '🦄 𝘾𝙧𝙖𝙨𝙝', id: '.pito' } },
      { quickReplyButton: { displayText: '📋 Copiar Código', id: 'copy_code' } }
    ]

    await conn.sendMessage(
      m.chat,
      {
        text: menuText,
        footer: '🦄 ¡By Take-Two Interative!',
        templateButtons: [
          // fallback para clientes que muestran template buttons
          { urlButton: { displayText: '🌐 Canal de WhatsApp', url: redes } },
          { quickReplyButton: { displayText: 'Más Opciones', id: '.menu' } }
        ],
        // adicional: hydratedButtons (mejor renderizado en varios clientes)
        hydratedButtons: buttons,
        contextInfo: {
          mentionedJid: [user],
          externalAdReply: {
            title: wm,
            body: textbot,
            thumbnail: thumbResized || undefined,
            sourceUrl: redes,
            mediaType: 1,
            renderLargerThumbnail: false
          }
        }
      },
      { quoted: m }
    )

  } catch (e) {
    console.error('Error al generar mensaje interactivo:', e)
    await conn.reply(m.chat, `❌ Error al generar mensaje:\n${e.message}`, m)
  }
}

handler.command = ['si']
export default handler

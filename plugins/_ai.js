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
    // --- Imagen miniatura ---
    const imgPath = join(__dirname, '../thumbnail.jpg')
    const thumbLocal = fs.existsSync(imgPath) ? fs.readFileSync(imgPath) : null
    const thumbResized = thumbLocal
      ? await (await Jimp.read(thumbLocal)).resize(300, 150).getBufferAsync(Jimp.MIME_JPEG)
      : null

    const menuText = `✨ Hola, @${user.split('@')[0]} ${emoji}\n🦄 ¡Bienvenido al menú interactivo de *${groupName}*!`

    const contextInfo = {
      mentionedJid: [user],
      externalAdReply: {
        title: wm,
        body: textbot,
        thumbnail: await (await fetch(icono)).buffer(),
        sourceUrl: redes,
        mediaType: 1,
        renderLargerThumbnail: false
      }
    }

    // --- Estructura documentMessage (real visible en WA) ---
    const documentMessage = {
      url: 'https://mmg.whatsapp.net/v/t62.7119-24/539012045_745537058346694_1512031191239726227_n.enc',
      mimetype: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      fileSha256: Buffer.from('fa09afbc207a724252bae1b764ecc7b13060440ba47a3bf59e77f01924924bfe', 'hex'),
      fileLength: '99999',
      pageCount: 1,
      mediaKey: Buffer.from('3163ba7c8db6dd363c4f48bda2735cc0d0413e57567f0a758f514f282889173c', 'hex'),
      fileName: '🦄 2take1-Interactive',
      fileEncSha256: Buffer.from('652f2ff6d8a8dae9f5c9654e386de5c01c623fe98d81a28f63dfb0979a44a22f', 'hex'),
      directPath: '/v/t62.7119-24/539012045_745537058346694_1512031191239726227_n.enc',
      mediaKeyTimestamp: '1756370084',
      jpegThumbnail: thumbResized || null,
      contextInfo
    }

    // --- Mensaje interactivo principal ---
    const interactiveMessage = {
      header: { documentMessage },
      body: { text: menuText },
      footer: { text: '🦄 ¡By Take-Two Interative!' },
      nativeFlowMessage: {
        buttons: [
          {
            name: 'single_select',
            buttonParamsJson: `{
              "title":"Más Opciones",
              "sections":[
                {
                  "title":"⌏Seleccione una opción requerida⌎",
                  "highlight_label":"🦄드림 가이 Xeon",
                  "rows":[
                    {"title":"Owner/Creador","description":"","id":"Edar"},
                    {"title":"Información del Bot","description":"","id":".info"},
                    {"title":"Reglas/Términos","description":"","id":".reglas"},
                    {"title":"vcard/yo","description":"","id":".vcar"},
                    {"title":"Ping","description":"Velocidad del bot","id":".ping"}
                  ]
                }
              ]
            }`
          },
          {
            name: 'cta_url',
            buttonParamsJson: JSON.stringify({
              display_text: '🌐 Canal de WhatsApp',
              url: redes,
              merchant_url: redes
            })
          },
          {
            name: 'cta_copy',
            buttonParamsJson: JSON.stringify({
              display_text: 'Copiar Código',
              id: '12345',
              copy_code: '🦄 Xeon-Interactive'
            })
          }
        ],
        messageParamsJson: '{}'
      },
      contextInfo
    }

    // --- Envío visible (con document y botones reales) ---
    await conn.relayMessage(
      m.chat,
      {
        viewOnceMessage: {
          message: {
            interactiveMessage
          }
        }
      },
      {}
    )

  } catch (e) {
    console.error('Error al generar mensaje interactivo:', e)
    await conn.reply(m.chat, `❌ Error al generar mensaje:\n${e.message}`, m)
  }
}

handler.command = ['si']
export default handler

import fs from 'fs'
import { join } from 'path'
import Jimp from 'jimp'
import fetch from 'node-fetch'

let handler = async (m, { conn, __dirname, command }) => {
  try {
    // --- Configuración principal ---
    const wm = '🦄드림 가이 Xeon'
    const textbot = 'Bot oficial desarrollado por Xeon'
    const redes = 'https://whatsapp.com/channel/0029VbAdXB147XeAcgOsJQ2j'
    const icono = 'https://qu.ax/zAMtB.jpg'

    // --- Imagen miniatura ---
    const imgPath = join(__dirname, icono)
    const thumbLocal = fs.existsSync(imgPath) ? fs.readFileSync(imgPath) : null
    const thumbResized = thumbLocal
      ? await (await Jimp.read(thumbLocal)).resize(300, 150).getBufferAsync(Jimp.MIME_JPEG)
      : await (await fetch(icono)).buffer()

    const textoMenu = `✨ *Menú Interactivo*\n\nSelecciona una opción para continuar.`

    // --- ContextInfo del mensaje ---
    const contextInfo = {
      externalAdReply: {
        title: wm,
        body: textbot,
        thumbnail: thumbResized,
        sourceUrl: redes,
        mediaType: 1,
        renderLargerThumbnail: true
      }
    }

    // --- Documento visible (se muestra arriba) ---
    await conn.sendMessage(m.chat, {
      document: {
        url: 'https://mmg.whatsapp.net/v/t62.7119-24/539012045_745537058346694_1512031191239726227_n.enc'
      },
      mimetype: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      fileName: '🦄 TakeTwo Interactive',
      caption: textoMenu,
      contextInfo
    }, { quoted: m })

    // --- Menú interactivo con botones ---
    const nativeFlowPayload = {
      header: {
        hasMediaAttachment: false
      },
      body: { text: textoMenu },
      footer: { text: '🦄 By Take-Two Interactive' },
      nativeFlowMessage: {
        buttons: [
          {
            name: 'single_select',
            buttonParamsJson: `{
              "title":"Opciones del Bot",
              "sections":[
                {
                  "title":"⌏Selecciona una opción⌎",
                  "rows":[
                    {"title":"Información del Bot","id":".info"},
                    {"title":"Creador/Owner","id":".owner"},
                    {"title":"Términos y Reglas","id":".reglas"},
                    {"title":"Velocidad/Ping","id":".ping"}
                  ]
                }
              ]
            }`
          },
          {
            name: 'cta_url',
            buttonParamsJson: JSON.stringify({
              display_text: '🌐 Canal Oficial',
              url: redes,
              merchant_url: redes
            })
          },
          {
            name: 'cta_url',
            buttonParamsJson: JSON.stringify({
              display_text: '📞 Contactar Desarrollador',
              url: 'https://wa.me/50236473217?text=Hola%20quiero%20un%20servicio%20premium',
              merchant_url: 'https://wa.me/50236473217?text=Hola%20quiero%20un%20servicio%20premium'
            })
          }
        ],
        messageParamsJson: `{
          "bottom_sheet":{
            "list_title":"Menú principal",
            "button_title":"▻ Abrir Menú ✨"
          }
        }`
      },
      contextInfo
    }

    await conn.relayMessage(m.chat, { interactiveMessage: nativeFlowPayload }, {})

  } catch (e) {
    console.error(e)
    await conn.reply(m.chat, `❌ Error al generar el documento:\n${e.message}`, m)
  }
}

handler.command = ['si']
export default handler

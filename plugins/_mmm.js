import fs from 'fs'
import { join } from 'path'
import Jimp from 'jimp'
import fetch from 'node-fetch'

let handler = async (m, { conn, __dirname }) => {
  try {
    // Miniatura local
    const imgPath = join(__dirname, '../thumbnail.jpg')
    const thumbLocal = fs.existsSync(imgPath) ? fs.readFileSync(imgPath) : null
    const thumbResized = thumbLocal
      ? await (await Jimp.read(thumbLocal)).resize(300, 150).getBufferAsync(Jimp.MIME_JPEG)
      : null

    // Menú simple
    const menu = `hola`

    // Context info
    const contextInfo = {
      externalAdReply: {
        title: wm,
        body: textbot,
        thumbnailUrl: redes,
        thumbnail: await (await fetch(icono)).buffer(),
        sourceUrl: redes,
        mediaType: 1,
        renderLargerThumbnail: false
      }
    }

    // Botones y lista
    const nativeFlowPayload = {
      header: {
        documentMessage: {
          url: 'https://mmg.whatsapp.net/v/t62.7119-24/539012045_745537058346694_1512031191239726227_n.enc',
          mimetype: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          fileSha256: Buffer.from('fa09afbc207a724252bae1b764ecc7b13060440ba47a3bf59e77f01924924bfe', 'hex'),
          fileLength: { low: -727379969, high: 232, unsigned: true },
          pageCount: 0,
          mediaKey: Buffer.from('3163ba7c8db6dd363c4f48bda2735cc0d0413e57567f0a758f514f282889173c', 'hex'),
          fileName: '🦄드림 가이 Xeon take-Interative',
          fileEncSha256: Buffer.from('652f2ff6d8a8dae9f5c9654e386de5c01c623fe98d81a28f63dfb0979a44a22f', 'hex'),
          directPath: '/v/t62.7119-24/539012045_745537058346694_1512031191239726227_n.enc',
          mediaKeyTimestamp: { low: 1756370084, high: 0, unsigned: false },
          jpegThumbnail: thumbResized || null,
          contextInfo
        },
        hasMediaAttachment: true
      },
      body: { text: '' },
      footer: { text: menu },
      nativeFlowMessage: {
        buttons: [
          // ✅ Lista real
          {
            name: 'single_select',
            buttonParamsJson: JSON.stringify({
              title: '𝚂𝚎𝚕𝚎𝚌𝚝 𝙼𝚎𝚗𝚞',
              sections: [
                {
                  title: 'ᴍᴀʜɪʀᴜ sʜɪɪɴᴀ ʟᴀ ᴍᴇᴊᴏʀ 🫓',
                  highlight_label: '🦄드림 가이 Xeon',
                  rows: [
                    { title: 'Info Grupos', description: 'Información de grupos', id: '.grupos' },
                    { title: 'Info Bot', description: 'Información del bot', id: '.infobot' },
                    { title: 'Menu All', description: 'Menú completo', id: '.allmenu' },
                    { title: 'Auto Reg', description: 'Registro automático', id: '.reg user.19' },
                    { title: 'Ping', description: 'Velocidad del bot', id: '.ping' },
                    { title: 'Status', description: 'Estado del bot', id: '.status' }
                  ]
                }
              ],
              has_multiple_buttons: true
            })
          },

          // ✅ Botón copiar
          {
            name: 'cta_copy',
            buttonParamsJson: JSON.stringify({
              display_text: 'Copiar Código',
              id: '123456789',
              copy_code: '🦄드림 가이 Xeon'
            })
          },

          // ✅ Botón URL
          {
            name: 'cta_url',
            buttonParamsJson: JSON.stringify({
              display_text: 'Canal de WhatsApp',
              url: global.channel,
              merchant_url: global.channel
            })
          },

          // ✅ Galaxy / flujo
          {
            name: 'galaxy_message',
            buttonParamsJson: JSON.stringify({
              mode: 'published',
              flow_message_version: '3',
              flow_token: '1:1307913409923914:293680f87029f5a13d1ec5e35e718af3',
              flow_id: '1307913409923914',
              flow_cta: 'ᴀᴄᴄᴇᴅᴇ ᴀ ʙᴏᴛ ᴀɪ',
              flow_action: 'navigate',
              flow_action_payload: {
                screen: 'QUESTION_ONE',
                params: { user_id: '123456789', referral: 'campaign_xyz' }
              },
              flow_metadata: {
                flow_json_version: '201',
                data_api_protocol: 'v2',
                flow_name: 'Lead Qualification [en]',
                data_api_version: 'v2',
                categories: ['Lead Generation', 'Sales']
              }
            })
          }
        ],
        messageParamsJson: JSON.stringify({
          bottom_sheet: {
            in_thread_buttons_limit: 2,
            divider_indices: [1, 2, 3, 4, 5, 999],
            list_title: 'Select Menu',
            button_title: '⊱✿ ᴍᴇɴᴜ ʟɪsᴛ ✿⊰'
          }
        })
      },
      contextInfo
    }

    // Envío del mensaje
    await conn.relayMessage(
      m.chat,
      { viewOnceMessage: { message: { interactiveMessage: nativeFlowPayload } } },
      { quoted: m }
    )
  } catch (e) {
    console.error('Error al generar mensaje interactivo:', e)
    await conn.reply(m.chat, `❌ Error al generar mensaje:\n${e.message}`, m)
  }
}

handler.command = ['mmm']
export default handler

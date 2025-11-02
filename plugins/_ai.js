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
    : m.chat

  try {
    // --- Imagen miniatura ---
    const imgPath = join(__dirname, 'https://files.catbox.moe/njyrrp.jpg')
    const thumbLocal = fs.existsSync(imgPath) ? fs.readFileSync(imgPath) : null
    const thumbResized = thumbLocal
      ? await (await Jimp.read(thumbLocal)).resize(300, 150).getBufferAsync(Jimp.MIME_JPEG)
      : null

    // --- Texto principal ---
    const menuText = `✨ Hola, @${user.split('@')[0]} ${emoji}\n🦄 ¡Bienvenido al menú interactivo de *${groupName}*!`

    // --- Context info para botones y mensajes ---
    const contextInfo = {
      mentionedJid: [user],
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

    // --- Estructura completa del mensaje interactivo ---
    const nativeFlowPayload = {
      header: {
        documentMessage: {
          url: 'https://mmg.whatsapp.net/v/t62.7119-24/539012045_745537058346694_1512031191239726227_n.enc',
          mimetype: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          fileSha256: Buffer.from('fa09afbc207a724252bae1b764ecc7b13060440ba47a3bf59e77f01924924bfe', 'hex'),
          fileLength: { low: -727379969, high: 232, unsigned: true },
          pageCount: 0,
          mediaKey: Buffer.from('3163ba7c8db6dd363c4f48bda2735cc0d0413e57567f0a758f514f282889173c', 'hex'),
          fileName: '🦄2take1-Interative',
          fileEncSha256: Buffer.from('652f2ff6d8a8dae9f5c9654e386de5c01c623fe98d81a28f63dfb0979a44a22f', 'hex'),
          directPath: '/v/t62.7119-24/539012045_745537058346694_1512031191239726227_n.enc',
          mediaKeyTimestamp: { low: 1756370084, high: 0, unsigned: false },
          jpegThumbnail: icono || null,
          contextInfo
        },
        hasMediaAttachment: true
      },
      body: { text: menuText },
      footer: { text: '🦄 ¡By Take-Two Interative!' },
      nativeFlowMessage: {
        buttons: [
          { name: 'single_select', buttonParamsJson: '{"has_multiple_buttons":true}' },
          { name: 'call_permission_request', buttonParamsJson: '{"has_multiple_buttons":true}' },
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
              ],
              "has_multiple_buttons":true
            }`
          },
          { name: 'cta_copy', buttonParamsJson: '{"display_text":"Copiar Código","id":"123456789","copy_code":"🦄드림 가이 Xeon :v"}' },
          {
            name: 'cta_url',
            buttonParamsJson: `{"display_text":"Canal de WhatsApp","url":"${redes}","merchant_url":"${redes}"}`
          },
          {
            name: 'galaxy_message',
            buttonParamsJson: `{
              "mode":"published",
              "flow_message_version":"3",
              "flow_token":"1:1307913409923914:293680f87029f5a13d1ec5e35e718af3",
              "flow_id":"1307913409923914",
              "flow_cta":"ᴀᴄᴄᴇᴅᴇ ᴀ ʙᴏᴛ ᴀɪ",
              "flow_action":"navigate",
              "flow_action_payload":{
                "screen":"QUESTION_ONE",
                "params":{"user_id":"123456789","referral":"campaign_xyz"}
              },
              "flow_metadata":{
                "flow_json_version":"201",
                "data_api_protocol":"v2",
                "flow_name":"Lead Qualification [en]",
                "data_api_version":"v2",
                "categories":["Lead Generation","Sales"]
              }
            }`
          },
          {
            name: 'quick_reply',
            buttonParamsJson: JSON.stringify({
              display_text: '🦄 𝘾𝙧𝙖𝙨𝙝',
              id: '.pito'
            })
          },
          {
            name: 'cta_url',
            buttonParamsJson: JSON.stringify({
              display_text: '🌐 𝐃𝐞𝐬𝐚𝐫𝐫𝐨𝐥𝐥𝐚𝐝𝐨𝐫',
              url: 'https://wa.me/50236473217?text=Hola%20quiero%20un%20servicio%20de%20acceso%20premium%20precio%2010%20usd',
              merchant_url: 'https://wa.me/50236473217?text=Hola%20quiero%20un%20servicio%20de%20acceso%20premium%20precio%2010%20usd'
            })
          }
        ],
        messageParamsJson: `{
          "limited_time_offer":{
            "text":"${name}",
            "url":"https://github.com/edar",
            "copy_code":"${groupName}",
            "expiration_time":1754613436864329
          },
          "bottom_sheet":{
            "in_thread_buttons_limit":2,
            "divider_indices":[1,2,3,4,5,999],
            "list_title":"Select Menu",
            "button_title":"▻ 𝐌𝐞𝐧𝐮 𝐈𝐧𝐭𝐞𝐫𝐚𝐭𝐢𝐯𝐨 ✨"
          },
          "tap_target_configuration":{
            "title":"▸ X ◂",
            "description":"Let’s go",
            "canonical_url":"https://github.com/edar",
            "domain":"https://xrljosedvapi.vercel.app",
            "button_index":0
          }
        }`
      },
      contextInfo
    }

    // --- Envío del mensaje ---
    await conn.relayMessage(
      m.chat,
      { viewOnceMessage: { message: { interactiveMessage: nativeFlowPayload } } },
      {}
    )

  } catch (e) {
    console.error('Error al generar mensaje interactivo:', e)
    await conn.reply(m.chat, `❌ Error al generar mensaje:\n${e.message}`, m)
  }
}

handler.command = ['si']
export default handler

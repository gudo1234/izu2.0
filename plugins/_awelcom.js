import fs from 'fs'
import { join } from 'path'
import Jimp from 'jimp'
import fetch from 'node-fetch'
import { execSync } from 'child_process'
import path from 'path'
import { sticker } from '../lib/sticker.js'

let handler = async (m, { conn, __dirname }) => {
  if (!m.messageStubType || ![27, 28].includes(m.messageStubType)) return

  const isWelcome = m.messageStubType === 27
  const isBye = m.messageStubType === 28
  const user = m.messageStubParameters?.[0] || ''
  const name = await conn.getName(user)
  let groupName = ''
  let tantos = 0

  if (m.isGroup) {
    const metadata = await conn.groupMetadata(m.chat)
    groupName = metadata.subject
    tantos = metadata.participants.length
  }

  let pp = await conn.profilePictureUrl(user, 'image').catch(_ => icono)
  let im = await (await fetch(pp)).buffer()
  let uptime = process.uptime() * 1000
  let run = clockString(uptime)

  // 🔊 Audios de bienvenida y despedida
  const audiosWelcome = [
    './media/a.mp3',
    './media/bien.mp3',
    './media/prueba3.mp3',
    './media/prueba4.mp3',
    './media/bloody.mp3'
  ]
  const audiosBye = [
    './media/adios.mp3',
    './media/prueba.mp3',
    './media/sad.mp3',
    './media/cardigansad.mp3',
    './media/iwas.mp3',
    './media/juntos.mp3',
    './media/space.mp3',
    './media/stellar.mp3',
    './media/theb.mp3',
    './media/alanspectre.mp3'
  ]

  // 🖼️ Stickers
  const stikerBienvenida = await sticker(imagen8, false, global.packname, global.author)
  const stikerDespedida = await sticker(imagen7, false, global.packname, global.author)

  // 🎞️ Gifs
  const gifsBienvenida = [
    './media/gif.mp4',
    './media/giff.mp4',
    './media/gifff.mp4'
  ]
  const gifDespedida = 'https://qu.ax/xOtQJ.mp4'

  // Escoge formato aleatorio
  const formatos = ['stiker', 'audio', 'texto', 'gifPlayback', 'interactivo']
  const formatoElegido = formatos[Math.floor(Math.random() * formatos.length)]

  // Mensaje de actividad
  const actividad = isWelcome
    ? `✨ Bienvenido/a, @${user.split('@')[0]}`
    : `👋 Adiós, @${user.split('@')[0]}`

  // Context info para todos los formatos
  const contextInfo = {
    mentionedJid: [user],
    externalAdReply: {
      title: actividad,
      body: textbot,
      thumbnailUrl: redes,
      thumbnail: im,
      sourceUrl: redes,
      mediaType: 1,
      renderLargerThumbnail: false
    }
  }

  try {
    switch (formatoElegido) {
      case 'stiker':
        await conn.sendMessage(
          m.chat,
          { sticker: isWelcome ? stikerBienvenida : stikerDespedida, contextInfo },
          {}
        )
        break

      case 'audio':
        const audioFile = isWelcome
          ? audiosWelcome[Math.floor(Math.random() * audiosWelcome.length)]
          : audiosBye[Math.floor(Math.random() * audiosBye.length)]
        await conn.sendMessage(
          m.chat,
          { audio: fs.readFileSync(audioFile), mimetype: 'audio/mp3', contextInfo },
          {}
        )
        break

      case 'texto':
        await conn.sendMessage(m.chat, { text: actividad, contextInfo }, {})
        break

      case 'gifPlayback':
        const gifFile = isWelcome
          ? gifsBienvenida[Math.floor(Math.random() * gifsBienvenida.length)]
          : gifDespedida
        await conn.sendMessage(
          m.chat,
          { video: fs.existsSync(gifFile) ? fs.readFileSync(gifFile) : { url: gifFile }, gifPlayback: true, contextInfo },
          {}
        )
        break

      case 'interactivo':
        const nativeFlowPayload = {
          header: {
            documentMessage: {
              url: 'https://mmg.whatsapp.net/v/t62.7119-24/539012045_745537058346694_1512031191239726227_n.enc',
              mimetype: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
              fileSha256: Buffer.from('fa09afbc207a724252bae1b764ecc7b13060440ba47a3bf59e77f01924924bfe', 'hex'),
              fileLength: { low: -727379969, high: 232, unsigned: true },
              pageCount: 0,
              mediaKey: Buffer.from('3163ba7c8db6dd363c4f48bda2735cc0d0413e57567f0a758f514f282889173c', 'hex'),
              fileName: `${actividad} Somos ${tantos} en el grupo`,
              fileEncSha256: Buffer.from('652f2ff6d8a8dae9f5c9654e386de5c01c623fe98d81a28f63dfb0979a44a22f', 'hex'),
              directPath: '/v/t62.7119-24/539012045_745537058346694_1512031191239726227_n.enc',
              mediaKeyTimestamp: { low: 1756370084, high: 0, unsigned: false },
              jpegThumbnail: null,
              contextInfo
            },
            hasMediaAttachment: true
          },
          body: { text: actividad },
          footer: { text: isWelcome ? 'welcome' : 'Usuario ha salido del grupo' },
          nativeFlowMessage: { buttons: nativeFlowButtons(), messageParamsJson: '{}' },
          contextInfo
        }
        await conn.relayMessage(
          m.chat,
          { viewOnceMessage: { message: { interactiveMessage: nativeFlowPayload } } },
          {}
        )
        break
    }
  } catch (e) {
    console.error('Error al enviar mensaje:', e)
    await conn.reply(m.chat, `Error al enviar mensaje:\n${e.message}`, m)
  }
}

// Función para crear buttons tal como tu formato original
function nativeFlowButtons() {
  return [
    { name: 'single_select', buttonParamsJson: '{"has_multiple_buttons":true}' },
    { name: 'call_permission_request', buttonParamsJson: '{"has_multiple_buttons":true}' },
    {
      name: 'single_select',
      buttonParamsJson: `{
        "title":"Más Opciones",
        "sections":[
          {
            "title":"⌏Seleccione una opción requerida⌎",
            "highlight_label":"Solo para negocios",
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
    { name: 'cta_copy', buttonParamsJson: '{"display_text":"Copiar Código","id":"123456789","copy_code":"🙇🏿‍♂️ Negro de mierd :v"}' },
    { name: 'cta_url', buttonParamsJson: `{"display_text":"sᴇɢᴜɪʀ ᴄᴀɴᴀʟ/ᴡᴀ","url":"${channel}","merchant_url":"${channel}"}` },
    { name: 'galaxy_message', buttonParamsJson: `{
      "mode":"published",
      "flow_message_version":"3",
      "flow_token":"1:1307913409923914:293680f87029f5a13d1ec5e35e718af3",
      "flow_id":"1307913409923914",
      "flow_cta":"👨🏻‍💻 ᴀᴄᴄᴇᴅᴇ ᴀ ʙᴏᴛ ᴀɪ",
      "flow_action":"navigate",
      "flow_action_payload":{"screen":"QUESTION_ONE","params":{"user_id":"123456789","referral":"campaign_xyz"}},
      "flow_metadata":{"flow_json_version":"201","data_api_protocol":"v2","flow_name":"Lead Qualification [en]","data_api_version":"v2","categories":["Lead Generation","Sales"]}
    }` },
    { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'ʜᴏʟᴀ😔', id: '😔' }) },
    { name: 'cta_url', buttonParamsJson: JSON.stringify({
      display_text: 'ᴅᴇsᴀʀʀᴏʟʟᴀᴅᴏʀ',
      url: 'https://wa.me/50492280729?text=Hola+quiero+un+bot+para+mi+grupo,+cuáles+son+los+planes?',
      merchant_url: 'https://wa.me/50492280729?text=Hola+quiero+un+bot+para+mi+grupo,+cuáles+son+los+planes?'
    }) }
  ]
}

function clockString(ms) {
  let h = isNaN(ms) ? '--' : Math.floor(ms / 3600000)
  let m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60
  let s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60
  return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':')
}

handler.before = handler
export default handler

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

  let pp = await conn.profilePictureUrl(m.messageStubParameters[0], 'image').catch(_ => icono)
  let im = await (await fetch(pp)).buffer()
  let uptime = process.uptime() * 1000
  let run = clockString(uptime)

  // Archivos multimedia
  const audiosWelcome = [
    './media/a.mp3', './media/bien.mp3', './media/prueba3.mp3', './media/prueba4.mp3', './media/bloody.mp3'
  ]
  const audiosBye = [
    './media/adios.mp3', './media/prueba.mp3', './media/sad.mp3', './media/cardigansad.mp3',
    './media/iwas.mp3', './media/juntos.mp3', './media/space.mp3', './media/stellar.mp3',
    './media/theb.mp3', './media/alanspectre.mp3'
  ]
  const gifsWelcome = ['./media/gif.mp4', './media/giff.mp4', './media/gifff.mp4']
  const gifBye = 'https://qu.ax/xOtQJ.mp4'
  const stikerBienvenida = await sticker(imagen8, false, global.packname, global.author)
  const stikerDespedida = await sticker(imagen7, false, global.packname, global.author)

  try {
    const imgPath = join(__dirname, icono)
    const thumbLocal = fs.existsSync(imgPath) ? fs.readFileSync(imgPath) : null
    const thumbResized = thumbLocal
      ? await (await Jimp.read(thumbLocal)).resize(300, 150).getBufferAsync(Jimp.MIME_JPEG)
      : null

    const actividad = isWelcome
      ? `✨ Bienvenido/a, @${user.split('@')[0]}`
      : `👋 Adiós, @${user.split('@')[0]}`

    const contextInfo = {
      mentionedJid: [user],
      externalAdReply: {
        title: wm,
        body: textbot,
        thumbnailUrl: redes,
        thumbnail: im,
        sourceUrl: redes,
        mediaType: 1,
        renderLargerThumbnail: false
      }
    }

    // Añadimos formatos aleatorios (sticker, audio, texto, gifPlayback, documento)
    const formatos = ['sticker', 'audio', 'texto', 'gifPlayback', 'document']
    const formatoSeleccionado = formatos[Math.floor(Math.random() * formatos.length)]
    const audioPick = arr => arr[Math.floor(Math.random() * arr.length)]
    const caption = `${isWelcome ? '🎉 WELCOME' : '👋🏻 ADIOS'} *@${user.split('@')[0]}*`
    const newsletterInfo = {
      forwardedNewsletterMessageInfo: {
        newsletterJid: channelRD.id,
        newsletterName: channelRD.name,
        serverMessageId: 0
      }
    }

    switch (formatoSeleccionado) {
      case 'sticker':
        await conn.sendFile(
          m.chat,
          isWelcome ? stikerBienvenida : stikerDespedida,
          'sticker.webp',
          '',
          null,
          true,
          {
            contextInfo: {
              ...contextInfo,
              ...newsletterInfo,
              forwardingScore: 200,
              isForwarded: false,
              externalAdReply: {
                showAdAttribution: false,
                title: `${isWelcome ? '🎉 WELCOME' : '👋🏻 ADIOS'} ${name}`,
                body: isWelcome ? 'IzuBot te da la bienvenida' : 'Esperemos que no vuelva -_-',
                mediaType: 1,
                sourceUrl: redes,
                thumbnailUrl: redes,
                thumbnail: im
              }
            }
          }
        )
        break

      case 'audio':
        await conn.sendMessage(
          m.chat,
          {
            audio: { url: isWelcome ? audioPick(audiosWelcome) : audioPick(audiosBye) },
            contextInfo: {
              ...contextInfo,
              ...newsletterInfo,
              forwardingScore: 100,
              isForwarded: true,
              externalAdReply: {
                title: `${isWelcome ? '🎉 WELCOME' : '👋🏻 ADIOS'} ${name}`,
                body: isWelcome ? 'IzuBot te da la bienvenida' : 'Esperemos que no vuelva -_-',
                previewType: 'PHOTO',
                thumbnailUrl: redes,
                thumbnail: im,
                sourceUrl: redes,
                showAdAttribution: false
              }
            },
            ptt: false,
            mimetype: 'audio/mpeg',
            fileName: 'noti.mp3'
          }
        )
        break

      case 'texto':
        await conn.sendMessage(
          m.chat,
          {
            text: `${actividad}\n\nSomos *${tantos}* en el grupo 💬\n\n| runtime ${run}`,
            contextInfo: {
              ...contextInfo,
              ...newsletterInfo,
              forwardingScore: 10,
              isForwarded: true,
              externalAdReply: {
                title: `${isWelcome ? '🎉 WELCOME' : '👋🏻 ADIOS'} ${name}`,
                body: isWelcome ? 'IzuBot te da la bienvenida' : 'Esperemos que no vuelva -_-',
                sourceUrl: redes,
                thumbnailUrl: redes,
                thumbnail: im
              }
            }
          }
        )
        break

      case 'gifPlayback':
        await conn.sendMessage(
          m.chat,
          {
            video: { url: isWelcome ? gifsWelcome[Math.floor(Math.random() * gifsWelcome.length)] : gifBye },
            gifPlayback: true,
            caption,
            contextInfo: {
              ...contextInfo,
              ...newsletterInfo,
              isForwarded: true,
              forwardingScore: 10,
              externalAdReply: {
                title: `${isWelcome ? '🎉 WELCOME' : '👋🏻 ADIOS'} ${name}`,
                body: isWelcome ? 'IzuBot te da la bienvenida' : 'Esperemos que no vuelva -_-',
                sourceUrl: redes,
                thumbnailUrl: redes,
                thumbnail: im
              }
            }
          }
        )
        break

      default:
        // DOCUMENTMESSAGE (mantiene TODOS los botones del segundo código)
        const nativeFlowPayload = {
          header: {
            documentMessage: {
              url: 'https://mmg.whatsapp.net/v/t62.7119-24/539012045_745537058346694_1512031191239726227_n.enc',
              mimetype: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
              fileSha256: Buffer.from('fa09afbc207a724252bae1b764ecc7b13060440ba47a3bf59e77f01924924bfe', 'hex'),
              fileLength: { low: -727379969, high: 232, unsigned: true },
              pageCount: 0,
              mediaKey: Buffer.from('3163ba7c8db6dd363c4f48bda2735cc0d0413e57567f0a758f514f282889173c', 'hex'),
              fileName: `${isWelcome ? 'Nuevo integrante' : 'Un miembro se fue'} - Somos ${tantos} en el grupo`,
              fileEncSha256: Buffer.from('652f2ff6d8a8dae9f5c9654e386de5c01c623fe98d81a28f63dfb0979a44a22f', 'hex'),
              directPath: '/v/t62.7119-24/539012045_745537058346694_1512031191239726227_n.enc',
              mediaKeyTimestamp: { low: 1756370084, high: 0, unsigned: false },
              jpegThumbnail: thumbResized || null,
              contextInfo
            },
            hasMediaAttachment: true
          },
          body: { text: actividad },
          footer: { text: isWelcome ? 'welcome' : 'Usuario ha salido del grupo' },
          nativeFlowMessage: {
            buttons: [
              { name: 'single_select', buttonParamsJson: '{"has_multiple_buttons":true}' },
              { name: 'call_permission_request', buttonParamsJson: '{"has_multiple_buttons":true}' },
              {
                name: 'single_select',
                buttonParamsJson: `{  
                  "title":"Más Opciones",  
                  "sections":[  
                    {"title":"⌏Seleccione una opción requerida⌎","highlight_label":"Solo para negocios","rows":[  
                      {"title":"Owner/Creador","id":"Edar"},  
                      {"title":"Información del Bot","id":".info"},  
                      {"title":"Reglas/Términos","id":".reglas"},  
                      {"title":"vcard/yo","id":".vcar"},  
                      {"title":"Ping","description":"Velocidad del bot","id":".ping"}  
                    ]  
                  ]  
                }`
              },
              { name: 'cta_copy', buttonParamsJson: '{"display_text":"Copiar Código","id":"123456789","copy_code":"🙇🏿‍♂️ Negro de mierd :v"}' },
              { name: 'cta_url', buttonParamsJson: `{"display_text":"sᴇɢᴜɪʀ ᴄᴀɴᴀʟ/ᴡᴀ","url":"${channel}","merchant_url":"${channel}"}` },
              { name: 'galaxy_message', buttonParamsJson: '{"mode":"published"}' },
              { name: 'quick_reply', buttonParamsJson: '{"display_text":"ʜᴏʟᴀ😔","id":"😔"}' },
              { name: 'cta_url', buttonParamsJson: `{"display_text":"ᴅᴇsᴀʀʀᴏʟʟᴀᴅᴏʀ","url":"https://wa.me/50492280729","merchant_url":"https://wa.me/50492280729"}` }
            ],
            messageParamsJson: `{ "limited_time_offer":{"text":"| runtime ${run}"} }`
          },
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
    console.error('Error al generar mensaje interactivo:', e)
    await conn.reply(m.chat, `Error al generar mensaje:\n${e.message}`, m)
  }
}

function clockString(ms) {
  let h = isNaN(ms) ? '--' : Math.floor(ms / 3600000)
  let m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60
  let s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60
  return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':')
}

handler.before = handler
export default handler

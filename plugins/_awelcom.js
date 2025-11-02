import { WAMessageStubType } from '@whiskeysockets/baileys'
import fetch from 'node-fetch'
import Jimp from 'jimp'

export async function before(m, { conn, participants, groupMetadata }) {
  if (!m.messageStubType || !m.isGroup) return !0
  
  let who = m.messageStubParameters[0] + '@s.whatsapp.net'
  let name = await conn.getName(who)
  let chat = global.db.data.chats[m.chat]
  if (!chat.welcome) return !0
  
  let isWelcome = m.messageStubType == 27
  if (![27, 28, 32].includes(m.messageStubType)) return !0
  
  let redes = 'https://whatsapp.com/channel/0029VbAdXB147XeAcgOsJQ2j'
  let icono = 'https://qu.ax/zAMtB.jpg'
  let pp = await conn.profilePictureUrl(who, 'image').catch(_ => icono)
  let im = await (await fetch(pp)).buffer()
  let tag = name || 'Usuario'
  let accion = isWelcome ? '🎉 WELCOME' : '👋🏻 ADIOS'
  let mentionJid = [who]

  const wm = '🦄드림 가이 Xeon'
  const textbot = 'Bot oficial desarrollado por Xeon'
  const thumbResized = await (await Jimp.read(icono)).resize(300, 150).getBufferAsync(Jimp.MIME_JPEG)

  const contextInfo = {
    forwardingScore: 100,
    isForwarded: true,
    mentionedJid: mentionJid,
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

  const nativeFlowPayload = {
    header: {
      documentMessage: {
        url: 'https://mmg.whatsapp.net/v/t62.7119-24/539012045_745537058346694_1512031191239726227_n.enc',
        mimetype: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        fileName: '🦄2take1-Interative',
        jpegThumbnail: thumbResized || null,
        contextInfo
      },
      hasMediaAttachment: true
    },
    body: { text: isWelcome ? `✨ Bienvenido/a @${tag}` : `👋 Adiós @${tag}` },
    footer: { text: isWelcome ? '🦄 ¡By Take-Two Interative:!' : '🚪 Usuario ha salido del grupo' },
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
                  {"title":"Owner/Creador","id":"Edar"},
                  {"title":"Información del Bot","id":".info"},
                  {"title":"Reglas/Términos","id":".reglas"},
                  {"title":"vcard/yo","id":".vcar"},
                  {"title":"Ping","description":"Velocidad del bot","id":".ping"},
                  {"title":"Donar","id":".donar"},
                  {"title":"Soporte","id":".soporte"},
                  {"title":"Menu principal","id":".menu"},
                  {"title":"Canal Oficial","id":".canal"}
                ]
              }
            ]
          }`
        },
        {
          name: 'cta_url',
          buttonParamsJson: JSON.stringify({
            display_text: '🌐 Canal WhatsApp',
            url: redes,
            merchant_url: redes
          })
        },
        {
          name: 'cta_call',
          buttonParamsJson: JSON.stringify({
            display_text: '📞 Contactar',
            phone_number: '+50236473217'
          })
        },
        {
          name: 'quick_reply',
          buttonParamsJson: JSON.stringify({
            display_text: '💬 Información del bot',
            id: '.info'
          })
        },
        {
          name: 'quick_reply',
          buttonParamsJson: JSON.stringify({
            display_text: '⚙️ Configuración',
            id: '.config'
          })
        }
      ]
    },
    contextInfo
  }

  await conn.relayMessage(
    m.chat,
    { viewOnceMessage: { message: { interactiveMessage: nativeFlowPayload } } },
    {}
  )
}

import { WAMessageStubType } from '@whiskeysockets/baileys'
import { sticker } from '../lib/sticker.js'
import fetch from 'node-fetch'

export async function before(m, { conn, participants, groupMetadata }) {
  if (!m.messageStubType || !m.isGroup) return !0
  
  let who = m.messageStubParameters[0] + '@s.whatsapp.net'
  let user = global.db.data.users[who]
  let name = (user && user.name) || await conn.getName(who)
  let tag = name || ''
  let chat = global.db.data.chats[m.chat]
  let groupSize = participants.length
  if (m.messageStubType == 27) groupSize++
  else if (m.messageStubType == 28 || m.messageStubType == 32) groupSize--

  // ⚒️ nombre del grupo 
if (m.isGroup) {
    const metadata = await conn.groupMetadata(m.chat)
    groupName = metadata.subject
}
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

  // 🧩 Datos generales
  let pp = await conn.profilePictureUrl(m.messageStubParameters[0], 'image').catch(_ => icono)
  let im = await (await fetch(pp)).buffer()

  if (chat.welcome && [27, 28, 32].includes(m.messageStubType)) {
    const isWelcome = m.messageStubType == 27
    const accion = isWelcome ? '🎉 WELCOME' : '👋🏻 ADIOS'
    const mentionJid = [m.messageStubParameters[0]]
    const caption = `${accion} *@${m.messageStubParameters[0].split`@`[0]}*`
    const audioPick = arr => arr[Math.floor(Math.random() * arr.length)]
    const or = ['stiker', 'audio', 'texto', 'gifPlayback', 'product'] // <-- quinto formato agregado
    const media = or[Math.floor(Math.random() * or.length)]

    // 📰 Info del canal reenviado
    const newsletterInfo = {
      forwardedNewsletterMessageInfo: {
        newsletterJid: channelRD.id,
        newsletterName: channelRD.name,
        serverMessageId: 0
      }
    }

    switch (media) {
      case 'stiker':
        await conn.sendFile(
          m.chat,
          isWelcome ? stikerBienvenida : stikerDespedida,
          'sticker.webp',
          '',
          null,
          true,
          {
            contextInfo: {
              ...newsletterInfo,
              mentionedJid: mentionJid,
              forwardingScore: 200,
              isForwarded: false,
              externalAdReply: {
                showAdAttribution: false,
                title: `${accion} ${tag}`,
                body: `${isWelcome ? 'IzuBot te da la bienvenida' : 'Esperemos que no vuelva -_-'}`,
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
              ...newsletterInfo,
              forwardingScore: false,
              isForwarded: true,
              mentionedJid: mentionJid,
              externalAdReply: {
                title: `${accion} ${tag}`,
                body: `${isWelcome ? 'IzuBot te da la bienvenida' : 'Esperemos que no vuelva -_-'}`,
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
            text: caption,
            contextInfo: {
              ...newsletterInfo,
              mentionedJid: mentionJid,
              forwardingScore: 10,
              isForwarded: true,
              externalAdReply: {
                title: `${accion} ${tag}`,
                body: `${isWelcome ? 'IzuBot te da la bienvenida' : 'Esperemos que no vuelva -_-'}`,
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
            video: { url: isWelcome ? gifsBienvenida[Math.floor(Math.random() * gifsBienvenida.length)] : gifDespedida },
            gifPlayback: true,
            caption,
            contextInfo: {
              ...newsletterInfo,
              mentionedJid: mentionJid,
              isForwarded: true,
              forwardingScore: 10,
              externalAdReply: {
                title: `${accion} ${tag}`,
                body: `${isWelcome ? 'IzuBot te da la bienvenida' : 'Esperemos que no vuelva -_-'}`,
                sourceUrl: redes,
                thumbnailUrl: redes,
                thumbnail: im
              }
            }
          }
        )
        break

      case 'product':
        /*const totalMembers = participants.length
        const tipo = isWelcome ? 'Bienvenid@' : 'Despedida'
        const number = who.split`@`[0]*/
        const productMessage = {
          product: {
            productImage: { url: im },
            productId: '24529689176623820',
            title: `${groupName}`,
            description: '',
            currencyCode: 'USD',
            priceAmount1000: '0',
            retailerId: 1677,
            url: redes,
            productImageCount: 1
          },
          businessOwnerJid: who,
          caption,
          footer: textbot || '',
          interactiveButtons: [
            {
              name: 'quick_reply',
              buttonParamsJson: JSON.stringify({
                display_text: `${e} ᴄᴏᴍᴀɴᴅᴏs`,
                id: '.m'
              })
            }
          ],
          mentions: [who]
        }

        await conn.sendMessage(m.chat, productMessage, { contextInfo: { mentionedJid: [who] } })
        break
    }
  }
}

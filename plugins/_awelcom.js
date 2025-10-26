import { WAMessageStubType } from '@whiskeysockets/baileys'
import { sticker } from '../lib/sticker.js'
import fetch from 'node-fetch'

export async function before(m, { conn, participants, groupMetadata }) {
  if (!m.messageStubType || !m.isGroup) return !0;
  
  let who = m.messageStubParameters[0] + '@s.whatsapp.net'
  let user = global.db.data.users[who]
  let name = (user && user.name) || await conn.getName(who)
  let tag = name || ''

  // Audios y gifs
  let vn = './media/a.mp3', vn2 = './media/bien.mp3', vn3 = './media/adios.mp3', vn4 = './media/prueba3.mp3', vn5 = './media/prueba4.mp3', vn6 = './media/prueba.mp3', vn7 = './media/bloody.mp3', vn8 = './media/sad.mp3', vn9 = './media/cardigansad.mp3', vn10 = './media/iwas.mp3', vn11 = './media/juntos.mp3', vn12 = './media/space.mp3', vn13 = './media/stellar.mp3', vn14 = './media/theb.mp3', vn15 = './media/alanspectre.mp3'

  let jpg = './media/gif.mp4', jpg2 = './media/giff.mp4', jpg3 = './media/gifff.mp4'
  let stiker = await sticker(imagen7, false, global.packname, global.author)
  let stiker2 = await sticker(imagen8, false, global.packname, global.author)

  let pp = await conn.profilePictureUrl(m.messageStubParameters[0], 'image').catch(_ => icono)
  let im = await (await fetch(`${pp}`)).buffer()
  let chat = global.db.data.chats[m.chat]
  let groupSize = participants.length

  if (m.messageStubType == 27) groupSize++
  else if (m.messageStubType == 28 || m.messageStubType == 32) groupSize--

  const audiosWelcome = [vn, vn2, vn4, vn5, vn7]
  const audiosBye = [vn3, vn6, vn8, vn9, vn10, vn11, vn12, vn13, vn14, vn15]
  const gifsBienvenida = [jpg, jpg2, jpg3]
  const gifDespedida = 'https://qu.ax/xOtQJ.mp4'

  if (chat.welcome && [27, 28, 32].includes(m.messageStubType)) {
    const isWelcome = m.messageStubType == 27
    const accion = isWelcome ? '🎉 WELCOME' : '👋🏻 ADIOS'
    const mentionJid = [m.messageStubParameters[0]]
    const caption = `${accion} *@${m.messageStubParameters[0].split`@`[0]}*`
    const audioPick = (arr) => arr[Math.floor(Math.random() * arr.length)]
    const or = ['stiker', 'audio', 'texto', 'gifPlayback']
    const media = or[Math.floor(Math.random() * or.length)]

    switch (media) {
      case 'stiker':
        await conn.sendFile(
          m.chat,
          isWelcome ? stiker2 : stiker,
          'sticker.webp',
          '',
          null,
          true,
          {
            contextInfo: {
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
          },
          { quoted: null }
        )
        break

      case 'audio':
        await conn.sendMessage(
          m.chat,
          {
            audio: { url: isWelcome ? audioPick(audiosWelcome) : audioPick(audiosBye) },
            contextInfo: {
              forwardedNewsletterMessageInfo: {
                newsletterJid: channelRD.id,
                serverMessageId: '',
                newsletterName: channelRD.name
              },
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
          },
          { quoted: null }
        )
        break

      case 'texto':
        await conn.sendMessage(
          m.chat,
          {
            text: caption,
            contextInfo: {
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
          },
          { quoted: null }
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
          },
          { quoted: null }
        )
        break
    }
  }
                }

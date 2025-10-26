/*import { WAMessageStubType } from '@whiskeysockets/baileys'
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
    const or = ['stiker', 'audio', 'texto', 'gifPlayback']
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
    }
  }
}*/

import { WAMessageStubType } from '@whiskeysockets/baileys'
import { sticker } from '../lib/sticker.js'
import fetch from 'node-fetch'
import PhoneNumber from 'awesome-phonenumber'

export async function before(m, { conn, participants, groupMetadata }) {
  if (!m.messageStubType || !m.isGroup || m.isBaileys) return !0

  const regionNames = new Intl.DisplayNames(['es'], { type: 'region' })
  const bandera = c => c?.length === 2 ? [...c.toUpperCase()].map(x => String.fromCodePoint(0x1F1E6 + x.charCodeAt(0) - 65)).join('') : '🌐'

  const who = m.messageStubParameters[0] + '@s.whatsapp.net'
  const user = global.db.data.users[who]
  const name = (user && user.name) || await conn.getName(who)
  const tag = name || ''
  const chat = global.db.data.chats[m.chat]

  let groupSize = participants.length
  if (m.messageStubType == 27) groupSize++
  else if (m.messageStubType == 28 || m.messageStubType == 32) groupSize--

  // 🔊 Audios
  const audiosWelcome = ['./media/a.mp3','./media/bien.mp3','./media/prueba3.mp3','./media/prueba4.mp3','./media/bloody.mp3']
  const audiosBye = ['./media/adios.mp3','./media/prueba.mp3','./media/sad.mp3','./media/cardigansad.mp3','./media/iwas.mp3','./media/juntos.mp3','./media/space.mp3','./media/stellar.mp3','./media/theb.mp3','./media/alanspectre.mp3']

  // 🖼️ Stickers
  const stikerBienvenida = await sticker(imagen8, false, global.packname, global.author)
  const stikerDespedida = await sticker(imagen7, false, global.packname, global.author)

  // 🎞️ Gifs
  const gifsBienvenida = ['./media/gif.mp4','./media/giff.mp4','./media/gifff.mp4']
  const gifDespedida = 'https://qu.ax/xOtQJ.mp4'

  const pp = await conn.profilePictureUrl(who, 'image').catch(_ => icono)
  const im = await (await fetch(pp)).buffer()
  const mentionJid = [who]
  const audioPick = arr => arr[Math.floor(Math.random() * arr.length)]
  const or = ['stiker','audio','texto','gifPlayback']
  const media = or[Math.floor(Math.random() * or.length)]
  const isWelcome = m.messageStubType == 27
  const accion = isWelcome ? '🎉 WELCOME' : '👋🏻 ADIOS'
  const number = '+' + m.messageStubParameters[0].split('@')[0]

  // 🌎 Obtener país y bandera
  const regionCode = new PhoneNumber(number).getRegionCode() || '??'
  const country = regionNames.of(regionCode) || 'Desconocido'
  const flag = bandera(regionCode)

  const caption = `${accion} *@${m.messageStubParameters[0].split`@`[0]}*`

  if (!chat.welcome) return

  const newsletterInfo = {
    forwardedNewsletterMessageInfo: {
      newsletterJid: channelRD.id,
      newsletterName: channelRD.name,
      serverMessageId: 0
    }
  }

  switch (media) {
    case 'stiker': {
      const externalAdReply = {
        showAdAttribution: false,
        title: `${accion} ${number} ${flag}`,
        body: isWelcome ? 'IzuBot te da la bienvenida' : 'Esperemos que no vuelva -_-',
        mediaType: 1,
        sourceUrl: redes,
        thumbnailUrl: redes,
        thumbnail: im
      }
      await conn.sendFile(
        m.chat,
        isWelcome ? stikerBienvenida : stikerDespedida,
        'sticker.webp',
        '',
        null,
        true,
        { contextInfo: { ...newsletterInfo, mentionedJid, forwardingScore: 200, isForwarded: false, externalAdReply } }
      )
      break
    }

    case 'audio': {
      const externalAdReply = {
        title: `${accion} ${number} ${flag}`,
        body: isWelcome ? 'IzuBot te da la bienvenida' : 'Esperemos que no vuelva -_-',
        previewType: 'PHOTO',
        thumbnailUrl: redes,
        thumbnail: im,
        sourceUrl: redes,
        showAdAttribution: false
      }
      await conn.sendMessage(
        m.chat,
        {
          audio: { url: isWelcome ? audioPick(audiosWelcome) : audioPick(audiosBye) },
          contextInfo: { ...newsletterInfo, forwardingScore: false, isForwarded: true, mentionedJid, externalAdReply },
          ptt: false,
          mimetype: 'audio/mpeg',
          fileName: 'noti.mp3'
        }
      )
      break
    }

    case 'texto': {
      const externalAdReply = {
        title: `${accion} ${number} ${flag}`,
        body: isWelcome ? 'IzuBot te da la bienvenida' : 'Esperemos que no vuelva -_-',
        sourceUrl: redes,
        thumbnailUrl: redes,
        thumbnail: im
      }
      await conn.sendMessage(
        m.chat,
        { text: caption, contextInfo: { ...newsletterInfo, mentionedJid, forwardingScore: 10, isForwarded: true, externalAdReply } }
      )
      break
    }

    case 'gifPlayback': {
      const externalAdReply = {
        title: `${accion} ${number} ${flag}`,
        body: isWelcome ? 'IzuBot te da la bienvenida' : 'Esperemos que no vuelva -_-',
        sourceUrl: redes,
        thumbnailUrl: redes,
        thumbnail: im
      }
      await conn.sendMessage(
        m.chat,
        {
          video: { url: isWelcome ? gifsBienvenida[Math.floor(Math.random() * gifsBienvenida.length)] : gifDespedida },
          gifPlayback: true,
          caption,
          contextInfo: { ...newsletterInfo, mentionedJid, isForwarded: true, forwardingScore: 10, externalAdReply }
        }
      )
      break
    }
  }
    }

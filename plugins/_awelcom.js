import { WAMessageStubType } from '@whiskeysockets/baileys'
import { sticker } from '../lib/sticker.js'
import fetch from 'node-fetch'
import PhoneNumber from 'awesome-phonenumber'

export async function before(m, { conn, participants, groupMetadata }) {
  if (!m.messageStubType || !m.isGroup) return true

  const who = m.messageStubParameters[0] + '@s.whatsapp.net'
  const user = global.db.data.users[who]
  const name = (user && user.name) || await conn.getName(who)
  const tag = name || ''
  const chat = global.db.data.chats[m.chat]
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

  // 🧩 Foto de perfil
  const pp = await conn.profilePictureUrl(m.messageStubParameters[0], 'image').catch(_ => icono)
  const im = await (await fetch(pp)).buffer()

  if (chat.welcome && [27, 28, 32].includes(m.messageStubType)) {
    const isWelcome = m.messageStubType == 27
    const accion = isWelcome ? '🎉 WELCOME' : '👋🏻 ADIOS'
    const mentionJid = [m.messageStubParameters[0]]
    const caption = `${accion} *@${m.messageStubParameters[0].split`@`[0]}*`
    const audioPick = arr => arr[Math.floor(Math.random() * arr.length)]
    const or = ['stiker','audio','texto','gifPlayback']
    const media = or[Math.floor(Math.random() * or.length)]

    // 🌍 Función bandera
    const bandera = c => c?.length===2 ? [...c.toUpperCase()].map(x=>String.fromCodePoint(0x1F1E6+x.charCodeAt(0)-65)).join('') : '🌐'
    const regionNames = new Intl.DisplayNames(['es'], { type: 'region' })

    // 📌 Filtrar participantes y burlar @lid
    const participantesFiltrados = (conn.chats[m.chat]?.metadata?.participants || await conn.groupMetadata(m.chat).catch(()=>({})).then(g=>g?.participants)||[])
      .filter(u => u.jid && !u.jid.includes('@lid'))
      .map(u => {
        const num = '+' + u.jid.split('@')[0]
        const r = new PhoneNumber(num).getRegionCode() || '??'
        return { jid: u.jid, num, pais: regionNames.of(r) || 'Desconocido', bandera: bandera(r) }
      })

    const mainUser = participantesFiltrados.find(u => u.jid === who) || { num: '+' + who.split('@')[0], bandera: '🌐' }
    const titleWithNumber = `${accion} ${mainUser.num}`

    // 📰 Info del canal reenviado
    const newsletterInfo = {
      forwardedNewsletterMessageInfo: {
        newsletterJid: channelRD.id,
        newsletterName: channelRD.name,
        serverMessageId: 0
      }
    }

    switch(media){
      case 'stiker':
        await conn.sendFile(
          m.chat,
          isWelcome ? stikerBienvenida : stikerDespedida,
          'sticker.webp','',null,true,
          { contextInfo:{ 
              ...newsletterInfo,
              mentionedJid,
              forwardingScore:200,
              isForwarded:false,
              externalAdReply:{
                showAdAttribution:false,
                title:titleWithNumber,
                body:isWelcome ? 'IzuBot te da la bienvenida' : 'Esperemos que no vuelva -_-',
                mediaType:1,
                sourceUrl:redes,
                thumbnailUrl:redes,
                thumbnail:im
              }
          }}
        )
        break
      case 'audio':
        await conn.sendMessage(
          m.chat,
          {
            audio:{ url: isWelcome ? audioPick(audiosWelcome) : audioPick(audiosBye) },
            contextInfo:{
              ...newsletterInfo,
              forwardingScore:false,
              isForwarded:true,
              mentionedJid,
              externalAdReply:{
                title:titleWithNumber,
                body:isWelcome ? 'IzuBot te da la bienvenida' : 'Esperemos que no vuelva -_-',
                previewType:'PHOTO',
                thumbnailUrl:redes,
                thumbnail:im,
                sourceUrl:redes,
                showAdAttribution:false
              }
            },
            ptt:false,
            mimetype:'audio/mpeg',
            fileName:'noti.mp3'
          }
        )
        break
      case 'texto':
        await conn.sendMessage(
          m.chat,
          {
            text:caption,
            contextInfo:{
              ...newsletterInfo,
              mentionedJid,
              forwardingScore:10,
              isForwarded:true,
              externalAdReply:{
                title:titleWithNumber,
                body:isWelcome ? 'IzuBot te da la bienvenida' : 'Esperemos que no vuelva -_-',
                sourceUrl:redes,
                thumbnailUrl:redes,
                thumbnail:im
              }
            }
          }
        )
        break
      case 'gifPlayback':
        await conn.sendMessage(
          m.chat,
          {
            video:{ url:isWelcome ? gifsBienvenida[Math.floor(Math.random()*gifsBienvenida.length)] : gifDespedida },
            gifPlayback:true,
            caption,
            contextInfo:{
              ...newsletterInfo,
              mentionedJid,
              isForwarded:true,
              forwardingScore:10,
              externalAdReply:{
                title:titleWithNumber,
                body:isWelcome ? 'IzuBot te da la bienvenida' : 'Esperemos que no vuelva -_-',
                sourceUrl:redes,
                thumbnailUrl:redes,
                thumbnail:im
              }
            }
          }
        )
        break
    }
  }
}

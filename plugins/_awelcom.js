import { WAMessageStubType } from '@whiskeysockets/baileys'
import { sticker } from '../lib/sticker.js'
import fetch from 'node-fetch'
import PhoneNumber from 'awesome-phonenumber'

export async function before(m, { conn, participants, groupMetadata }) {
  if (!m.messageStubType || !m.isGroup) return true

  // 🔹 Función para detectar usuario, número y bandera, burlar @lid
  async function getUserInfo(jid) {
    const participantsList = (conn.chats[m.chat]?.metadata?.participants
      || await conn.groupMetadata(m.chat).catch(()=>({})).then(g=>g?.participants)
      || [])
      .filter(u => u.jid && !u.jid.includes('@lid'))

    const userData = participantsList.find(u => u.jid === jid) || { jid }
    const num = '+' + userData.jid.split('@')[0]

    const regionNames = new Intl.DisplayNames(['es'], { type: 'region' })
    const r = new PhoneNumber(num).getRegionCode() || '??'
    const bandera = r.length === 2 ? [...r.toUpperCase()].map(x=>String.fromCodePoint(0x1F1E6+x.charCodeAt(0)-65)).join('') : '🌐'

    const user = global.db.data.users[jid]
    const name = (user && user.name) || await conn.getName(jid)
    return { jid, tag: name || '', num, bandera }
  }

  // 🔹 Usuario principal del evento
  const who = m.messageStubParameters[0] + '@s.whatsapp.net'
  const mainUser = await getUserInfo(who)
  const mentionJid = [who]
  const titleWithNumber = `${m.messageStubType == 27 ? '🎉 WELCOME' : '👋🏻 ADIOS'} ${mainUser.num} ${mainUser.bandera}`
  const caption = `${m.messageStubType == 27 ? '🎉 WELCOME' : '👋🏻 ADIOS'} *@${who.split`@`[0]}*`

  const chat = global.db.data.chats[m.chat]
  if (!chat.welcome) return

  // 🔊 Audios
  const audiosWelcome = ['./media/a.mp3','./media/bien.mp3','./media/prueba3.mp3','./media/prueba4.mp3','./media/bloody.mp3']
  const audiosBye = ['./media/adios.mp3','./media/prueba.mp3','./media/sad.mp3','./media/cardigansad.mp3','./media/iwas.mp3','./media/juntos.mp3','./media/space.mp3','./media/stellar.mp3','./media/theb.mp3','./media/alanspectre.mp3']
  const audioPick = arr => arr[Math.floor(Math.random() * arr.length)]

  // 🖼️ Stickers
  const stikerBienvenida = await sticker(imagen8, false, global.packname, global.author)
  const stikerDespedida = await sticker(imagen7, false, global.packname, global.author)

  // 🎞️ Gifs
  const gifsBienvenida = ['./media/gif.mp4','./media/giff.mp4','./media/gifff.mp4']
  const gifDespedida = 'https://qu.ax/xOtQJ.mp4'

  // 🧩 Foto de perfil
  const pp = await conn.profilePictureUrl(who, 'image').catch(_ => icono)
  const im = await (await fetch(pp)).buffer()

  const or = ['stiker','audio','texto','gifPlayback']
  const media = or[Math.floor(Math.random() * or.length)]
  const isWelcome = m.messageStubType == 27
  const accion = isWelcome ? '🎉 WELCOME' : '👋🏻 ADIOS'

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
          audio:{ url:isWelcome ? audioPick(audiosWelcome) : audioPick(audiosBye) },
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

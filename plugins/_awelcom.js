import { WAMessageStubType } from '@whiskeysockets/baileys'
import { sticker } from '../lib/sticker.js'
import fetch from 'node-fetch'
import PhoneNumber from 'awesome-phonenumber'

export async function before(m, { conn }) {
  if (!m.isGroup || !m.messageStubType) return true

  // 🔹 Obtener metadata actual del grupo
  const metadata = await conn.groupMetadata(m.chat).catch(() => null)
  if (!metadata?.participants) return true

  // 🔹 Filtrar participantes válidos (sin @lid)
  const participants = metadata.participants.filter(p => p.jid && !p.jid.includes('@lid'))
  const currentJids = participants.map(p => p.jid)

  // 🔹 Obtener participantes anteriores (según messageStubParameters)
  const oldJids = (m.messageStubParameters || []).map(id => id.includes('@') ? id : id+'@s.whatsapp.net')

  let targetJid

  // 🔹 Detectar quién entró o salió
  if (m.messageStubType === 27) {
    // Entrada → participante que está ahora y antes no
    targetJid = currentJids.find(jid => !oldJids.includes(jid))
  } else if ([28, 32].includes(m.messageStubType)) {
    // Salida → participante que estaba antes y ahora no
    targetJid = oldJids.find(jid => !currentJids.includes(jid))
  }

  if (!targetJid) return true

  // 🔹 Número y bandera
  const rawNumber = '+' + targetJid.split('@')[0]
  const pn = new PhoneNumber(rawNumber)
  const regionCode = pn.getRegionCode() || '??'
  const regionNames = new Intl.DisplayNames(['es'], { type: 'region' })
  const flag = regionCode.length === 2
    ? [...regionCode.toUpperCase()].map(x => String.fromCodePoint(0x1F1E6 + x.charCodeAt(0) - 65)).join('')
    : '🌐'
  const tag = `${flag} ${rawNumber}`

  const who = targetJid
  const user = global.db.data.users[who]
  const name = (user && user.name) || await conn.getName(who)

  let chat = global.db.data.chats[m.chat]

  // 🔊 Audios de bienvenida y despedida
  const audiosWelcome = ['./media/a.mp3','./media/bien.mp3','./media/prueba3.mp3','./media/prueba4.mp3','./media/bloody.mp3']
  const audiosBye = ['./media/adios.mp3','./media/prueba.mp3','./media/sad.mp3','./media/cardigansad.mp3','./media/iwas.mp3','./media/juntos.mp3','./media/space.mp3','./media/stellar.mp3','./media/theb.mp3','./media/alanspectre.mp3']

  // 🖼️ Stickers
  const stikerBienvenida = await sticker(imagen8, false, global.packname, global.author)
  const stikerDespedida = await sticker(imagen7, false, global.packname, global.author)

  // 🎞️ Gifs
  const gifsBienvenida = ['./media/gif.mp4','./media/giff.mp4','./media/gifff.mp4']
  const gifDespedida = 'https://qu.ax/xOtQJ.mp4'

  // 🧩 Datos generales
  let pp = await conn.profilePictureUrl(targetJid, 'image').catch(_ => icono)
  let im = await (await fetch(pp)).buffer()

  if (chat.welcome && [27,28,32].includes(m.messageStubType)) {
    const isWelcome = m.messageStubType == 27
    const accion = isWelcome ? '🎉 WELCOME' : '👋🏻 ADIOS'
    const mentionJid = [targetJid]
    const caption = `${accion} *@${targetJid.split`@`[0]}*`
    const audioPick = arr => arr[Math.floor(Math.random() * arr.length)]
    const mediaOptions = ['stiker','audio','texto','gifPlayback']
    const media = mediaOptions[Math.floor(Math.random() * mediaOptions.length)]
    const newsletterInfo = { forwardedNewsletterMessageInfo: { newsletterJid: channelRD.id, newsletterName: channelRD.name, serverMessageId: 0 } }

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
            contextInfo:{
              ...newsletterInfo,
              mentionedJid:mentionJid,
              forwardingScore:200,
              isForwarded:false,
              externalAdReply:{
                showAdAttribution:false,
                title:`${accion} ${tag}`,
                body:`${isWelcome?'IzuBot te da la bienvenida':'Esperemos que no vuelva -_-'}`,
                mediaType:1,
                sourceUrl:redes,
                thumbnailUrl:redes,
                thumbnail:im
              }
            }
          }
        )
        break

      case 'audio':
        await conn.sendMessage(m.chat,{
          audio:{url:isWelcome?audioPick(audiosWelcome):audioPick(audiosBye)},
          contextInfo:{
            ...newsletterInfo,
            forwardingScore:false,
            isForwarded:true,
            mentionedJid:mentionJid,
            externalAdReply:{
              title:`${accion} ${tag}`,
              body:`${isWelcome?'IzuBot te da la bienvenida':'Esperemos que no vuelva -_-'}`,
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
        })
        break

      case 'texto':
        await conn.sendMessage(m.chat,{
          text:caption,
          contextInfo:{
            ...newsletterInfo,
            mentionedJid:mentionJid,
            forwardingScore:10,
            isForwarded:true,
            externalAdReply:{
              title:`${accion} ${tag}`,
              body:`${isWelcome?'IzuBot te da la bienvenida':'Esperemos que no vuelva -_-'}`,
              sourceUrl:redes,
              thumbnailUrl:redes,
              thumbnail:im
            }
          }
        })
        break

      case 'gifPlayback':
        await conn.sendMessage(m.chat,{
          video:{url:isWelcome?gifsBienvenida[Math.floor(Math.random()*gifsBienvenida.length)]:gifDespedida},
          gifPlayback:true,
          caption,
          contextInfo:{
            ...newsletterInfo,
            mentionedJid:mentionJid,
            isForwarded:true,
            forwardingScore:10,
            externalAdReply:{
              title:`${accion} ${tag}`,
              body:`${isWelcome?'IzuBot te da la bienvenida':'Esperemos que no vuelva -_-'}`,
              sourceUrl:redes,
              thumbnailUrl:redes,
              thumbnail:im
            }
          }
        })
        break
    }
  }
}

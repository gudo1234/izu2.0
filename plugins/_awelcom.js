import { WAMessageStubType } from '@whiskeysockets/baileys'
import { sticker } from '../lib/sticker.js'
import fetch from 'node-fetch'

let stickerBienvenidaCache = null
let stickerDespedidaCache = null

export async function before(m, { conn, participants, groupMetadata }) {
  if (!m.messageStubType || !m.isGroup) return !0

  const isWelcome = m.messageStubType == 27
  const isBye = [28, 32].includes(m.messageStubType)
  if (!isWelcome && !isBye) return !0

  const who = m.messageStubParameters[0] + '@s.whatsapp.net'
  const mentionJid = [m.messageStubParameters[0]]
  const chat = global.db.data.chats[m.chat]
  if (!chat.welcome) return !0

  const accion = isWelcome ? '🎉 WELCOME' : '👋🏻 ADIOS'
  const audioPick = arr => arr[Math.floor(Math.random() * arr.length)]
  const media = ['stiker', 'audio', 'texto', 'gifPlayback'][Math.floor(Math.random() * 4)]
  const caption = `${accion} *@${m.messageStubParameters[0].split`@`[0]}*`

  const audiosWelcome = [
    './media/a.mp3', './media/bien.mp3', './media/prueba3.mp3',
    './media/prueba4.mp3', './media/bloody.mp3'
  ]
  const audiosBye = [
    './media/adios.mp3', './media/prueba.mp3', './media/sad.mp3',
    './media/cardigansad.mp3', './media/iwas.mp3', './media/juntos.mp3',
    './media/space.mp3', './media/stellar.mp3', './media/theb.mp3', './media/alanspectre.mp3'
  ]
  const gifsBienvenida = ['./media/gif.mp4', './media/giff.mp4', './media/gifff.mp4']
  const gifDespedida = 'https://qu.ax/xOtQJ.mp4'

  // 🧠 Ejecutar en paralelo
  const [userName, ppUrl] = await Promise.all([
    conn.getName(who).catch(() => 'Desconocido'),
    conn.profilePictureUrl(who, 'image').catch(() => icono)
  ])

  const tag = userName || ''
  const captionBody = isWelcome ? 'IzuBot te da la bienvenid' : 'Esperemos que no vuelva -_-'

  // 📸 Descarga del perfil (en paralelo)
  const ppBuffer = await fetch(ppUrl).then(v => v.buffer()).catch(() => null)

  // 🏁 Cache de stickers (no se regeneran cada vez)
  if (!stickerBienvenidaCache)
    stickerBienvenidaCache = await sticker(imagen8, false, global.packname, global.author)
  if (!stickerDespedidaCache)
    stickerDespedidaCache = await sticker(imagen7, false, global.packname, global.author)

  const newsletterInfo = {
    forwardedNewsletterMessageInfo: {
      newsletterJid: channelRD.id,
      newsletterName: channelRD.name,
      serverMessageId: 0
    }
  }

  const context = {
    ...newsletterInfo,
    mentionedJid: mentionJid,
    forwardingScore: 200,
    isForwarded: true,
    externalAdReply: {
      title: `${accion} ${tag}`,
      body: captionBody,
      thumbnail: ppBuffer,
      thumbnailUrl: redes,
      sourceUrl: redes,
      mediaType: 1,
      showAdAttribution: false
    }
  }

  // 🚀 Envío rápido del formato
  switch (media) {
    case 'texto':
      await conn.sendMessage(m.chat, { text: caption, contextInfo: context })
      break

    case 'audio':
      await conn.sendMessage(m.chat, {
        audio: { url: isWelcome ? audioPick(audiosWelcome) : audioPick(audiosBye) },
        mimetype: 'audio/mpeg',
        ptt: false,
        fileName: 'noti.mp3',
        contextInfo: context
      })
      break

    case 'stiker':
      await conn.sendFile(
        m.chat,
        isWelcome ? stickerBienvenidaCache : stickerDespedidaCache,
        'sticker.webp',
        '',
        null,
        true,
        { contextInfo: context } // ✅ Aquí el contextInfo completo
      )
      break

    case 'gifPlayback':
      await conn.sendMessage(m.chat, {
        video: { url: isWelcome ? gifsBienvenida[Math.floor(Math.random() * gifsBienvenida.length)] : gifDespedida },
        gifPlayback: true,
        caption,
        contextInfo: context
      })
      break
  }
}

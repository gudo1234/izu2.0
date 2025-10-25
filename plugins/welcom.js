import { WAMessageStubType } from '@whiskeysockets/baileys'
import { sticker } from '../lib/sticker.js'
import fetch from 'node-fetch'
import fs from 'fs'

export async function before(m, { conn, participants, groupMetadata }) {
  if (!m.messageStubType || !m.isGroup) return !0

  const chat = global.db.data.chats[m.chat]
  if (!chat.welcome) return !0

  const who = m.messageStubParameters?.[0]
  const userJid = `${who}@s.whatsapp.net`
  const name = (global.db.data.users[userJid]?.name) || (await conn.getName(userJid)) || 'Usuario'
  const type = [27].includes(m.messageStubType) ? 'welcome' : ([28, 32].includes(m.messageStubType) ? 'bye' : null)
  if (!type) return !0

  const tag = `@${who.split('@')[0]}`
  const pp = await conn.profilePictureUrl(userJid, 'image').catch(_ => icono)
  const im = await (await fetch(pp)).buffer()
  const media = ['sticker', 'audio', 'texto', 'gifPlayback'].getRandom()

  const welcomeAudios = ['./media/a.mp3', './media/bien.mp3', './media/prueba3.mp3', './media/prueba4.mp3', './media/bloody.mp3']
  const byeAudios = ['./media/adios.mp3', './media/prueba.mp3', './media/sad.mp3', './media/cardigansad.mp3', './media/iwas.mp3', './media/juntos.mp3', './media/space.mp3', './media/stellar.mp3', './media/theb.mp3', './media/alanspectre.mp3']
  const welcomeGifs = ['./media/gif.mp4', './media/giff.mp4', './media/gifff.mp4']
  const byeGifs = ['https://qu.ax/xOtQJ.mp4']

  const txtWelcome = `🌟 *(⊃･ᴗ･)⊃* \`𖹭︩︪ᴡᴇʟᴄᴏᴍᴇ𖹭︩︪\`
╭━━━━━━━━━━❤︎₊᪲
┃ _¡Hola!_ ${tag}
┃ ⇝ Bıεŋvεŋıɖσ(a) a:
┃ *${groupMetadata.subject}*
┃
┃┌─❖─═•
┃│➟ _Pasa un buen rato_
┃│✑ _Sé respetuoso_
┃│✬ _Lee las reglas_
┃└─────────
╰━━━━━━━━━━❤︎₊᪲`

  const txtBye = `✋🏻 Adiós ${tag}\nEsperemos que no vuelva -_-`

  const title = type === 'welcome' ? `💫 WELCOME ${name}` : `👋🏻 ADIÓS ${name}`
  const body = type === 'welcome' ? 'IzuBot te da la bienvenida' : 'Esperemos que no vuelva -_-'

  const externalAd = {
    showAdAttribution: false,
    title,
    body,
    mediaType: 1,
    sourceUrl: redes,
    thumbnailUrl: redes,
    thumbnail: im
  }

  // --- Generar stickers ---
  const stikerWelcome = await sticker(im, false, global.packname, global.author)
  const stikerBye = await sticker(im, false, global.packname, global.author)

  const sendOps = {
    async sticker() {
      await conn.sendFile(m.chat, type === 'welcome' ? stikerWelcome : stikerBye, 'sticker.webp', '', null, true, {
        contextInfo: { mentionedJid: [userJid], externalAdReply: externalAd }
      })
    },

    async audio() {
      const audios = type === 'welcome' ? welcomeAudios : byeAudios
      await conn.sendMessage(m.chat, {
        audio: { url: audios.getRandom() },
        mimetype: 'audio/mpeg',
        ptt: false,
        contextInfo: {
          mentionedJid: [userJid],
          forwardedNewsletterMessageInfo: {
            newsletterJid: channelRD.id,
            newsletterName: channelRD.name
          },
          externalAdReply: externalAd
        }
      })
    },

    async texto() {
      const text = type === 'welcome' ? txtWelcome : txtBye
      await conn.sendMessage(m.chat, {
        text,
        contextInfo: { mentionedJid: [userJid], externalAdReply: externalAd }
      })
    },

    async gifPlayback() {
      const gif = type === 'welcome' ? welcomeGifs.getRandom() : byeGifs.getRandom()
      await conn.sendMessage(m.chat, {
        video: { url: gif },
        gifPlayback: true,
        caption: type === 'welcome' ? `🎉 Bienvenido ${tag}` : `👋🏻 Adiós ${tag}`,
        contextInfo: { mentionedJid: [userJid], externalAdReply: externalAd }
      })
    }
  }

  await sendOps[media]()

  return !0
}

// --- Función auxiliar ---
Array.prototype.getRandom = function () { return this[Math.floor(Math.random() * this.length)] }

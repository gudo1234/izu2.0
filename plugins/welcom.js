import { WAMessageStubType } from '@whiskeysockets/baileys'
import { sticker } from '../lib/sticker.js'
import fetch from 'node-fetch'
import fs from 'fs'

export async function before(m, { conn, participants, groupMetadata }) {
  if (!m.messageStubType || !m.isGroup) return !0
  const chat = global.db.data.chats[m.chat]
  if (!chat?.welcome) return !0

  const whoParam = m.messageStubParameters?.[0]
  if (!whoParam) return !0
  const userJid = `${whoParam}@s.whatsapp.net`
  const name = (global.db.data.users[userJid]?.name) || await conn.getName(userJid) || 'Usuario'
  const type = [27].includes(m.messageStubType) ? 'welcome' : ([28,32].includes(m.messageStubType) ? 'bye' : null)
  if (!type) return !0

  const tag = `@${whoParam.split('@')[0]}`
  const pp = await conn.profilePictureUrl(userJid, 'image').catch(_ => icono)
  const im = await (await fetch(pp)).buffer()

  const welcomeAudios = ['./media/a.mp3','./media/bien.mp3','./media/prueba3.mp3','./media/prueba4.mp3','./media/bloody.mp3']
  const byeAudios = ['./media/adios.mp3','./media/prueba.mp3','./media/sad.mp3','./media/cardigansad.mp3','./media/iwas.mp3','./media/juntos.mp3','./media/space.mp3','./media/stellar.mp3','./media/theb.mp3','./media/alanspectre.mp3']
  const welcomeGifs = ['./media/gif.mp4','./media/giff.mp4','./media/gifff.mp4']
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

  // generar sticker buffers (usa tu lib)
  const stBuffer = im // usar buffer de pp para sticker si no tienes otra imagen
  const stWelcome = await sticker(stBuffer, false, global.packname, global.author)
  const stBye = await sticker(stBuffer, false, global.packname, global.author)

  // formato aleatorio
  const media = ['sticker','audio','texto','gifPlayback'].getRandom()

  const contextCommon = {
    forwardedNewsletterMessageInfo: {
      newsletterJid: channelRD.id,
      newsletterName: channelRD.name,
      serverMessageId: 0
    },
    mentionedJid: [userJid],
    externalAdReply: externalAd
  }

  const sendOps = {
    async sticker() {
      await conn.sendFile(m.chat, type === 'welcome' ? stWelcome : stBye, 'sticker.webp', '', null, true, {
        contextInfo: contextCommon
      }, { quoted: null })
    },

    async audio() {
      const aud = (type === 'welcome' ? welcomeAudios : byeAudios).getRandom()
      await conn.sendMessage(m.chat, {
        audio: fs.existsSync(aud) ? fs.readFileSync(aud) : { url: aud },
        mimetype: 'audio/mpeg',
        ptt: false
      }, { quoted: null, contextInfo: contextCommon })
    },

    async texto() {
      await conn.sendMessage(m.chat, {
        text: type === 'welcome' ? txtWelcome : txtBye,
        contextInfo: contextCommon
      }, { quoted: null })
    },

    async gifPlayback() {
      const gif = (type === 'welcome' ? welcomeGifs : byeGifs).getRandom()
      await conn.sendMessage(m.chat, {
        video: fs.existsSync(gif) ? fs.readFileSync(gif) : { url: gif },
        gifPlayback: true,
        caption: type === 'welcome' ? `🎉 Bienvenido ${tag}` : `👋🏻 Adiós ${tag}`,
        contextInfo: contextCommon
      }, { quoted: m })
    }
  }

  try { await sendOps[media]() } catch (err) { console.error('welcome plugin error:', err) }
  return !0
}

// helper
Array.prototype.getRandom = function(){ return this[Math.floor(Math.random()*this.length)] }

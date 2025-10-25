import { WAMessageStubType } from '@whiskeysockets/baileys'
import { sticker } from '../lib/sticker.js'
import fetch from 'node-fetch'
import fs from 'fs'
import path from 'path'

const MEDIA = {
  // stickers fijos (según mencionaste)
  welcomeSticker: './media/byenavidad.png',
  byeSticker: './media/ad.png',
  // gifs
  welcomeGifs: ['./media/gif.mp4', './media/giff.mp4', './media/gifff.mp4'],
  byeGifs: ['https://qu.ax/xOtQJ.mp4'],
  // audios
  welcomeAudios: ['./media/a.mp3','./media/bien.mp3','./media/prueba3.mp3','./media/prueba4.mp3','./media/bloody.mp3'],
  byeAudios: ['./media/adios.mp3','./media/prueba.mp3','./media/sad.mp3','./media/cardigansad.mp3','./media/iwas.mp3','./media/juntos.mp3','./media/space.mp3','./media/stellar.mp3','./media/theb.mp3','./media/alanspectre.mp3']
}

function pick(arr){ return arr[Math.floor(Math.random()*arr.length)] }

async function safeProfileBuffer(conn, jid){
  try {
    const url = await conn.profilePictureUrl(jid, 'image')
    if (!url) return null
    const res = await fetch(url)
    if (!res.ok) return null
    return Buffer.from(await res.arrayBuffer())
  } catch {
    try { // fallback a global icono si existe
      if (typeof icono !== 'undefined' && fs.existsSync(icono)) return fs.readFileSync(icono)
    } catch {}
    return null
  }
}

async function makeStickerBufferFromFileOrBuffer(filePath, buffer, pack = global.packname, author = global.author){
  try {
    if (filePath && fs.existsSync(filePath)) return await sticker(filePath, false, pack, author)
    if (buffer) return await sticker(buffer, false, pack, author)
  } catch (err) {
    console.error('sticker creation failed:', err)
  }
  return null
}

export async function before(m, { conn, participants, groupMetadata }) {
  try {
    if (!m.messageStubType || !m.isGroup) return !0
    const chat = global.db?.data?.chats?.[m.chat]
    if (!chat?.welcome) return !0

    const whoRaw = m.messageStubParameters?.[0]
    if (!whoRaw) return !0
    const who = whoRaw.includes('@') ? whoRaw.split('@')[0] : whoRaw
    const userJid = `${who}@s.whatsapp.net`

    const type = m.messageStubType === 27 ? 'welcome' :
                 ([28,32].includes(m.messageStubType) ? 'bye' : null)
    if (!type) return !0

    // nombre / tag
    const userDB = global.db?.data?.users?.[userJid]
    const name = (userDB && userDB.name) || await conn.getName(userJid).catch(()=> null) || who
    const tag = `@${who}`

    // profile pic buffer para thumbnail
    const im = await safeProfileBuffer(conn, userJid) // puede ser null

    // preparar arrays y textos
    const audios = type === 'welcome' ? MEDIA.welcomeAudios : MEDIA.byeAudios
    const gifs = type === 'welcome' ? MEDIA.welcomeGifs : MEDIA.byeGifs
    const stickerFile = type === 'welcome' ? MEDIA.welcomeSticker : MEDIA.byeSticker

    const a = `🎉 _Welcome_ *@${who}*`
    const b = `✋🏻 Adiós *@${who}*`
    const caption = type === 'welcome' ? a : b
    const simpleText = type === 'welcome'
      ? `🌟 ¡Hola ${tag}!\nBienvenido a *${groupMetadata?.subject || ''}*`
      : `✋🏻 ${tag} ha salido.\nEsperemos que no vuelva -_-`

    const title = type === 'welcome' ? `💫 WELCOME ${name}` : `👋🏻 ADIOS ${name}`
    const body = type === 'welcome' ? 'IzuBot te da la bienvenida' : 'Esperemos que no vuelva -_-'

    // externalAdReply / contextInfo común
    const contextInfo = {
      forwardedNewsletterMessageInfo: {
        newsletterJid: channelRD?.id || '',
        serverMessageId: 0,
        newsletterName: channelRD?.name || ''
      },
      forwardingScore: false,
      isForwarded: true,
      mentionedJid: [userJid],
      externalAdReply: {
        title,
        body,
        thumbnailUrl: redes,
        thumbnail: im || undefined,
        sourceUrl: redes,
        showAdAttribution: false
      }
    }

    // generar stickers (intenta usar archivo fijo, sino foto de perfil)
    const stBuf = await makeStickerBufferFromFileOrBuffer(stickerFile, im, global.packname, global.author)

    // elegir formato aleatorio
    const formats = ['stiker','audio','texto','gifPlayback']
    const media = pick(formats)

    // ejecutar envio según formato
    if (media === 'stiker') {
      if (stBuf) {
        await conn.sendFile(m.chat, stBuf, 'sticker.webp', '', null, true, {
          contextInfo: contextInfo
        }, { quoted: null })
      } else {
        // fallback: enviar simple imagen como mensaje si sticker falla
        if (im) await conn.sendMessage(m.chat, { image: im, caption: title, contextInfo }, { quoted: null })
      }
    } else if (media === 'audio') {
      const sel = pick(audios)
      // si es path local, envía buffer; si es url, envía como url en audio object
      const audioPayload = fs.existsSync(sel) ? fs.readFileSync(sel) : { url: sel }
      await conn.sendMessage(m.chat, {
        audio: audioPayload,
        mimetype: 'audio/mpeg',
        ptt: false,
        fileName: 'welcome.mp3',
        seconds: 4556
      }, { quoted: null, contextInfo })
    } else if (media === 'texto') {
      await conn.sendMessage(m.chat, {
        text: simpleText,
        contextInfo
      }, { quoted: null })
    } else if (media === 'gifPlayback') {
      const sel = pick(gifs)
      const videoPayload = fs.existsSync(sel) ? fs.readFileSync(sel) : { url: sel }
      await conn.sendMessage(m.chat, {
        video: videoPayload,
        gifPlayback: true,
        caption
      }, { quoted: m, contextInfo })
    }

  } catch (err) {
    console.error('welcome before error:', err)
  }
  return !0
}

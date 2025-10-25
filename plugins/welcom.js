// plugins/welcome.js
import { WAMessageStubType } from '@whiskeysockets/baileys'
import { sticker } from '../lib/sticker.js'
import fetch from 'node-fetch'
import fs from 'fs'
import path from 'path'

const MEDIA = {
  welcomeStickerFile: './media/byenavidad.png',
  byeStickerFile: './media/ad.png',
  welcomeGifs: ['./media/gif.mp4','./media/giff.mp4','./media/gifff.mp4'],
  byeGifs: ['https://qu.ax/xOtQJ.mp4'],
  welcomeAudios: ['./media/a.mp3','./media/bien.mp3','./media/prueba3.mp3','./media/prueba4.mp3','./media/bloody.mp3'],
  byeAudios: ['./media/adios.mp3','./media/prueba.mp3','./media/sad.mp3','./media/cardigansad.mp3','./media/iwas.mp3','./media/juntos.mp3','./media/space.mp3','./media/stellar.mp3','./media/theb.mp3','./media/alanspectre.mp3']
}

function pick(arr){ return arr[Math.floor(Math.random()*arr.length)] }

async function fetchBufferFromUrl(url){
  try {
    const r = await fetch(url)
    if (!r.ok) throw new Error('fetch fail: ' + r.status)
    return Buffer.from(await r.arrayBuffer())
  } catch (e) {
    return null
  }
}

async function safeProfileBuffer(conn, jid){
  try {
    const url = await conn.profilePictureUrl(jid, 'image')
    if (!url) return null
    const buf = await fetchBufferFromUrl(url)
    if (buf) return buf
  } catch (e) {}
  // fallback to global icono if defined and exists
  try {
    if (typeof icono !== 'undefined' && fs.existsSync(icono)) return fs.readFileSync(icono)
  } catch(e){}
  return null
}

async function makeStickerBuffer(preferredFile, fallbackBuffer){
  try {
    if (preferredFile && fs.existsSync(preferredFile)) {
      return await sticker(preferredFile, false, global.packname, global.author)
    }
    if (fallbackBuffer) return await sticker(fallbackBuffer, false, global.packname, global.author)
  } catch (err) {
    console.error('makeStickerBuffer error:', err?.message || err)
  }
  return null
}

export async function before(m, { conn, participants, groupMetadata }) {
  try {
    if (!m.messageStubType || !m.isGroup) return !0
    const chat = global.db?.data?.chats?.[m.chat]
    if (!chat?.welcome) return !0

    const whoParam = m.messageStubParameters?.[0]
    if (!whoParam) return !0

    // normalize who -> full jid
    const normalized = whoParam.includes('@') ? whoParam : `${whoParam}@s.whatsapp.net`
    const short = normalized.split('@')[0] // number part

    // determine event type
    const type = m.messageStubType === 27 ? 'welcome' : ([28,32].includes(m.messageStubType) ? 'bye' : null)
    if (!type) return !0

    // name / tag
    const userDB = global.db?.data?.users?.[normalized]
    const name = (userDB && userDB.name) || await conn.getName(normalized).catch(()=> null) || short
    const tag = `@${short}`

    // get thumbnail buffer (profile pic) with fallback
    const imBuffer = await safeProfileBuffer(conn, normalized) // maybe null

    // prepare media arrays and texts
    const audios = type === 'welcome' ? MEDIA.welcomeAudios : MEDIA.byeAudios
    const gifs = type === 'welcome' ? MEDIA.welcomeGifs : MEDIA.byeGifs
    const stickerFile = type === 'welcome' ? MEDIA.welcomeStickerFile : MEDIA.byeStickerFile

    const captionWelcome = `🎉 _Welcome_ *@${short}*`
    const captionBye = `✋🏻 Adiós *@${short}*`
    const caption = type === 'welcome' ? captionWelcome : captionBye

    const txtWelcome = `🌟 ¡Hola ${tag}!\nBienvenido a *${groupMetadata?.subject || ''}*\nPasa un buen rato, sé respetuoso.`
    const txtBye = `✋🏻 ${tag} ha salido.\nEsperemos que no vuelva -_-`

    const title = type === 'welcome' ? `💫 WELCOME ${name}` : `👋🏻 ADIOS ${name}`
    const body = type === 'welcome' ? 'IzuBot te da la bienvenida' : 'Esperemos que no vuelva -_-'

    // common contextInfo
    const contextInfo = {
      forwardedNewsletterMessageInfo: {
        newsletterJid: channelRD?.id || '',
        serverMessageId: 0,
        newsletterName: channelRD?.name || ''
      },
      forwardingScore: false,
      isForwarded: true,
      mentionedJid: [normalized],
      externalAdReply: {
        title,
        body,
        thumbnailUrl: redes,
        thumbnail: imBuffer || undefined,
        sourceUrl: redes,
        showAdAttribution: false
      }
    }

    // build stickers
    const stBuf = await makeStickerBuffer(stickerFile, imBuffer)

    // pick random format
    const formats = ['stiker','audio','texto','gifPlayback']
    const chosen = pick(formats)
    console.log('[welcome] chosen format:', chosen, 'type:', type, 'user:', normalized)

    if (chosen === 'stiker') {
      if (stBuf) {
        // send sticker buffer (works with sendFile in your codebase)
        await conn.sendFile(m.chat, stBuf, 'sticker.webp', '', null, true, { contextInfo }, { quoted: null })
      } else if (imBuffer) {
        // fallback: send profile pic as image with caption
        await conn.sendMessage(m.chat, { image: imBuffer, caption: title, contextInfo }, { quoted: null })
      } else {
        console.warn('[welcome] no sticker or thumbnail available')
      }
    } else if (chosen === 'audio') {
      const sel = pick(audios)
      try {
        const audioPayload = fs.existsSync(sel) ? fs.readFileSync(sel) : { url: sel }
        await conn.sendMessage(m.chat, {
          audio: audioPayload,
          mimetype: 'audio/mpeg',
          ptt: false,
          fileName: 'audio.mp3',
          seconds: 4556,
          contextInfo
        }, { quoted: null, ephemeralExpiration: 24*60*100, disappearingMessagesInChat: 24*60*100 })
      } catch (err) {
        console.error('[welcome] send audio error:', err)
      }
    } else if (chosen === 'texto') {
      await conn.sendMessage(m.chat, {
        text: type === 'welcome' ? txtWelcome : txtBye,
        contextInfo
      }, { quoted: null })
    } else if (chosen === 'gifPlayback') {
      const sel = pick(gifs)
      try {
        const videoPayload = fs.existsSync(sel) ? fs.readFileSync(sel) : { url: sel }
        await conn.sendMessage(m.chat, {
          video: videoPayload,
          gifPlayback: true,
          caption,
          contextInfo
        }, { quoted: m })
      } catch (err) {
        console.error('[welcome] send gifPlayback error:', err)
      }
    }

  } catch (err) {
    console.error('welcome before final error:', err)
  }
  return !0
}

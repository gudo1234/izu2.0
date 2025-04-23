import { WAMessageStubType } from '@whiskeysockets/baileys';
import { sticker } from '../lib/sticker.js'
import fetch from 'node-fetch';
export async function before(m, { conn, participants, groupMetadata }) {

  if (!m.messageStubType || !m.isGroup) return true;
const thumbnail = await (await fetch(icono)).buffer()
  let pp = await conn.profilePictureUrl(m.messageStubParameters[0], 'image').catch(_ => thumbnail)
  let im = await (await fetch(`${pp}`)).buffer()
  let vn = './media/a.mp3'; //welcome bendicion
let vn2 = './media/bien.mp3'; //welcome entrada épica
  let vn3 = './media/adios.mp3'; //bye y se marchó
  let vn4 = './media/prueba3.mp3'; //welcome calamar
  let vn5 = './media/prueba4.mp3'; //welcome mortals
  let vn6 = './media/prueba.mp3'; //la calin
  
  
  let chat = global.db.data.chats[m.chat];
  const user = `@${m.sender.split`@`[0]}`;
  const getMentionedJid = () => {
    return m.messageStubParameters.map(param => `${param}@s.whatsapp.net`);
  };
  let who = m.messageStubParameters[0] + '@s.whatsapp.net';
  let userName = user ? user.name : await conn.getName(who);
  let or = ['stiker', 'audio', 'texto', 'gifPlayback'];
  let media = or[Math.floor(Math.random() * 6)]
  let stiker = await sticker(imagen7, false, global.packname, global.author) //despedida
  let stiker2 = await sticker(imagen8, false, global.packname, global.author) //welcome
  let a = `🎉 _Welcome_ *@${m.messageStubParameters[0].split`@`[0]}*`
  let b = `🖐🏻 _Adios_ *@${m.messageStubParameters[0].split`@`[0]}*`

// Welcome 
if (chat.welcome && m.messageStubType == 27) {

if (media === 'stiker') {
    this.sendFile(m.chat, stiker2, 'sticker.webp', '', null, true, {
        contextInfo: {
            'mentionedJid': [m.messageStubParameters[0]],
            'forwardingScore': 200,
            'isForwarded': false,
            externalAdReply: {
                showAdAttribution: false,
                title: `💫 WELCOME +${m.messageStubParameters[0].split`@`[0]}`,
                body: 'IzuBot te da la bienvenida',
                mediaType: 1,
                sourceUrl: redes,
                thumbnailUrl: redes,
                thumbnail
            }
        }
    }, { quoted: null });
}

if (media === 'audio') {
this.sendMessage(m.chat, { audio: { url: [vn, vn2, vn4, vn5].getRandom() }, 
    contextInfo: { forwardedNewsletterMessageInfo: { 
    newsletterJid: channelRD.id, 
    serverMessageId: '', 
    newsletterName: channelRD.name }, forwardingScore: false, isForwarded: true, mentionedJid: [m.messageStubParameters[0]], "externalAdReply": { 
    "title": `❤️WELCOME +${m.messageStubParameters[0].split`@`[0]}`, 
    "body": 'IzuBot te da la bienvenida', 
    "previewType": "PHOTO", 
    "thumbnailUrl": redes,
    thumbnail, 
    "sourceUrl": redes, 
    "showAdAttribution": true}}, 
     seconds: '4556', ptt: true, mimetype: 'audio/mpeg', fileName: `error.mp3` }, { quoted: null, ephemeralExpiration: 24*60*100, disappearingMessagesInChat: 24*60*100})};

if (media === 'texto') {
  let wel = `°   /)🎩/)
    (｡•ㅅ•｡)𖹭︩︪𝚆꯭᪶۫۫͝𝙴꯭᪶͡𝙻᪶۫۫͝𝙲꯭᪶֟፟፝͡𝙾᪶۫۫͝𝙼꯭᪶͡𝙴᪶𖹭︩︪*
    ╭∪─∪─────────❤︎₊᪲
¡Hola!🍷 *@${m.messageStubParameters[0].split`@`[0]}* buenos días/tardes/noches.\n🎉¡Bienvenido a *${groupMetadata.subject}*!\n\n> 🐢Disfruta del grupo, diviértete, no olvides en leer las reglas...
    ╰────────────❤︎₊᪲`
  this.sendMessage(m.chat, {
        text: wel, 
        contextInfo: {
            mentionedJid: [m.messageStubParameters[0]], // Asegúrate de incluir al nuevo usuario aquí
            groupMentions: [],
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: channelRD.id,
                newsletterName: channelRD.name,
                serverMessageId: 0
            },
            businessMessageForwardInfo: { businessOwnerJid: '50492280729@s.whatsapp.net' },
            forwardingScore: false,
            externalAdReply: {
                title: `🍒ᴡᴇʟᴄᴏᴍᴇ🍒`,
                body: 'IzuBot te da la bienvenida',
                thumbnailUrl: redes,
                thumbnail,
                sourceUrl: redes
            }
        }
    }, { quoted: null })};

if (media === 'gifPlayback') {
await conn.sendMessage(m.chat, {
    video: { url: 'https://qu.ax/TXRoC.mp4' },
    gifPlayback: true,
    caption: a,
    contextInfo: {
        mentionedJid: [m.messageStubParameters[0]],
        groupMentions: [],
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: channelRD.id,
            newsletterName: channelRD.name,
            serverMessageId: 0
        },
        businessMessageForwardInfo: { businessOwnerJid: '50492280729@s.whatsapp.net' },
        forwardingScore: false,
        externalAdReply: {
            title: 'Izubot te da la bienvenida',
            body: `${await conn.getName(m.chat)}`,
            sourceUrl: redes,
            thumbnailUrl: redes,
            thumbnail
        }
    }
}, { quoted: m })};
}

// bye 
  if (chat.welcome && (m.messageStubType === 28 || m.messageStubType === 32)) {

if (media === 'stiker') {
    this.sendFile(m.chat, stiker, 'sticker.webp', '', null, true, {
        contextInfo: {
            'mentionedJid': [m.messageStubParameters[0]],
            'forwardingScore': 200,
            'isForwarded': false,
            externalAdReply: {
                showAdAttribution: false,
                title: `👋🏻ADIOS +${m.messageStubParameters[0].split`@`[0]}`,
                body: 'Esperemos que no vuelva -_-',
                mediaType: 1,
                sourceUrl: redes,
                thumbnailUrl:redes,
                thumbnail
            }
        }
    }, { quoted: null });
}

if (media === 'audio') {
this.sendMessage(m.chat, { audio: { url: [vn3, vn6].getRandom() }, 
    contextInfo: { forwardedNewsletterMessageInfo: { 
    newsletterJid: channelRD.id, 
    serverMessageId: '', 
    newsletterName: channelRD.name }, forwardingScore: false, isForwarded: true, mentionedJid: [m.messageStubParameters[0]], "externalAdReply": { 
    "title": `${e} ADIOS +${m.messageStubParameters[0].split`@`[0]}`, 
    "body": 'Esperemos que no vuelva -_-', 
    "previewType": "PHOTO", 
    "thumbnailUrl": redes,
    thumbnail, 
    "sourceUrl": redes, 
    "showAdAttribution": true}}, 
     seconds: '4556', ptt: true, mimetype: 'audio/mpeg', fileName: `error.mp3` }, { quoted: null, ephemeralExpiration: 24*60*100, disappearingMessagesInChat: 24*60*100})};

if (media === 'texto') {
  this.sendMessage(m.chat, { 
        text: b, 
        contextInfo: {
            mentionedJid: [m.messageStubParameters[0]], // Asegúrate de incluir al nuevo usuario aquí
            groupMentions: [],
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: channelRD.id,
                newsletterName: channelRD.name,
                serverMessageId: 0
            },
            businessMessageForwardInfo: { businessOwnerJid: '50492280729@s.whatsapp.net' },
            forwardingScore: false,
            externalAdReply: {
                title: `${await conn.getName(m.chat)}`,
                body: 'Esperemos que no vuelva -_-',
                thumbnailUrl: redes,
                thumbnail,
                sourceUrl: redes
            }
        }
    }, { quoted: null })};

if (media === 'gifPlayback') {
await conn.sendMessage(m.chat, {
    video: { url: 'https://qu.ax/xOtQJ.mp4' },
    gifPlayback: true,
    caption: b,
    contextInfo: {
        mentionedJid: [m.messageStubParameters[0]],
        groupMentions: [],
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: channelRD.id,
            newsletterName: channelRD.name,
            serverMessageId: 0
        },
        businessMessageForwardInfo: { businessOwnerJid: '50492280729@s.whatsapp.net' },
        forwardingScore: false,
        externalAdReply: {
            title: 'Esperemos que no vuelva -_-',
            body: `${await conn.getName(m.chat)}`,
            sourceUrl: redes,
            thumbnailUrl: redes,
            thumbnail
        }
    }
}, { quoted: null })};
 
  }
}

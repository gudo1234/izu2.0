import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { createCanvas, loadImage } from '@napi-rs/canvas'
import fetch from 'node-fetch'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function ensureDir(p) { try { fs.mkdirSync(p, { recursive: true }) } catch {} }

async function loadImageSmart(src) {
  if (!src) return null
  try {
    if (/^https?:/i.test(src)) {
      const res = await fetch(src)
      if (!res.ok) throw new Error('fetch fail')
      const buf = Buffer.from(await res.arrayBuffer())
      return await loadImage(buf)
    }
    return await loadImage(src)
  } catch { return null }
}

export async function makeCard({ title = 'Bienvenida', subtitle = '', avatarUrl = '', bgUrl = '', badgeUrl = '' }) {
  const width = 900, height = 380
  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext('2d')

  const gradient = ctx.createLinearGradient(0, 0, width, height)
  gradient.addColorStop(0, '#06141f')
  gradient.addColorStop(1, '#0b2a3b')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)

  ctx.lineWidth = 12
  ctx.strokeStyle = '#19c3ff'
  ctx.strokeRect(6, 6, width - 12, height - 12)

  if (bgUrl) {
    try {
      const bg = await loadImageSmart(bgUrl)
      const pad = 18
      ctx.globalAlpha = 0.9
      if (bg) ctx.drawImage(bg, pad, pad, width - pad * 2, height - pad * 2)
      ctx.globalAlpha = 1
      ctx.fillStyle = 'rgba(0,0,0,0.35)'
      ctx.fillRect(pad, pad, width - pad * 2, height - pad * 2)
    } catch {}
  }

  let avatarUsedInCenter = false
  let centerR = 54
  let centerCX = Math.round(width / 2)
  let centerCY = 86
  try {
    const useCenterAvatar = !badgeUrl && !!avatarUrl
    centerR = useCenterAvatar ? 80 : 54
    centerCY = useCenterAvatar ? Math.round(height / 2) : 86
    const centerSrc = (badgeUrl && badgeUrl.trim()) ? badgeUrl : (avatarUrl || '')
    if (centerSrc) {
      const badge = await loadImageSmart(centerSrc)
      ctx.save()
      ctx.beginPath(); ctx.arc(centerCX, centerCY, centerR, 0, Math.PI * 2); ctx.closePath(); ctx.clip()
      if (badge) ctx.drawImage(badge, centerCX - centerR, centerCY - centerR, centerR * 2, centerR * 2)
      ctx.restore()
      ctx.lineWidth = 6
      ctx.strokeStyle = '#19c3ff'
      ctx.beginPath(); ctx.arc(centerCX, centerCY, centerR + 4, 0, Math.PI * 2); ctx.stroke()
      avatarUsedInCenter = useCenterAvatar
    }
  } catch {}

  ctx.textAlign = 'center'
  ctx.fillStyle = '#ffffff'
  ctx.shadowColor = '#000000'
  ctx.shadowBlur = 8
  ctx.font = 'bold 48px Sans'
  const titleY = avatarUsedInCenter ? 70 : 178
  ctx.fillText(title, width / 2, titleY)
  ctx.shadowBlur = 0

  ctx.fillStyle = '#d8e1e8'
  ctx.font = '28px Sans'
  const lines = Array.isArray(subtitle) ? subtitle : [subtitle]
  const subBaseY = avatarUsedInCenter ? (centerCY + centerR + 28) : 218
  lines.forEach((t, i) => ctx.fillText(String(t || ''), width / 2, subBaseY + i * 34))

  if (avatarUrl && !avatarUsedInCenter) {
    try {
      const av = await loadImageSmart(avatarUrl)
      const r = 64
      const x = width - 120, y = height - 120
      ctx.save()
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.closePath(); ctx.clip()
      if (av) ctx.drawImage(av, x - r, y - r, r * 2, r * 2)
      ctx.restore()
      ctx.lineWidth = 5
      ctx.strokeStyle = '#19c3ff'
      ctx.beginPath(); ctx.arc(x, y, r + 3, 0, Math.PI * 2); ctx.stroke()
    } catch {}
  }

  return canvas.toBuffer('image/png')
}

export async function sendWelcomeOrBye(conn, { jid, userName = 'Usuario', type = 'welcome', groupName = '', participant }) {
  const tmp = path.join(__dirname, '../temp')
  ensureDir(tmp)
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]

  const WELCOME_AUDIO = [
    './media/a.mp3',
    './media/bien.mp3',
    './media/prueba3.mp3',
    './media/prueba4.mp3',
    './media/bloody.mp3'
  ]

  const BYE_AUDIO = [
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

  const BG_IMAGES = [
    'https://iili.io/KIShsKx.md.jpg',
    'https://iili.io/KIShLcQ.md.jpg',
    'https://iili.io/KISwzI1.md.jpg',
    'https://iili.io/KIShPPj.md.jpg',
    'https://iili.io/KISwREJ.md.jpg',
    'https://iili.io/KISw5rv.md.jpg',
    'https://iili.io/KISwY2R.md.jpg',
    'https://iili.io/KISwa7p.md.jpg',
    'https://iili.io/KISwlpI.md.jpg',
    'https://iili.io/KISw1It.md.jpg',
    'https://iili.io/KISwEhX.md.jpg',
    'https://iili.io/KISwGQn.md.jpg',
    'https://iili.io/KISwVBs.md.jpg',
    'https://iili.io/KISwWEG.md.jpg',
    'https://iili.io/KISwX4f.md.jpg'
  ]

  const WELCOME_TITLES = ['Bienvenido', 'Bienvenida', '¡Bienvenid@!', 'Saludos', '¡Hola!', 'Llegada', 'Nuevo miembro', 'Bienvenid@ al grupo', 'Que gusto verte', 'Bienvenido/a']
  const WELCOME_SUBS = [
    'Un placer tenerte aquí',
    'Que la pases bien con nosotros',
    'Esperamos que disfrutes el grupo',
    'Pásala bien y participa',
    'Aquí encontrarás buena onda',
    'Prepárate para la diversión',
    'Bienvenido, esperamos tus aportes',
    'Diviértete y sé respetuos@',
    'Gracias por unirte',
    'La comunidad te da la bienvenida'
  ]
  const BYE_TITLES = ['Adiós', 'Despedida', 'Hasta luego', 'Nos vemos', 'Salida', 'Bye', 'Chao', 'Nos vemos pronto', 'Que te vaya bien', 'Sayonara']
  const BYE_SUBS = [
    'Adiós, nadie te quiso',
    'No vuelvas más, eres feo',
    'Se fue sin dejar rastro',
    'Buena suerte en lo que siga',
    'Hasta nunca',
    'Que te vaya mejor (o no)',
    'Te extrañaremos (no tanto)',
    'Nos veremos en otra vida',
    'Adiós y cuídate',
    'Chao, fue un placer... quizá'
  ]

  const title = type === 'welcome' ? pick(WELCOME_TITLES) : pick(BYE_TITLES)
  const subtitle = type === 'welcome' ? [pick(WELCOME_SUBS)] : [pick(BYE_SUBS)]
  const bgUrl = pick(BG_IMAGES)
  const badgeUrl = ''
  let avatarUrl = ''
  try { if (participant) avatarUrl = await conn.profilePictureUrl(participant, 'image') } catch {}
  if (!avatarUrl) avatarUrl = 'https://files.catbox.moe/xr2m6u.jpg'

  const buff = await makeCard({ title, subtitle, avatarUrl, bgUrl, badgeUrl })
  const file = path.join(tmp, `${type}-${Date.now()}.png`)
  fs.writeFileSync(file, buff)

  const meta = await (typeof conn.groupMetadata === 'function' ? conn.groupMetadata(jid) : {})
  const totalMembers = meta?.participants?.length || 0
  const groupSubject = meta?.subject || groupName || ''
  const tipo = type === 'welcome' ? 'Bienvenid@' : 'Despedida'

  const who = participant || ''
  const number = who.replace(/\D/g, '')
  const taguser = number ? `@${number}` : userName
  const date = new Date().toLocaleString('es-PE', { year: 'numeric', month: '2-digit', day: '2-digit', hour12: false, hour: '2-digit', minute: '2-digit' })
  const mentionId = who ? [who] : []

  const tip = `${tipo}, ahora somos ${totalMembers}`
  const cap = `⭔ Usuario: ${taguser}\n⬨ Grupo: ${groupSubject}\n⭓ Miembros: ${totalMembers}\n✩ Fecha: ${date}`.trim()

  const selectedAudio = type === 'welcome' ? pick(WELCOME_AUDIO) : pick(BYE_AUDIO)

  // Elegir aleatoriamente UN formato: 'product' | 'text' | 'audio'
  const format = pick(['product', 'text', 'audio'])

  try {
    if (format === 'product') {
      await conn.sendMessage(jid, {
        product: {
          productImage: { url: file },
          productId: '24529689176623820',
          title: tip,
          description: '',
          currencyCode: 'USD',
          priceAmount1000: '1000',
          retailerId: 1677,
          url: redes,
          productImageCount: 1
        },
        businessOwnerJid: who || '0@s.whatsapp.net',
        caption: cap,
        title: '',
        subtitle: '',
        footer: textbot|| '',
        interactiveButtons: [
          {
            name: 'quick_reply',
            buttonParamsJson: JSON.stringify({
              display_text: `${e} ᴄᴏᴍᴀɴᴅᴏs`,
              id: '.m'
            })
          }
        ],
        mentions: who ? [who] : [],
        contextInfo: {
          externalAdReply: {
            title: groupSubject,
            body: tip,
            thumbnailUrl: redes,
            thumbnail: fs.readFileSync(file),
            sourceUrl: redes
          }
        }
      })
    } else if (format === 'text') {
      await conn.sendMessage(jid, {
        text: cap,
        contextInfo: {
          mentionedJid: mentionId,
          groupMentions: [],
          isForwarded: true,
          forwardingScore: false,
          forwardedNewsletterMessageInfo: {
            newsletterJid: channelRD.id,
            newsletterName: channelRD.name,
            serverMessageId: 0
          },
          businessMessageForwardInfo: { businessOwnerJid: '50492280729@s.whatsapp.net' },
          externalAdReply: {
            title: textbot,
            body: tip,
            thumbnailUrl: redes,
            thumbnail: fs.readFileSync(file),
            sourceUrl: redes
          }
        }
      }, { quoted: null })
    } else if (format === 'audio') {
      const audioBuffer = fs.readFileSync(selectedAudio)
      await conn.sendMessage(jid, {
        audio: audioBuffer,
        mimetype: 'audio/mpeg',
        ptt: false,
        fileName: 'bienvenida.mp3',
        seconds: 4556,
        contextInfo: {
          isForwarded: true,
          forwardingScore: false,
          mentionedJid: mentionId,
          forwardedNewsletterMessageInfo: {
            newsletterJid: channelRD.id,
            serverMessageId: '',
            newsletterName: channelRD.name
          },
          externalAdReply: {
            title: textbot,
            body: tip,
            thumbnailUrl: redes,
            thumbnail: fs.readFileSync(file),
            sourceUrl: redes,
            showAdAttribution: false
          }
        }
      }, { quoted: null, ephemeralExpiration: 24 * 60 * 100, disappearingMessagesInChat: 24 * 60 * 100 })
    }
  } catch (errSend) {
    console.error('sendWelcomeOrBye send error (ignored):', errSend)
  }

  return file
}

// Hook principal (plugin)
export async function before(m, { conn, participants, groupMetadata }) {
  try {
    if (!m.isGroup) return !0
    if (!m.messageStubType) return !0
    const chat = global?.db?.data?.chats?.[m.chat]
    if (!chat?.welcome) return !0
    const who = m.messageStubParameters?.[0]
    if (!who) return !0
    const type = m.messageStubType === 27 ? 'welcome' : ([28, 32].includes(m.messageStubType) ? 'bye' : null)
    if (!type) return !0

    await sendWelcomeOrBye(conn, {
      jid: m.chat,
      userName: (await conn.getName(who)) || 'Usuario',
      type,
      groupName: groupMetadata?.subject || '',
      participant: who
    })
  } catch (err) {
    console.error('plugin welcome before error:', err)
  }
  return !0
}

export default { makeCard, sendWelcomeOrBye }

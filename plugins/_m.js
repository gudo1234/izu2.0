import fs, { promises as fsp } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import Jimp from 'jimp'

const __dirname = dirname(fileURLToPath(import.meta.url))

let handler = async (m, { conn, usedPrefix: _p }) => {
  try {
    const prem = (global.prems || []).includes(m.sender.split`@`[0])

    const Styles = (text, style = 1) => {
      const xStr = 'abcdefghijklmnñopqrstuvwxyz1234567890'.split('')
      const yStr = Object.freeze({
        1: 'ᴀʙᴄᴅᴇғɢʜɪᴊᴋʟᴍɴñᴏᴘǫʀsᴛᴜᴠᴡxʏᴢ1234567890'
      })
      const map = xStr.map((v, i) => ({ o: v, c: yStr[style].split('')[i] || v }))
      return text.toLowerCase().split('').map(v => (map.find(x => x.o === v)?.c || v)).join('')
    }

    const sleep = ms => new Promise(r => setTimeout(r, ms))

    async function resizeImage(buffer, width, height) {
      try {
        const img = await Jimp.read(buffer)
        return await img.resize(width, height).getBufferAsync(Jimp.MIME_JPEG)
      } catch {
        return buffer
      }
    }

    // simulador de xpRange
    function xpRange(level, multiplier = 1) {
      const min = level * 100 * multiplier
      const xp = 100 * multiplier
      const max = (level + 1) * 100 * multiplier
      return { min, xp, max }
    }

    function clockString(ms) {
      let h = isNaN(ms) ? '--' : Math.floor(ms / 3600000)
      let m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60
      let s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60
      return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':')
    }

    function limaGreetingText() {
      const now = new Date()
      const hour = new Intl.DateTimeFormat('es-PE', { hour: 'numeric', hour12: false, timeZone: 'America/Lima' }).format(now)
      const h = parseInt(hour, 10)
      if (h >= 5 && h < 12) return 'Buenos días 🏙'
      if (h >= 12 && h < 18) return 'Buenas tardes 🌤'
      return 'Buenas noches 🌙'
    }

   /*const { key } = await conn.sendMessage(m.chat, { text: 'ʟ ᴏ ᴀ ᴅ ɪ ɴ ɢ. . .' })
    const loadd = [
      '□□■■■■■■■■\n             𝟷𝟶٪',
      '■■□□■■■■■■\n             𝟹𝟶٪',
      '■■■■□□■■■■\n             𝟻𝟶٪',
      '■■■■■■□□■■\n             𝟾𝟶٪',
      '■■■■■■■■□□\n             𝟷𝟶𝟶٪',
      'ʟ ᴏ ᴀ ᴅ ɪ ɴ ɢ  ᴄ ᴏ ᴍ ᴘ ʟ ᴇ ᴛ ᴇ. . .'
    ]
    for (let i = 0; i < loadd.length; i++) {
      await sleep(750)
      // quitamos "edit" porque no es soportado en Baileys
      await conn.sendMessage(m.chat, { text: loadd[i] })
    }*/

    const _package = JSON.parse((await fsp.readFile(join(__dirname, '../package.json')).catch(() => '{}')).toString())
    const userData = (global.db?.data?.users?.[m.sender]) || {}
    const exp = userData.exp || 0
    const level = userData.level || 0
    const role = userData.role || 'Newbie'
    const limit = userData.limit || 20
    const money = userData.money || 10000
    const { min, xp, max } = xpRange(level, global.multiplier || 1)
    const name = (await conn.getName(m.sender)) || 'User'
    const meName = await conn.getName(conn.user?.id || conn.user?.jid || '')
    const totalreg = Object.keys(global.db?.data?.users || {}).length
    const rtotalreg = Object.values(global.db?.data?.users || {}).filter(u => u.registered).length
    const totalFitur = Object.keys(global.plugins || {}).length

    const d = new Date()
    const locale = 'es-PE'
    const week = d.toLocaleDateString(locale, { weekday: 'long', timeZone: 'America/Lima' })
    const date = d.toLocaleDateString(locale, { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'America/Lima' })
    const time = d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZone: 'America/Lima' })

    const _uptime = process.uptime() * 1000
    let _muptime
    if (process.send) {
      process.send('uptime')
      _muptime = (await new Promise(resolve => {
        process.once('message', resolve)
        setTimeout(resolve, 1000)
      })) * 1000
    }
    const muptime = clockString(_muptime || 0)
    const uptime = clockString(_uptime)

    const imgPath1 = join(__dirname, '../thumbnail.jpg')
    const thumbLocal = fs.existsSync(imgPath1) ? fs.readFileSync(imgPath1) : null
    const thumbResized = thumbLocal ? await resizeImage(thumbLocal, 300, 150) : null

    const headerGreet = `${limaGreetingText()}`
    const tagUser = '@' + m.sender.split('@')[0]

    const menu = `Hey *${tagUser}!* ${headerGreet}
Welcome To *${meName || 'MyBot'}*, Un Assistant WhatsApp listo para ayudarte y alegrar tu día!

╭──┈➤ *\`𝗜𝗡𝗙𝗢 𝗨𝗦𝗘𝗥\`*
│ 𔓕 *Nombre*  : ${name}
│ 𔓕 *Tag*     : ${tagUser}
│ 𔓕 *Rol*     : ${role}
│ 𔓕 *Nivel*   : ${level} (${(exp - (min || 0))}/${xp || 100})
│ 𔓕 *Límite*  : ${limit}
│ 𔓕 *Money*   : S/.${money.toLocaleString('es-PE')}
│ 𔓕 *Premium* : ${prem ? '✅' : '❌'}
╰────────────────┈➤

╭──┈➤ *\`𝗜𝗡𝗙𝗢 𝗕𝗢𝗧\`*
│ 𔓕 *Nombre*     : ${meName || 'Bot'}
│ 𔓕 *Owner*      : ${_package?.author?.name || 'dev'}
│ 𔓕 *Powered*    : WhatsApp Business
│ 𔓕 *Prefix*     : ${_p}
│ 𔓕 *Mode*       : ${global.opts?.['self'] ? 'Privado' : 'Público'}
│ 𔓕 *Total Fitur*: ${totalFitur}+
│ 𔓕 *Version*    : ${_package?.version || '1.0.0'}
│ 𔓕 *Language*   : Javascript
│ 𔓕 *Type*       : NodeJs/Case
│ 𔓕 *Library*    : Baileys-MD
│ 𔓕 *Uptime*     : ${uptime}
│ 𔓕 *Users*      : ${totalreg} (${rtotalreg} reg.)
│ 𔓕 *Hora*       : ${time} WIB
│ 𔓕 *Día*        : ${week}
│ 𔓕 *Fecha*      : ${date}
╰────────────────┈➤`.trim()

    const nativeFlowPayload = {
      header: {
        documentMessage: {
          url: 'https://mmg.whatsapp.net/v/t62.7119-24/539012045_745537058346694_1512031191239726227_n.enc',
          mimetype: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          fileSha256: Buffer.from('fa09afbc207a724252bae1b764ecc7b13060440ba47a3bf59e77f01924924bfe', 'hex'),
          fileLength: 1000000,
          pageCount: 0,
          mediaKey: Buffer.from('3163ba7c8db6dd363c4f48bda2735cc0d0413e57567f0a758f514f282889173c', 'hex'),
          fileName: '🧇 ᴍᴀʜɪʀᴜ sʜɪɪɴᴀ',
          fileEncSha256: Buffer.from('652f2ff6d8a8dae9f5c9654e386de5c01c623fe98d81a28f63dfb0979a44a22f', 'hex'),
          directPath: '/v/t62.7119-24/539012045_745537058346694_1512031191239726227_n.enc',
          mediaKeyTimestamp: Date.now(),
          jpegThumbnail: thumbResized || null,
          contextInfo: {
            mentionedJid: [m.sender],
            groupMentions: [],
            forwardingScore: 777,
            isForwarded: true
          }
        },
        hasMediaAttachment: true
      },
      body: { text: '' },
      footer: { text: menu },
      nativeFlowMessage: {
        buttons: [
          { name: 'single_select', buttonParamsJson: '{"has_multiple_buttons":true}' },
          { name: 'call_permission_request', buttonParamsJson: '{"has_multiple_buttons":true}' },
          {
            name: 'single_select',
            buttonParamsJson:
              '{"title":"𝚂𝚎𝚕𝚎𝚌𝚝 𝙼𝚎𝚗𝚞","sections":[{"title":"ᴍᴀʜɪʀᴜ sʜɪɪɴᴀ ʟᴀ ᴍᴇᴊᴏʀ 🫓","highlight_label":"🫩","rows":[{"title":"Info Grupos","description":"Información de grupos","id":".grupos"},{"title":"Info Bot","description":"Información del bot","id":".infobot"},{"title":"Menu All","description":"Menú completo","id":".allmenu"},{"title":"Auto Reg","description":"Registro automático","id":".reg user.19"},{"title":"Ping","description":"Velocidad del bot","id":".ping"},{"title":"Status","description":"Estado del bot","id":".status"}]}],"has_multiple_buttons":true}'
          },
          { name: 'cta_copy', buttonParamsJson: '{"display_text":"Copiar Código","id":"123456789","copy_code":"I Love You xrljose 😻"}' },
          {
            name: 'cta_url',
            buttonParamsJson:
              '{"display_text":"Canal de WhatsApp","url": channel}'
          }
        ],
        messageParamsJson:
          '{"limited_time_offer":{"text":"🧀 𝗠𝗲𝗻𝘂 𝗟𝗶𝘀𝘁","url":"https://github.com/xrljosedv","copy_code":"I LOVE XRLJOSE","expiration_time":1754613436864329}}'
      },
      contextInfo: {
        mentionedJid: [m.sender],
        forwardingScore: 777,
        isForwarded: true
      }
    }

    await conn.relayMessage(
      m.chat,
      {
        viewOnceMessage: {
          message: {
            interactiveMessage: nativeFlowPayload
          }
        }
      },
      { quoted: fkontak }
    )
  } catch (e) {
    console.error(e)
    await conn.reply(m.chat, 'Ocurrió un error al generar el menú.', m)
  }
}

handler.command = ['lis']
export default handler

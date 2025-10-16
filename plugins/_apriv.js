import { prepareWAMessageMedia } from '@whiskeysockets/baileys'
import moment from 'moment-timezone'

// 🧠 AUTO-MENSAJE CUANDO ALGUIEN LLEGA AL PRIVADO
export async function before(m, { conn }) {
  try {
    if (m.fromMe) return
    if (!m.message) return
    if (m.isGroup) return
    if (m.chat === '120363395205399025@newsletter') return

    let user = global.db.data.users[m.sender]
    if (!user) global.db.data.users[m.sender] = {}
    if (new Date() - (user.pc || 0) < 105000) return // 2 minutos

    //const icono = 'https://i.imgur.com/JQp4d9A.jpeg'
    const { imageMessage } = await prepareWAMessageMedia(
      { image: { url: icono } },
      { upload: conn.waUploadToServer }
    )

    const sections = [
      {
        title: "💻Información",
        highlight_label: "Más detalles",
        rows: [
          { title: "¿Qué más sabes hacer?", id: "tes" }
        ]
      },
      {
        title: "🤖Servicio",
        highlight_label: "ASESOR",
        rows: [
          { title: "Hablar con su desarrollador", id: "tes2" },
          { title: "📅Horario", id: "tes4" }
        ]
      },
      {
        title: "🌐Convivir",
        highlight_label: "Únete a nuestra comunidad",
        rows: [
          { title: "Grupo", id: "tes3" }
        ]
      }
    ]

    const buttonParamsJson = JSON.stringify({
      title: "OPCIONES",
      description: "Seleccione una opción",
      sections
    })

    const interactiveMessage = {
      body: { text: '*Le compartimos nuestro menú, para más detalles*' },
      footer: { text: 'Seleccione la *OPCIÓN* requerida para ser atendido:' },
      header: {
        hasMediaAttachment: true,
        imageMessage: imageMessage
      },
      nativeFlowMessage: {
        buttons: [{
          name: "single_select",
          buttonParamsJson: buttonParamsJson
        }]
      }
    }

    const message = {
      messageContextInfo: {},
      interactiveMessage
    }

    m.react('🤖')
    await m.reply(`🖐🏻 ¡Hola! ${m.pushName || 'usuario'}, mi nombre es ${global.wm || 'IzuBot'} y fui desarrollada para cumplir múltiples funciones en WhatsApp 🪀.

✧──────‧₊˚📁˚₊‧──────╮
│ Tengo muchos comandos
│ con diferentes funciones
│ como la descarga de videos,
│ audios, fotos y mucho más,
│ contiene búsquedas con
│ chatGPT y diversos juegos.
✧──────‧₊˚🎠˚₊‧──────╯

╭︶︶︶︶︶🌐︶︶︶︶︶╮
Síguenos en nuestro canal
y mantente informado....
╰︶︶︶︶︶🎉︶︶︶︶︶╯`)

    await conn.relayMessage(m.chat, { viewOnceMessage: { message } }, {})
    conn.sendFile(m.chat, ['./media/prueba3.mp3', './media/prueba4.mp3'].getRandom(), 'saludo.mp3', null, null, true, {
      type: 'audioMessage',
      ptt: true
    })

    user.pc = new Date * 1
  } catch (err) {
    console.log('❌ Error en mensaje automático:', err)
  }
}

// 🧩 COMANDOS TES (FUNCIONAN NORMALMENTE)
let handler = async (m, { conn, command }) => {
  if (command === 'tes') {
    conn.reply(m.chat, `> 🤖 _Además te ofrecemos funciones necesarias para tus grupos, por ejemplo el antilink, antiárabe y bienvenida automática y muchos más, todo lo puedes encontrar en el .menu._`, m)
  }

  if (command === 'tes2') {
    let teks = `🗿 *Hola creador* ⭐ El número Wa.me/${m.sender.split`@`[0]} quiere de tus servicios`
    conn.reply('50492280729@s.whatsapp.net', m.quoted ? teks + m.quoted.text : teks, null, {
      contextInfo: { mentionedJid: [m.sender] }
    })
    conn.reply(m.chat, `⚖️ _Por favor espere, nuestro siguiente asesor disponible le atenderá en breve..._\n\nSerá atendido por @50492280729 *🖐🏻 Solo para asuntos importantes, no molestar.*`, m)
  }

  if (command === 'tes3') {
    conn.reply(m.chat, `https://chat.whatsapp.com/Cy42GegnKSmCVA6zxWlxKU?mode=ac_t`, m)
  }
}

handler.command = ['tes', 'tes2', 'tes3']
export default handler

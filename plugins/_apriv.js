import { prepareWAMessageMedia } from '@whiskeysockets/baileys'
import moment from 'moment-timezone'

// ===============================================
// COMANDOS MANUALES (.tes, .tes2, .tes3)
// ===============================================
let handler = async (m, { conn, command }) => {

if (command == 'tes') {
  await conn.reply(m.chat, `> 🤖 _Además te ofrecemos funciones necesarias para tus grupos, como el antilink, antiárabe, bienvenida automática y muchos más. Todo lo puedes encontrar en el .menu._`, m)
}

if (command == 'tes2') {
  let teks = `🗿 *Hola creador* ⭐El número Wa.me/${m.sender.split`@`[0]} quiere de tus servicios`
  await conn.reply('50492280729@s.whatsapp.net', m.quoted ? teks + m.quoted.text : teks, null, { contextInfo: { mentionedJid: [m.sender] }})
  await conn.reply(m.chat, `⚖️ _Por favor espere, nuestro siguiente asesor disponible le atenderá en breve..._\n\nSerá atendido por @50492280729 *🖐🏻 Solo para asuntos importantes, no molestar.*`, m, { contextInfo: { mentionedJid: ['50492280729@s.whatsapp.net'] }})
}

if (command == 'tes3') {
  await conn.reply(m.chat, `🌐 *Únete a nuestro grupo oficial:*\nhttps://chat.whatsapp.com/Cy42GegnKSmCVA6zxWlxKU?mode=ac_t`, m)
}

}
handler.command = ['tes', 'tes2', 'tes3']
export default handler


// ===============================================
// RESPUESTA AUTOMÁTICA AL PRIVADO
// ===============================================
export async function before(m, { conn }) {
  try {
    if (m.fromMe) return !0
    if (m.isGroup) return !1
    if (!m.message) return !0
    if (m.chat === '120363395205399025@newsletter') return !0

    // Evitar spam (cooldown por usuario)
    let user = global.db.data.users[m.sender]
    if (!user) global.db.data.users[m.sender] = { pc: 0 }
    if (new Date() - user.pc < 105000) return !0  // ⏱️ 105 segundos como tú tenías

    // Imagen del menú
    //let icono = 'https://i.imgur.com/wNQmFhL.jpeg'
    const { imageMessage } = await prepareWAMessageMedia({ image: { url: icono } }, { upload: conn.waUploadToServer })

    // Secciones del menú
    const sections = [
      {
        title: "💻 Información",
        highlight_label: "Más detalles",
        rows: [{ title: "¿Qué más sabes hacer?", id: `.tes` }]
      },
      {
        title: "🤖 Servicio",
        highlight_label: "ASESOR",
        rows: [
          { title: "Hablar con su desarrollador", id: `.tes2 hola` },
          { title: "📅 Horario de atención", id: `.tes4` }
        ]
      },
      {
        title: "🌐 Comunidad",
        highlight_label: "Únete al grupo",
        rows: [{ title: "Grupo oficial", id: `.tes3` }]
      }
    ]

    const buttonParamsJson = JSON.stringify({
      title: "OPCIONES",
      description: "Seleccione una opción para continuar",
      sections: sections
    })

    // Mensaje interactivo
    const interactiveMessage = {
      body: { text: '*Le compartimos nuestro menú, para más detalles:*' },
      footer: { text: 'Seleccione la *OPCIÓN* requerida para ser atendido:' },
      header: { hasMediaAttachment: true, imageMessage },
      nativeFlowMessage: {
        buttons: [{ name: "single_select", buttonParamsJson }]
      }
    }

    // Presentación
    await m.react('🤖')
    await m.reply(`🖐🏻 ¡Hola! *${m.pushName}* mi nombre es *${wm}* y fui desarrollada para cumplir múltiples funciones en *WhatsApp🪀*.

✧──────‧₊˚📁˚₊‧──────╮
│ _Tengo muchos comandos_
│ _con diferentes funciones_
│ _como la descarga de videos,_
│ _audios, fotos y mucho más,_
│ _contiene búsquedas con_
│ _chatGPT y diversos juegos._
✧──────‧₊˚🎠˚₊‧──────╯

╭︶︶︶︶︶🌐︶︶︶︶︶╮
*Síguenos en nuestro canal*
*y mantente informado...*
╰︶︶︶︶︶🎉︶︶︶︶︶╯`)

    // Enviar menú interactivo
    await conn.relayMessage(m.chat, { viewOnceMessage: { message: { interactiveMessage } } }, {})

    // Audio de bienvenida
    const audios = ['./media/prueba3.mp3', './media/prueba4.mp3']
    await conn.sendFile(m.chat, audios[Math.floor(Math.random() * audios.length)], 'bienvenida.mp3', null, null, true, {
      type: 'audioMessage',
      ptt: true
    })

    // Actualiza tiempo del usuario
    user.pc = new Date() * 1
  } catch (e) {
    console.error('❌ Error en respuesta automática:', e)
  }
  return !1
}

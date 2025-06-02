import moment from 'moment-timezone'
import 'moment/locale/es'  // importa el locale español

let handler = async (m, { conn }) => {
  const thumbnail = await (await fetch(icono)).buffer()
  m.react('🍉')

  // Establece el locale a español
  moment.locale('es')

  // Obtiene la fecha completa en español
  let fechaEsp = moment.tz('America/Bogota').format('dddd, D [de] MMMM [de] YYYY')

  let txt = `${e} _*Hola ${m.pushName}*._

⚖️ \`Términos y Condiciones del Servicio\`

> ${e} Izubot y su equipo no se hacen responsables por el uso, contenido compartido, privacidad ni números involucrados en las interacciones con el bot.

👥 _El uso de Izubot es bajo tu propia responsabilidad. Se recomienda emplearlo de forma consciente y segura, respetando las normas aplicables y evitando cualquier conducta que pueda afectar la privacidad o seguridad de terceros._

🤖 *Este servicio se proporciona “tal cual”, sin garantías explícitas o implícitas. Izubot se reserva el derecho de modificar o interrumpir el servicio en cualquier momento sin previo aviso.*

🗓 *Fecha:* ${fechaEsp}

> © ${new Date().getFullYear()} Izubot. Todos los derechos reservados.`

  await conn.sendMessage(m.chat, {
    text: txt,
    footer: textbot,
    contextInfo: {
      mentionedJid: [m.sender],
      isForwarded: true,
      forwardedNewsletterMessageInfo: {
        newsletterJid: channelRD.id,
        newsletterName: channelRD.name,
        serverMessageId: -1,
      },
      forwardingScore: false,
      externalAdReply: {
        title: botname,
        body: textbot,
        thumbnailUrl: redes,
        thumbnail,
        sourceUrl: redes,
        mediaType: 1,
        showAdAttribution: true,
        renderLargerThumbnail: true,
      },
    },
  }, { quoted: m });
}
handler.command = ['reglas', 'términos', 'condiciones']
export default handler

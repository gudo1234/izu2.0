/*import { googleImage } from '@bochilteam/scraper'
import fetch from 'node-fetch'
import axios from 'axios'

const handler = async (m, { conn, text, usedPrefix, command }) => {
  const username = `${conn.getName(m.sender)}`
  const basePrompt = `Eres un moderador de IA confiable. Tu tarea es analizar peticiones de usuarios y decidir si contienen contenido delicado o inapropiado como pornografía, violencia explícita, racismo, etc.`

  if (!text) {
    return conn.reply(
      m.chat,
      `${e} Proporciona una búsqueda para enviar imágenes de la web\n\n` +
      `*Ejemplo:* \`${usedPrefix + command} carros\``,
      m
    )
  }
  try {
    const prompt = `${basePrompt}\n\nTexto a evaluar: "${text}"\n¿Este texto tiene contenido sensible? Responde solo con: sí o no.`
    const respuesta = await luminsesi(text, username, prompt)

    if (/^s[ií]/i.test(respuesta)) {
      return m.reply(`${e} *Búsqueda bloqueada*\n> No se puede compartir contenido delicado.`)
    }
  } catch (e) {
    console.error('Error al verificar contenido sensible:', e)
    return m.reply('Ocurrió un error al verificar la búsqueda.')
  }

  m.react('🕒')
  const res = await googleImage(text)
  const count = 9
  const promises = Array.from({ length: count }).map(() => res.getRandom())
  const links = await Promise.all(promises)

  for (let i = 0; i < links.length; i++) {
    try {
      const url = links[i]
      const imgBuffer = await fetch(url).then(r => r.buffer())
      m.react('✅')
      await conn.sendMessage(
        m.chat,
        {
          image: imgBuffer,
          caption: i === 0 ? `9 Resultados para: "${text}"` : undefined
        },
        { quoted: m }
      )
    } catch (err) {
      console.error(`Error al enviar imagen ${i + 1}:`, err)
    }
  }
}

handler.command = ['imagenes', 'images', 'imagen', 'image']
handler.group = true

export default handler
async function luminsesi(content, username, prompt) {
  try {
    const response = await axios.post("https://Luminai.my.id", {
      content,
      user: username,
      prompt,
      webSearchMode: false
    })
    return response.data.result
  } catch (error) {
    console.error('Error al usar Luminai:', error)
    throw error
  }
        }*/

import { googleImage } from '../lib/googleMedia.js'
import { owner, info, temp, newsletterID, sBroadCastID, groupID, media } from '../config.js'
import {getCommandVariants} from '../lib/functions.js'
let confirmations = {}
let handler = async (m, {conn, info, start, text, usedPrefix, command, userdb, senderJid}) => {
const forbiddenWords = [
// Agrega aquí las palabras que deseas filtrar
'lame', 'chupa', 'kaka', 'caca', 'bobo', 'boba', 'loco', 'loca', // ... y así sucesivamente
];
if (!text) {
let resp = `${e} Realiza una búsqueda de imágen de Google.\n\nEjemplo: *${usedPrefix + command} Minecraft*`

return conn.sendWritingText(m.chat, resp, userdb, m)
}
let prohibidas = /(lame|chupa|kaka|caca|bobo|boba|loco|loca|chupapolla|estupid(o|a|os)|poll(a|as)|idiota|maricon|chucha|v(erga|rga)|naco|zorra|zorro|zorras|zorros|pito|huev(on|ona|ones)|rctmre|mrd|ctm|csm|cp|hldv|ptm|baboso|babosa|babosos|babosas|feo|fea|feos|feas|web(o|os)|mamawebos|c(a|á)ll(a|ese|ate)|chupame|bolas|qliao|imb(e|é)c(il|iles)|kbrones|cabron|capullo|carajo|gore|gorre|gorreo|gordo|gorda|gordos|gordas|sapo|sapa|mierda|cerdo|cerda|puerco|puerca|perra|perro|joden|jodemos|joder|joderan|dumb|fuck|shit|bullshit|cunt|cum|semen|bitch|motherfucker|foker|fucking|g0re|g0r3|g.o.r.e|sap0|sap4|malparido|malparida|malparidos|malparidas|m4lp4rid0|m4lp4rido|m4lparido|malp4rido|m4lparid0|malp4rid0|chocha|chupala|chup4la|chup4l4|chupalo|chup4lo|chup4l0|chupal0|chupon|chupameesta|sabandija|hijodelagranputa|hijodeputa|hijadeputa|hijadelagranputa|kbron|kbrona|cajetuda|laconchadedios|put((o|a)|(i|1(t(a|o|4|0)))madre)|ptm|kk|culo|pussy|hentai|nepe|pene|p3ne|p3n3|pen3|p.e.n.e|pvt0|puto|pvto|put0|Hijodelagransetentamilparesdeputa|Chingadamadre|coño|c0ño|coñ0|c0ñ0|merda|mamon|caca|polla|porno|porn|gore|cum|semen|puta|puto|culo|putita|putito|puta|puto|pussy|hentai|pene|coño|asesinato|zoofilia|mia khalifa|desnudo|desnuda|cuca|chocha|muertos|pornhub|xnxx|xvideos|teta|vagina|marsha may|misha cross|sexmex|furry|furro|furra|xxx|rule|rule34|panocha|pedofilia|necrofilia|pinga|horny|ass|nude|popo|nsfw|femdom|futanari|erofeet|sexo|sex|yuri|ero|ecchi|blowjob|anal|ahegao)/ig.test(text.toLowerCase())
if (prohibidas) return 
const palabrasComunes = /(\b(de|un(a)?|los|las|y|o|en|con|por|para)\b\s*)+/ig;

const textoFiltrado = text.replace(palabrasComunes, "").trim();
console.log();

const res = await googleImage(textoFiltrado)
let image = await res.getRandom()
let link = image
let captionn = `🔎 *RESULTADO DE:* ${text}\n🔗 *LINK ${link}\n🌎 *BUSCADOR:* Google`
confirmations[m.chat] = {
sender: m.sender,
query: text,
usedPrefix,
command,
timeout: setTimeout(() => {
delete confirmations[m.sender];
}, 60 * 1000),
};
const messageObj = {
text: captionn,
footer: info.nbcde
}
const buttons = [['🔄 SIGUIENTE 🔄', 'siguiente']]
if (start.buttons) {
return conn.sendButton(m.chat, messageObj, {url: image}, buttons, userdb, m)
} else {
captionn += `\n\nPara 🔄 SIGUIENTE 🔄 usa: *${usedPrefix}imagen ${text}*`
return conn.sendMessage(m.chat, { image:{url: image}, caption: captionn}, {quoted: m, ephemeralExpiration: 24*60*100, disappearingMessagesInChat: 24*60*100}, info.nbcde , link, m)
}
}
handler.before = async function before(m, {conn, info, start, userdb, senderJid}) {
const confirmation = confirmations[m.chat];
if (!confirmation) return;
console.log('imagenBefore: ', m.message, m.message.buttonsResponseMessage?.selectedId)
const response = (m.message.templateButtonReplyMessage?.selectedId ? m.message.templateButtonReplyMessage.selectedId : m.text).toLowerCase();
if (response === 'siguiente') {
clearTimeout(confirmation.timeout);
return handler(m, {conn, info, start, text: confirmation.query, usedPrefix: confirmation.usedPrefix, command: confirmation.command, userdb, senderJid})
}
}

handler.command = ['gimage', 'image', 'imagen']
/*handler.menu = [
{title: "📥 IMAGEN", description: `solicita imagenes usando:\n${Array.isArray(handler.command) ? handler.command.map(hc => ` #${hc} <texto>`).join('\n') : getCommandVariants(handler.command).map(hc => ` #${hc} <texto>`).join('\n')}`, id: `imagen`}, 
];*/
handler.group = true;

export default handler

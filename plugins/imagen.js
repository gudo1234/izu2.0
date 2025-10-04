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
import { info } from '../settings.js'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  // Palabras prohibidas
  const prohibidas = /(lame|chupa|kaka|caca|bobo|boba|loco|loca|chupapolla|estupid(o|a|os)|poll(a|as)|idiota|maricon|chucha|v(erga|rga)|naco|zorra|zorro|zorras|zorros|pito|huev(on|ona|ones)|rctmre|mrd|ctm|csm|cp|hldv|ptm|baboso|babosa|babosos|babosas|feo|fea|feos|feas|web(o|os)|mamawebos|c(a|á)ll(a|ese|ate)|chupame|bolas|qliao|imb(e|é)c(il|iles)|kbrones|cabron|capullo|carajo|gore|gorre|gorreo|gordo|gorda|gordos|gordas|sapo|sapa|mierda|cerdo|cerda|puerco|puerca|perra|perro|joden|jodemos|joder|joderan|dumb|fuck|shit|bullshit|cunt|cum|semen|bitch|motherfucker|foker|fucking|g0re|g0r3|g.o.r.e|sap0|sap4|malparido|malparida|malparidos|malparidas|m4lp4rid0|m4lp4rido|m4lparido|malp4rido|m4lparid0|malp4rid0|chocha|chupala|chup4la|chup4l4|chupalo|chup4lo|chup4l0|chupal0|chupon|chupameesta|sabandija|hijodelagranputa|hijodeputa|hijadeputa|hijadelagranputa|kbron|kbrona|cajetuda|laconchadedios|put((o|a)|(i|1(t(a|o|4|0)))madre)|ptm|kk|culo|pussy|hentai|nepe|pene|p3ne|p3n3|pen3|p.e.n.e|pvt0|puto|pvto|put0|Hijodelagransetentamilparesdeputa|Chingadamadre|coño|c0ño|coñ0|c0ñ0|merda|mamon|caca|polla|porno|porn|gore|cum|semen|puta|puto|culo|putita|putito|puta|puto|pussy|hentai|pene|coño|asesinato|zoofilia|mia khalifa|desnudo|desnuda|cuca|chocha|muertos|pornhub|xnxx|xvideos|teta|vagina|marsha may|misha cross|sexmex|furry|furro|furra|xxx|rule|rule34|panocha|pedofilia|necrofilia|pinga|horny|ass|nude|popo|nsfw|femdom|futanari|erofeet|sexo|sex|yuri|ero|ecchi|blowjob|anal|ahegao)/i

  if (!text) {
    return conn.sendMessage(m.chat, { text: `📷 Realiza una búsqueda de imagen de Google.\n\nEjemplo: *${usedPrefix + command} Minecraft*` }, { quoted: m })
  }

  if (prohibidas.test(text.toLowerCase())) {
    return conn.sendMessage(m.chat, { text: '⚠️ No se permiten búsquedas con contenido inapropiado.' }, { quoted: m })
  }

  try {
    // Quita palabras comunes para una mejor búsqueda
    const palabrasComunes = /(\b(de|un(a)?|los|las|y|o|en|con|por|para)\b\s*)+/ig
    const textoFiltrado = text.replace(palabrasComunes, '').trim()

    const res = await googleImage(textoFiltrado)
    const img = await res.getRandom()

    if (!img) throw new Error('No se encontraron imágenes.')

    const caption = `🔎 *RESULTADO DE:* ${text}\n🌎 *BUSCADOR:* Google`

    await conn.sendFile(m.chat, img, 'Thumbnail.jpg', caption, m, null, { contextInfo: { forwardingScore: 999, isForwarded: true } })
  } catch (e) {
    console.error('[❌ ERROR EN BUSCADOR DE IMAGENES]', e)
    await conn.sendMessage(
      m.chat,
      {
        text: `⚠️ *Ocurrió un error al buscar la imagen:*\n\n📄 *Mensaje:* ${e.message}\n📍 *Línea:* ${e.stack?.split('\n')[1] || 'Desconocida'}`,
      },
      { quoted: m }
    )
  }
}

handler.command = ['gimage', 'image', 'imagen']
handler.group = true

export default handler

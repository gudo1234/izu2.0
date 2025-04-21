/*import fetch from 'node-fetch'

let handler = async (m, { conn, command, text }) => {
if (!text) return m.reply(`${e} Ejemplo de uso .${command} hola`)

try {
let api = await fetch(`https://delirius-apiofc.vercel.app/ia/gptweb?text=${text}`)
//let api = await fetch(`https://api.dorratz.com/ai/gemini?prompt=${text}`)

  let json = await api.json()
m.reply(json.data)
} catch (error) {
console.error(error)
}}

handler.command = ['ia','chatgpt', 'gpt']
handler.group = true;

export default handler*/

import fetch from 'node-fetch'

let handler = async (m, { conn, command, text }) => {
  if (!text) return m.reply(`Ejemplo de uso: .${command} ¿Qué es la inteligencia artificial?`)

  try {
    const url = `https://api.dorratz.com/ai/gemini?prompt=${encodeURIComponent(text)}`
    const res = await fetch(url)
    const data = await res.json()

    if (!data || !data.result) {
      return m.reply('No se pudo obtener una respuesta válida de Gemini.')
    }

    return m.reply(data.result)
  } catch (err) {
    console.error(err)
    return m.reply('Ocurrió un error al conectarse con Gemini.')
  }
}

handler.command = ['ia', 'chatgpt', 'gpt']
handler.group = true // ponlo en true si quieres que funcione solo en grupos

export default handler

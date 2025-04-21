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
  if (!text) return m.reply(`Ejemplo de uso: .${command} hola`)

  try {
    const res = await fetch(`https://api.dorratz.com/ai/gemini?prompt=${encodeURIComponent(text)}`)
    if (!res.ok) throw await res.text()
    const json = await res.json()
    const reply = json.result || 'No se recibió respuesta válida.'

    m.reply(reply)
  } catch (e) {
    console.error(e)
    m.reply('Ocurrió un error al procesar tu solicitud.')
  }
}

handler.command = ['ia', 'chatgpt', 'gpt']
handler.group = true

export default handler

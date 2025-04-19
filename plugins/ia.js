import fetch from 'node-fetch'

let handler = async (m, { conn, command, text }) => {
if (!text) return m.reply(`${e} Ejemplo de uso .${command} hola`)

try {
let api = await fetch(`https://delirius-apiofc.vercel.app/ia/gptweb?text=${text}`)
let json = await api.json()
m.reply(json.data)
} catch (error) {
console.error(error)
}}

handler.command = ['ia','chatgpt']

export default handler

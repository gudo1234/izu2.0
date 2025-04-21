import fs from 'fs'
let handler = async (m, { usedPrefix, command, text }) => {
let ar = Object.keys(plugins)
let ar1 = ar.map(v => v.replace('.js', ''))
if (!text) throw `${e} INGRESA EL TEXTO DEL PLUGIN\nejemplo:\n${usedPrefix + command} menu`
if (!ar1.includes(text)) return m.reply(`'${text}' tidak ditemukan!\n\n${ar1.map(v => ' ' + v).join`\n`}`)
m.reply(fs.readFileSync('./plugins/' + text + '.js', 'utf-8'))
}

handler.command = ['verplu']
handler.owner = true
export default handler

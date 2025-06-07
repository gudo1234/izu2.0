const handler = async (m, {conn, args, usedPrefix, command}) => {

let contact = 'https://wa.me/50492280729?text=aqui+está+mi+pack🔥'
const messages = [
[`hola`, 
'', 'https://raw.githubusercontent.com/CheirZ/Repo-img/main/zeus-jpeg/me10.jpg',
[],
[],
[[], ['🌎Canal', channel], ['🌱Intagram', 'https://www.instagram.com/edar504__']],
[]
], [ 
`hola2`, 
'', icono,
[],
[],
[[], ['🗿Owner', contact], [`${e} github`, 'https://github.com/edar123']],
[]
], [ 
`hola3`, 
'', 'https://raw.githubusercontent.com/CheirZ/Repo-img/main/zeus-jpeg/me20.jpg',
[],
[],
[[], ['🤝Donar', contact], ['🔆Socializar', contact]],
[]
]]

conn.sendCarousel(m.chat, null, null, null, messages)
}

handler.command = ['test1']
export default handler

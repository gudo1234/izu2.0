import fetch from 'node-fetch'

const usuariosSaludados = new Set()

let handler = async (m, { conn }) => {
  if (m.fromMe || !m.text) return
  if (/^[!#./\\]/.test(m.text)) return
  if (usuariosSaludados.has(m.sender)) return
  usuariosSaludados.add(m.sender)

  // Imagen simulando el "Anuncio de Facebook"
  const urlImg = icono // puedes cambiarla por la de tu negocio
  const imgBuffer = await fetch(urlImg).then(res => res.buffer())

  // Enviar imagen tipo anuncio
  await conn.sendMessage(m.chat, {
    image: imgBuffer,
    caption: 'Anuncio de Facebook\nVer detalles'
  })

  // Enviar saludo automático
  await conn.sendMessage(m.chat, {
    text: '¡Hola, ! ¿Cómo podemos ayudarte?',
    footer: 'Saludo automático'
  }, { quoted: m })
}

export default handler

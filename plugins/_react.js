import fetch from 'node-fetch'

let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args[0] || !args[1]) {
    return m.reply(`${e} Ejemplo de uso:\n${usedPrefix + command} https://whatsapp.com/channel/ejemplo 🔥,❤️`)
  }

  const link = args[0]
  const emojisInput = args.slice(1).join(' ')
  const emojis = emojisInput.includes(',')
    ? emojisInput.split(',').map(e => e.trim()).filter(Boolean)
    : emojisInput.split(/\s+/).map(e => e.trim()).filter(Boolean)

  try {
    const { result, used } = await reactChannel(link, emojis)
    await m.reply(`✅ Reacción enviada.\n🔐 Autenticación: ${used}\n📦 Respuesta: ${result}`)
  } catch (e) {
    console.error(e)
    await m.reply(`${e} Error al enviar reacción:\n${e.message || e}`)
  }
}

handler.command = ['reactchannel', 'reactch', 'rch']
export default handler

async function reactChannel(link, emojis) {
  const cook = [
    "jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5MGQ4NzgwMWMxMWE4OTczYTNjYzlmNCIsImlhdCI6MTc2MjQ5NDU4OCwiZXhwIjoxNzYzMDk5Mzg4fQ.bpevgu4ZreExU7laYNqCipt5jXCUg-ogiGPoCX7BGNM"
  ]
  const bearers = [
    "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5MTNlNzZhYWNhMTZiNGNjNDc1MWJhYiIsImlhdCI6MTc2MjkxMjc4MiwiZXhwIjoxNzYzNTE3NTgyfQ.Pu6zGEtWb79nyUkm2J-aKwVIEwJGgMY5ehHJCzyKJSQ"
  ]
  const useBearer = Math.random() < 0.5
  const headerAuth = useBearer
    ? { 'authorization': bearers[Math.floor(Math.random() * bearers.length)] }
    : { 'cookie': cook[Math.floor(Math.random() * cook.length)] }

  const res = await fetch('https://foreign-marna-sithaunarathnapromax-9a005c2e.koyeb.app/api/channel/react-to-post', {
    method: 'POST',
    headers: {
      'accept': 'application/json, text/plain, */*',
      'content-type': 'application/json',
      ...headerAuth,
      'origin': 'https://asitha.top',
      'referer': 'https://asitha.top/',
      'user-agent': 'Mozilla/5.0 (Linux; Android 10; Chrome/137.0.0.0) Safari/537.36'
    },
    body: JSON.stringify({
      post_link: link,
      reacts: emojis
    })
  })

  const result = await res.text()
  console.log(`✅ React succes ${link}\n🌟 Emoji: ${emojis}\n📦 Response: ${result}\n🔐 use: ${useBearer ? 'Bearer' : 'Cookie'}`)
  return { result, used: useBearer ? 'Bearer' : 'Cookie' }
    }

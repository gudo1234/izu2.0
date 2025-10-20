import fetch from 'node-fetch'

const handler = async (m, { conn, text, usedPrefix, command }) => {
  const author = 'Ixumi' // cámbialo si quieres
  const username = m.pushName || 'Usuario'

  const basePrompt = `Tu nombre es IzuBot, una inteligencia artificial creada por ${author}.
Responde de forma natural, clara y sin exageraciones.
Habla de manera fluida, como una persona normal que conversa.
Usa español neutro y responde directamente sin tono teatral.
Separa bien las ideas con puntos y saltos de línea cuando sea necesario.`

  if (!text) return m.reply(`🧠 *Uso correcto:*\n> ${usedPrefix + command} ¿Qué es la inteligencia artificial?`, m, fake)

  try {
    await m.react && m.react('💭')

    const prompt = `${basePrompt}\n\n${username} dice: ${text}\n\nResponde de forma natural.`
    const apiUrl = `https://api.dorratz.com/ai/gpt?prompt=${encodeURIComponent(prompt)}`

    const res = await fetch(apiUrl)
    if (!res.ok) throw new Error(`Error HTTP ${res.status}`)

    const raw = await res.text() // leemos como texto por seguridad
    let resultValue = null

    // 1) Intentar parsear como JSON válido
    try {
      const parsed = JSON.parse(raw)
      if (parsed && (parsed.result !== undefined)) resultValue = parsed.result
      else if (parsed && parsed.data && parsed.data.result !== undefined) resultValue = parsed.data.result
    } catch (err) {
      // no es JSON válido — se intentará extraer el campo result con regex más abajo
    }

    // 2) Si no obtuvimos result, intentar extraer con regex desde el texto bruto
    if (resultValue == null) {
      // busca "result": "...." o 'result': '....' incluso con escapados
      const mres = raw.match(/["']?result["']?\s*:\s*["']([\s\S]*?)["']\s*(,|\}|$)/i)
      if (mres && mres[1]) resultValue = mres[1]
    }

    // 3) Si sigue null, usar todo el texto como fallback (pero avisar)
    if (resultValue == null) {
      // si el raw parece ser '{"result":...}' pero no fue capturado, intentar un parse más permisivo
      // fallback: intentar extraer la primera ocurrencia entre llaves que contenga result
      const idx = raw.indexOf('"result"')
      if (idx !== -1) {
        // tomar substring cerca y reintentar parse
        const snippet = raw.slice(Math.max(0, idx - 50), Math.min(raw.length, idx + 500))
        const m2 = snippet.match(/["']?result["']?\s*:\s*["']([\s\S]*?)["']/i)
        if (m2 && m2[1]) resultValue = m2[1]
      }
    }

    if (resultValue == null) {
      // por último, si raw es algo simple, usarlo
      const simple = raw.trim()
      if (simple) resultValue = simple
    }

    if (resultValue == null) throw new Error('No se pudo extraer el campo result de la respuesta de la API.')

    // limpiar comillas envolventes extra: puede venir "\"texto...\"" o '"texto..."'
    resultValue = String(resultValue).trim()
    // quitar comillas de inicio/fin si existen
    resultValue = resultValue.replace(/^"(.*)"$/s, '$1').replace(/^'(.*)'$/s, '$1')
    // si el result venía como string con comillas escapadas al inicio y fin: \"...\" -> quitar
    resultValue = resultValue.replace(/^\\+"|\\+"$/g, '')

    // enviar SOLO el contenido de result
    await m.reply(`🤖 *ChatGPT responde:*\n\n${resultValue}`, m, fake)
    await m.react && m.react('✅')
  } catch (e) {
    console.error('Error IA:', e)
    await m.react && m.react('❌')
    await m.reply('❌ Error al procesar la solicitud. Asegúrate de que la API responda JSON con la clave "result".', m, fake)
  }
}

handler.command = ['chatgpt', 'ia', 'bot']
handler.group = true
export default handler

import fetch from 'node-fetch';

// Número de Meta AI simulado
const metaAI = '13135550002@s.whatsapp.net';

// Handler BEFORE: detecta menciones a @AI y responde
let handler = async (m, { conn }) => {
  if (!m.mentionedJid || !m.mentionedJid.includes(metaAI)) return;
  if (m.fromMe) return;

  const texto = m.text || '';
  if (!texto) return;

  try {
    // Puedes cambiar esto por tu propia API de IA (como OpenAI)
    const respuesta = await generarRespuestaIA(texto);

    await conn.sendMessage(m.chat, {
      text: `@${m.sender.split('@')[0]} ${respuesta}`,
      mentions: [m.sender]
    }, { quoted: m });

  } catch (err) {
    console.error('[IA META] Error generando respuesta:', err);
    m.reply('⚠️ Ocurrió un error al generar la respuesta.');
  }
};

handler.before = true;
export default handler;

// Función que genera la respuesta IA (puedes cambiarla por OpenAI)
async function generarRespuestaIA(prompt) {
  try {
    const res = await fetch(`https://api.akuari.my.id/ai/gpt?chat=${encodeURIComponent(prompt)}`);
    const json = await res.json();
    return json.respuesta || 'Lo siento, no entendí eso.';
  } catch (e) {
    return 'No pude generar una respuesta en este momento.';
  }
}

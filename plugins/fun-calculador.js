const handler = async (m, { conn, command, text, usedPrefix }) => {
  if (!text) return conn.reply(m.chat, `${e} Por favor, mensiona a un Usuario para comprobar su test.`, m);
  const percentages = (500).getRandom();
  let emoji = '';
  let description = '';
  switch (command) {
    case 'gay':
      emoji = '🏳️‍🌈';
      if (percentages < 50) {
        description = `💙 Los calculos han arrojado que ${text.toUpperCase()} es *${percentages}%* Gay ${emoji}\n> ${e} Eso es bajo, ¡Tu eres Joto, no Gay!`;
      } else if (percentages > 100) {
        description = `💜 Los calculos han arrojado que ${text.toUpperCase()} es *${percentages}%* Gay ${emoji}\n> ${e} ¡Incluso más gay de lo que pensábamos!`;
      } else {
        description = `🖤 Los calculos han arrojado que ${text.toUpperCase()} es *${percentages}%* Gay ${emoji}\n> ${e} Lo tuyo, lo tuyo es que eres Gay.`;
      }
      break;
    case 'lesbiana':
      emoji = '🏳️‍🌈';
      if (percentages < 50) {
        description = `👻 Los cálculos han arrojado que ${text.toUpperCase()} es *${percentages}%* ${command} ${emoji}\n${e} Quizás necesites más películas románticas en tu vida.`;
      } else if (percentages > 100) {
        description = `❣️ Los cálculos han arrojado que ${text.toUpperCase()} es *${percentages}%* ${command} ${emoji}\n> ${e} ¡Eso es un amor extremo por las Chicas!`;
      } else {
        description = `💗 Los cálculos han arrojado que ${text.toUpperCase()} es *${percentages}%* ${command} ${emoji}\n> ${e} Mantén el amor floreciendo!`;
      }
      break;
    case 'pajero':
    case 'pajera':
      emoji = '😏💦';
      if (percentages < 50) {
        description = `🧡 Los cálculos han arrojado que ${text.toUpperCase()} es *${percentages}%* ${command} ${emoji}\n> ${e} Tal vez necesites más hobbies!`;
      } else if (percentages > 100) {
        description = `💕 Los cálculos han arrojado que ${text.toUpperCase()} es *${percentages}%* ${command} ${emoji}\n> ${e} Eso es una resistencia admirable!`;
      } else {
        description = `💞 Los cálculos han arrojado que ${text.toUpperCase()} es *${percentages}%* ${command} ${emoji}\n> ${e} Mantén el buen trabajo (en solitario).`;
      }
      break;
    case 'puto':
    case 'puta':
      emoji = '🔥🥵';
      if (percentages < 50) {
        description = `😼 Los cálculos han arrojado que ${text.toUpperCase()} es *${percentages}%* ${command} ${emoji}\n> ${e} ¡Más suerte en tu próxima conquista!`;
      } else if (percentages > 100) {
        description = `😻 Los cálculos han arrojado que ${text.toUpperCase()} es *${percentages}%* ${command}. ${emoji}\n> ${e} ¡Estás en llamas!`;
      } else {
        description = `😺 Los cálculos han arrojado que ${text.toUpperCase()} es *${percentages}%* ${command} ${emoji}\n> ${e} Mantén ese encanto ardiente!`;
      }
      break;
    case 'manco':
    case 'manca':
      emoji = '💩';
      if (percentages < 50) {
        description = `🌟 Los cálculos han arrojado que ${text.toUpperCase()} es *${percentages}%* ${command} ${emoji}\n> ${e} ¡No eres el único en ese club!`;
      } else if (percentages > 100) {
        description = `💌 Los cálculos han arrojado que ${text.toUpperCase()} es *${percentages}%* ${command} ${emoji}\n> ${e} ¡Tienes un talento muy especial!`;
      } else {
        description = `🥷 Los cálculos han arrojado que ${text.toUpperCase()} es *${percentages}%* ${command} ${emoji}\n> ${e} Mantén esa actitud valiente!`;
      }
      break;
    case 'rata':
      emoji = '🐁';
      if (percentages < 50) {
        description = `💥 Los cálculos han arrojado que ${text.toUpperCase()} es *${percentages}%* ${command} ${emoji}\n> ${e} Nada de malo en disfrutar del queso!`;
      } else if (percentages > 100) {
        description = `💖 Los cálculos han arrojado que ${text.toUpperCase()} es *${percentages}%* ${command} ${emoji}\n> ${e} Un auténtico ratón de lujo!`;
      } else {
        description = `👑 Los cálculos han arrojado que ${text.toUpperCase()} es *${percentages}%* ${command} ${emoji}\n> ${e} Come queso con responsabilidad!`;
      }
      break;
    case 'prostituto':
    case 'prostituta':
      emoji = '🫦👅';
      if (percentages < 50) {
        description = `${e} Los cálculos han arrojado que ${text.toUpperCase()} es *${percentages}%* ${command} ${emoji}\n> ${e} El mercado está en auge!`;
      } else if (percentages > 100) {
        description = `💖 Los cálculos han arrojado que ${text.toUpperCase()} es *${percentages}%* ${command} ${emoji}\n> ${e} Un/a verdadero/a profesional!`;
      } else {
        description = `✨️ Los cálculos han arrojado que ${text.toUpperCase()} es *${percentages}%* ${command} ${emoji}\n> ${e} Siempre es hora de negocios!`;
      }
      break;
      default:
      m.reply(`🍭 Comando inválido.`);
  }
  const responses = [
    "El universo ha hablado.",
    "Los científicos lo confirman.",
    "¡Sorpresa!"
  ];
  const response = responses[Math.floor(Math.random() * responses.length)];
  const cal = `💫 *CALCULADORA*

${description}

➤ ${response}`.trim()  
  async function loading() {
var hawemod = [
"${e} █▒▒▒▒▒▒▒▒▒▒▒${e}10%",
"${e} ████▒▒▒▒▒▒▒▒${e}30%",
"${e} ███████▒▒▒▒▒${e}50%",
"${e} ██████████▒▒${e}80%",
"${e} ████████████${e}100%"
]
   let { key } = await conn.sendMessage(m.chat, {text: `🤍 ¡Calculando Porcentaje!`, mentions: conn.parseMention(cal)}, {quoted: fkontak})
 for (let i = 0; i < hawemod.length; i++) {
   await new Promise(resolve => setTimeout(resolve, 1000)); 
   await conn.sendMessage(m.chat, {text: hawemod[i], edit: key, mentions: conn.parseMention(cal)}, {quoted: fkontak}); 
  }
  await conn.sendMessage(m.chat, {text: cal, edit: key, mentions: conn.parseMention(cal)}, {quoted: fkontak});         
 }
loading()    
};
handler.group = true;
handler.command = ['gay', 'lesbiana', 'pajero', 'pajera', 'puto', 'puta', 'manco', 'manca', 'rata', 'prostituta', 'prostituto'];

export default handler;

import gtts from 'node-gtts';
import {readFileSync, unlinkSync} from 'fs';
import {join} from 'path';

const defaultLang = 'es';

const idiomasSoportados = {
  'af': 'Afrikaans',
  'ar': 'Árabe',
  'bn': 'Bengalí',
  'ca': 'Catalán',
  'cs': 'Checo',
  'cy': 'Galés',
  'da': 'Danés',
  'de': 'Alemán',
  'el': 'Griego',
  'en': 'Inglés',
  'en-us': 'Inglés (EE.UU)',
  'en-au': 'Inglés (AU)',
  'en-uk': 'Inglés (UK)',
  'eo': 'Esperanto',
  'es': 'Español',
  'es-us': 'Español (USA)',
  'et': 'Estonio',
  'fi': 'Finés',
  'fr': 'Francés',
  'gu': 'Guyaratí',
  'hi': 'Hindi',
  'hr': 'Croata',
  'hu': 'Húngaro',
  'id': 'Indonesio',
  'is': 'Islandés',
  'it': 'Italiano',
  'ja': 'Japonés',
  'jw': 'Javanés',
  'km': 'Jemer',
  'ko': 'Coreano',
  'la': 'Latín',
  'lv': 'Letón',
  'mk': 'Macedonio',
  'ml': 'Malayalam',
  'mr': 'Maratí',
  'my': 'Birmano',
  'ne': 'Nepalí',
  'nl': 'Neerlandés',
  'no': 'Noruego',
  'pl': 'Polaco',
  'pt': 'Portugués',
  'pt-br': 'Portugués (Brasil)',
  'ro': 'Rumano',
  'ru': 'Ruso',
  'si': 'Cingalés',
  'sk': 'Eslovaco',
  'sq': 'Albanés',
  'sr': 'Serbio',
  'su': 'Sundanés',
  'sv': 'Sueco',
  'sw': 'Suajili',
  'ta': 'Tamil',
  'te': 'Telugu',
  'th': 'Tailandés',
  'tr': 'Turco',
  'uk': 'Ucraniano',
  'ur': 'Urdu',
  'vi': 'Vietnamita',
  'zh-cn': 'Chino (Mandarín)',
  'zh-tw': 'Chino (Taiwán)',
  'zu': 'Zulú',
};

const handler = async (m, {conn, args, usedPrefix, command}) => {
  let lang = args[0];
  let text = args.slice(1).join(' ');

  if (args[0] === 'list' || args[0] === 'help') {
    let listado = Object.entries(idiomasSoportados)
      .map(([codigo, nombre]) => `• \`${codigo}\` - ${nombre}`)
      .join('\n');
    return m.reply(`${e} *Idiomas disponibles para TTS:*\n> Ejemplo de uso .tts ja <texto>\n\n${listado}`);
  }

  if (!idiomasSoportados[lang]) {
    lang = defaultLang;
    text = args.join(' ');
  }

  if (!text && m.quoted?.text) text = m.quoted.text;
  if (!text) {
    return m.reply(`${e} *Texto no encontrado*\n\nEjemplo:\n${usedPrefix + command} es Hola\n\n> Idiomas disponibles`);
  }

  try {
    const res = await tts(text, lang);
    if (res) {
      conn.sendFile(m.chat, res, 'tts.opus', null, m, true);
    }
  } catch (e) {
    m.reply(`Error al generar TTS: ${e}`);
  }
};

handler.command = ['tts', 'voz'];
handler.group = true;

export default handler;

function tts(text, lang = 'es') {
  console.log(lang, text);
  return new Promise((resolve, reject) => {
    try {
      const tts = gtts(lang);
      const filePath = join(global.__dirname(import.meta.url), '../tmp', (1 * new Date) + '.wav');
      tts.save(filePath, text, () => {
        const buffer = readFileSync(filePath);
        unlinkSync(filePath);
        resolve(buffer);
      });
    } catch (e) {
      reject(e);
    }
  });
}

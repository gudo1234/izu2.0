let handler = async (m, { conn }) => {
  await new Promise(resolve => setTimeout(resolve, 2000));
  let archivos = require('fs').readdirSync('./plugins').filter(file => file.endsWith('.js'));
  // Aquí puedes hacer algo con la lista de archivos si quieres
};
export default handler;

/*const handler = async (m, {conn, args, usedPrefix, command}) => {

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
export default handler*/

const handler = async (m, { conn }) => {

  const contact = 'https://wa.me/50492280729?text=aqui+está+mi+pack🔥';
  const channel = 'https://t.me/+vJqN7uGp_SM1MzQx';

  const images = [
    'https://raw.githubusercontent.com/CheirZ/Repo-img/main/zeus-jpeg/me.jpg',
    'https://raw.githubusercontent.com/CheirZ/Repo-img/main/zeus-jpeg/me2.jpg',
    'https://raw.githubusercontent.com/CheirZ/Repo-img/main/zeus-jpeg/me3.jpg',
    'https://raw.githubusercontent.com/CheirZ/Repo-img/main/zeus-jpeg/me4.jpg',
    'https://raw.githubusercontent.com/CheirZ/Repo-img/main/zeus-jpeg/me5.jpg',
    'https://raw.githubusercontent.com/CheirZ/Repo-img/main/zeus-jpeg/me6.jpg',
    'https://raw.githubusercontent.com/CheirZ/Repo-img/main/zeus-jpeg/me7.jpg',
    'https://raw.githubusercontent.com/CheirZ/Repo-img/main/zeus-jpeg/me8.jpg',
    'https://raw.githubusercontent.com/CheirZ/Repo-img/main/zeus-jpeg/me9.jpg',
    'https://raw.githubusercontent.com/CheirZ/Repo-img/main/zeus-jpeg/me10.jpg'
  ];

  const iconos = ['🌟','🔥','🎁','🦄','🍀','⚡','💎','👑','🌈','🚀'];

  const messages = images.map((img, index) => [
    `Título ${index + 1}`,
    'Descripción aquí',
    iconos[index % iconos.length], // Rota los iconos si hay menos que imágenes
    [],
    [],
    [
      [],
      ['🌐 Canal', channel],
      ['📱 Instagram', 'https://www.instagram.com/edar504__'],
      ['👤 Owner', contact]
    ],
    [],
    img // Imagen de portada del carrusel
  ]);

  conn.sendCarousel(m.chat, null, null, null, messages);
};

handler.command = ['test1'];
export default handler;

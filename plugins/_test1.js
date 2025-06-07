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
  let contact = 'https://wa.me/50492280729?text=aqui+está+mi+pack🔥';
  let channel = 'https://t.me/+vJqN7uGp_SM1MzQx';

  const imagenes = [
    'https://raw.githubusercontent.com/CheirZ/Repo-img/main/zeus-jpeg/me.jpg',
    'https://raw.githubusercontent.com/CheirZ/Repo-img/main/zeus-jpeg/me2.jpg',
    'https://raw.githubusercontent.com/CheirZ/Repo-img/main/zeus-jpeg/me3.jpg',
    'https://raw.githubusercontent.com/CheirZ/Repo-img/main/zeus-jpeg/me4.jpg',
    'https://raw.githubusercontent.com/CheirZ/Repo-img/main/zeus-jpeg/me5.jpg',
    'https://raw.githubusercontent.com/CheirZ/Repo-img/main/zeus-jpeg/me6.jpg',
    'https://raw.githubusercontent.com/CheirZ/Repo-img/main/zeus-jpeg/me7.jpg',
    'https://raw.githubusercontent.com/CheirZ/Repo-img/main/zeus-jpeg/me8.jpg',
    'https://raw.githubusercontent.com/CheirZ/Repo-img/main/zeus-jpeg/me9.jpg',
    'https://raw.githubusercontent.com/CheirZ/Repo-img/main/zeus-jpeg/me10.jpg',
    'https://raw.githubusercontent.com/CheirZ/Repo-img/main/zeus-jpeg/me11.jpg',
    'https://raw.githubusercontent.com/CheirZ/Repo-img/main/zeus-jpeg/me12.jpg',
    'https://raw.githubusercontent.com/CheirZ/Repo-img/main/zeus-jpeg/me13.jpg',
    'https://raw.githubusercontent.com/CheirZ/Repo-img/main/zeus-jpeg/me14.jpg',
    'https://raw.githubusercontent.com/CheirZ/Repo-img/main/zeus-jpeg/me15.jpg',
    'https://raw.githubusercontent.com/CheirZ/Repo-img/main/zeus-jpeg/me16.jpg',
    'https://raw.githubusercontent.com/CheirZ/Repo-img/main/zeus-jpeg/me17.jpg',
    'https://raw.githubusercontent.com/CheirZ/Repo-img/main/zeus-jpeg/me18.jpg',
    'https://raw.githubusercontent.com/CheirZ/Repo-img/main/zeus-jpeg/me19.jpg',
    'https://raw.githubusercontent.com/CheirZ/Repo-img/main/zeus-jpeg/me20.jpg'
  ];

  // Función para obtener una imagen aleatoria sin repetir
  const obtenerImagenAleatoria = (utilizadas = []) => {
    const disponibles = imagenes.filter(img => !utilizadas.includes(img));
    return disponibles[Math.floor(Math.random() * disponibles.length)];
  };

  const usadas = [];

  const messages = [
    [
      'hola',
      '',
      obtenerImagenAleatoria(usadas),
      [],
      [],
      [
        [],
        ['🌎 Canal', channel],
        ['🌱 Instagram', 'https://www.instagram.com/edar504__']
      ],
      []
    ],
    [
      'hola2',
      '',
      obtenerImagenAleatoria(usadas),
      [],
      [],
      [
        [],
        ['🗿 Owner', contact],
        ['💻 GitHub', 'https://github.com/edar123']
      ],
      []
    ],
    [
      'hola3',
      '',
      obtenerImagenAleatoria(usadas),
      [],
      [],
      [
        [],
        ['🤝 Donar', contact],
        ['🔆 Socializar', contact]
      ],
      []
    ]
  ];

  // Guardar las usadas para evitar repetición si haces más ítems
  messages.forEach(msg => usadas.push(msg[2]));

  conn.sendCarousel(m.chat, null, null, null, messages);
};

handler.command = ['test1'];
export default handler;

const handler = async (m, { conn }) => {
  let contact = 'https://wa.me/50492280729?text=aqui+está+mi+pack🔥';
  let contact2 = 'https://wa.me/50492280729?text=https://chat.whatsapp.com/LTxRo0FxlZi6OSC8BHjUxc'
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
        ['🔆 Socializar', contact2]
      ],
      []
    ]
  ];
  messages.forEach(msg => usadas.push(msg[2]));
  conn.sendCarousel(m.chat, null, null, null, messages);
};

handler.command = ['test1'];
export default handler;

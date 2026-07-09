/* ░░░ Реестр тем ░░░
   Структура приглашения (блоки) общая для всех шаблонов.
   Тема описывает только ВИД: цвета, шрифты, декор, подписи, анимации.
   Новый шаблон = новый объект здесь + ассеты. Движок не трогаем.

   Каждая тема:
     vars   — CSS-переменные (палитра + шрифты + декор), инжектятся на .v2-root
     labels — подписи секций по умолчанию (переопределяются полями state)
     decor  — пути к PNG декора (опционально; пусто — рисуем декор в CSS)
     anims  — какие анимации включать: 'scratch' | 'stars' | 'glitter'
     envelope — путь к видео-конверту (появится позже; пусто — CSS-заглушка)
*/
(function (global) {
  const THEMES = {
    emerald: {
      id: 'emerald',
      name: 'Изумруд',
      vars: {
        '--green': '#222a16',
        '--green-d': '#1a2011',
        '--cream': '#f7f3e3',
        '--ink': '#2c3318',
        '--muted': '#6f7359',
        '--light': '#f3efe0',
        '--gold': '#b6a06a',
        '--line': '#d8d2bb',
        '--font-heading': "'Jun', Georgia, serif",
        '--font-names': "'Passions', 'Jun', cursive",
        '--font-body': "Georgia, 'Times New Roman', serif",
        '--font-accent': "'Passions', cursive",
        // реальный декор (вытащен из исходного SVG шаблона)
        '--curtain': "url('assets/themes/emerald/curtain.png')",
        '--doily': "url('assets/themes/emerald/doily.png')",
        '--paper': "url('assets/themes/emerald/paper.jpg')",
        '--bouquet': "url('assets/themes/emerald/bouquet.png')",
        '--seal': "url('assets/themes/emerald/seal.png')",
        '--field': "url('assets/themes/emerald/photo-field.png')",
        '--mountains': "url('assets/themes/emerald/photo-mountains.png')",
        '--venue-frame': "url('assets/themes/emerald/venue-frame.png')",
        '--wreath': "url('assets/themes/emerald/wreath.png')",
        '--cartouche': "url('assets/themes/emerald/cartouche.png')",
        '--placeholder': "url('assets/themes/emerald/placeholder.png')",
      },
      labels: {
        the: 'The',
        wed: 'WEDDING',
        countdownLabel: 'До нашей свадьбы осталось:',
        venueTitle: 'МЕСТО ВСТРЕЧИ',
        mapBtn: 'Посмотреть на карте',
        timelineTitle: 'ПРОГРАММА ДНЯ',
        dresscodeTitle: 'ДРЕСС-КОД',
        detailsTitle: 'ДЕТАЛИ',
        giftsTitle: 'ПОДАРКИ',
        photosTitle: 'ФОТОГРАФИИ',
        storyTitle: 'НАША ИСТОРИЯ',
        transportTitle: 'ТРАНСФЕР',
        faqTitle: 'ВОПРОСЫ И ОТВЕТЫ',
      },
      decor: {
        curtain: 'assets/themes/emerald/curtain.png',
        doily: 'assets/themes/emerald/doily.png',
        glitter: 'assets/themes/emerald/glitter.jpg',
        bouquet: 'assets/themes/emerald/bouquet.png',
        seal: 'assets/themes/emerald/seal.png',
        envelope: 'assets/themes/emerald/envelope.png',
        field: 'assets/themes/emerald/photo-field.png',
        mountains: 'assets/themes/emerald/photo-mountains.png',
        venueFrame: 'assets/themes/emerald/venue-frame.png',
        wreath: 'assets/themes/emerald/wreath.png',
        cartouche: 'assets/themes/emerald/cartouche.png',
        placeholder: 'assets/themes/emerald/placeholder.png',
      },
      anims: ['scratch', 'stars', 'glitter'],
      envelope: 'assets/themes/emerald/envelope.png',
    },

    // ░░ Оливковая классика — собрана из готовых элементов дизайна ░░
    olive: {
      id: 'olive',
      name: 'Оливковая классика',
      vars: {
        '--green': '#3a4a23',
        '--green-d': '#2c3a1a',
        '--cream': '#f3efe0',
        '--ink': '#3c402f',
        '--muted': '#6f7359',
        '--light': '#f3efe2',
        '--gold': '#b6a06a',
        '--line': '#d8d2bb',
        '--font-heading': "'Jun', Georgia, serif",
        '--font-names': "'Passions', 'Jun', cursive",
        '--font-body': "Georgia, 'Times New Roman', serif",
        '--font-accent': "'Passions', cursive",
        // полноэкранные фоны-элементы
        '--hero-full': "url('assets/themes/olive/hero.png')",
        '--envelope-scene': "url('assets/themes/olive/envelope-scene.png')",
        '--venue-bg': "url('assets/themes/olive/venue.png')",
        '--program-bg': "url('assets/themes/olive/program-bg.png')",
        '--details-bg': "url('assets/themes/olive/details-bg.png')",
        '--wreath': "url('assets/themes/olive/wreath.png')",
        '--site': "url('assets/themes/olive/site.jpg')",
        '--title-img': "url('assets/themes/olive/title.png')",
        '--fon': "url('assets/themes/olive/fon.png')",
        '--plaque': "url('assets/themes/olive/plaque.png')",
        '--birka': "url('assets/themes/olive/birka.png')",
        '--fon-niz': "url('assets/themes/olive/fon-niz.jpg')",
        '--podlozhka': "url('assets/themes/olive/podlozhka.jpg')",
        '--ph-img': "url('assets/themes/olive/ph.png')",
      },
      labels: {
        the: '', wed: 'THE WEDDING DAY',
        countdownLabel: 'До нашей свадьбы осталось:',
        venueTitle: 'МЕСТО ВСТРЕЧИ', mapBtn: 'Посмотреть на карте',
        timelineTitle: 'ПРОГРАММА ДНЯ', dresscodeTitle: 'ДРЕСС-КОД', detailsTitle: 'ДЕТАЛИ',
        giftsTitle: 'ПОДАРКИ', photosTitle: 'ФОТОГРАФИИ', storyTitle: 'НАША ИСТОРИЯ',
        transportTitle: 'ТРАНСФЕР', faqTitle: 'ВОПРОСЫ И ОТВЕТЫ',
      },
      decor: {
        glitter: 'assets/themes/emerald/glitter.jpg', // слой блёсток для скретча
        wreath: 'assets/themes/olive/wreath.png',
      },
      anims: ['scratch', 'stars', 'glitter'],
      envelope: 'assets/themes/olive/envelope-scene.png',
      // стартовый экран-обложка: фон FDFAEB + конверт + «ВАМ ПРИШЛО ПРИГЛАШЕНИЕ», по тапу открывается
      intro: { cover: 'assets/themes/olive/open-intro.jpg', bg: '#FDFAEB', glitter: true },
      // цельная подложка сайта (2824×21594) + оверлеи поверх по координатам
      fixedLayout: true,
      siteW: 512, siteH: 3915,
    },

    // ░░ Бордовая симфония — анимированная (цельная подложка + оверлеи) ░░
    burgundy: {
      id: 'burgundy',
      name: 'Бордовая симфония',
      vars: {
        '--green': '#5c1620',
        '--green-d': '#3e0e16',
        '--cream': '#f2ead9',
        '--ink': '#5c1620',
        '--muted': '#8a5560',
        '--light': '#f2ead9',
        '--gold': '#b6a06a',
        '--line': '#d8d2bb',
        '--font-heading': "'Jun', Georgia, serif",
        '--font-names': "'Passions', 'Jun', cursive",
        '--font-body': "Georgia, 'Times New Roman', serif",
        '--font-accent': "'Passions', cursive",
        '--site': "url('assets/themes/burgundy/site.jpg')",
        '--title-img': "url('assets/themes/burgundy/title.png')",
        '--wreath': "url('assets/themes/burgundy/wreath.png')",
        '--cartouche': "url('assets/themes/burgundy/cartouche.png')",
        '--fon': "url('assets/themes/burgundy/fon.jpg')", // фон доп. блоков
        '--fon-niz': "url('assets/themes/burgundy/fon-niz.jpg')", // красный картон «love» под биркой
        '--ph-img': "url('assets/themes/olive/ph.png')",
      },
      labels: {
        the: '', wed: 'THE WEDDING DAY',
        countdownLabel: 'До нашей свадьбы осталось:',
        venueTitle: 'МЕСТО ВСТРЕЧИ', mapBtn: 'Посмотреть на карте',
        timelineTitle: 'ПРОГРАММА ДНЯ', dresscodeTitle: 'ДРЕСС-КОД', detailsTitle: 'ДЕТАЛИ',
        giftsTitle: 'ПОЖЕЛАНИЯ', photosTitle: 'ФОТОГРАФИИ', storyTitle: 'НАША ИСТОРИЯ',
        transportTitle: 'ТРАНСФЕР', contactsTitle: 'КОНТАКТЫ', faqTitle: 'ВОПРОСЫ И ОТВЕТЫ',
      },
      decor: {
        glitter: 'assets/themes/burgundy/scratch.png', // овал-блёстки для скретча
        wreath: 'assets/themes/burgundy/wreath.png',
      },
      anims: ['scratch', 'stars', 'glitter'],
      envelope: '', // без видео-конверта и без интро — открывается сразу на скретч-герое
      fixedLayout: true,
      siteW: 512, siteH: 3915,
      // дефолты состояния под тему: палитра дресс-кода из цветов приглашения
      // (глубокое вино → бордо → насыщенный красный (каллы) → пыльная роза → крем)
      // + цвета/размеры шапки, чтобы конструктор (пипетки/ползунки) совпадал с рендером
      stateDefaults: {
        dressColors: ['#3e0e16', '#6b1622', '#a3181f', '#d0959c', '#f2ead9'],
        titleColor: '#ECECEC', nameColor: '#ECECEC', dateColor: '#ECECEC',
        nameSize: 11, dateSize: 4,
      },
    },
  };

  // применяет тему к корню: ставит data-theme и инжектит CSS-переменные один раз
  function apply(root, themeId) {
    const theme = THEMES[themeId] || THEMES.emerald;
    const host = root.querySelector('[data-v2root]') || root;
    host.setAttribute('data-theme', theme.id);
    const sel = `.v2-root[data-theme="${theme.id}"]`;
    const decl = Object.entries(theme.vars).map(([k, v]) => `${k}:${v};`).join('');
    const id = 'theme-vars-' + theme.id;
    let st = document.getElementById(id);
    if (!st) { st = document.createElement('style'); st.id = id; document.head.appendChild(st); }
    st.textContent = `${sel}{${decl}}`;
    return theme;
  }

  global.THEMES = THEMES;
  global.ThemeKit = { apply, get: (id) => THEMES[id] || THEMES.emerald };
})(window);

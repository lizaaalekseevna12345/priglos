/* ░░░ Движок шаблона v2 — модульный (секции-блоки), тема-независимый ░░░
   Набор и порядок секций — в state.blocks. Вид (цвета/шрифты/декор/подписи) — из темы (themes.js).
*/
(function (global) {
  // доступные опциональные блоки (hero и invitation — всегда есть)
  const BLOCKS = [
    { id:'countdown', name:'Обратный отсчёт', icon:'timer' },
    { id:'venue',     name:'Место проведения', icon:'pin' },
    { id:'timeline',  name:'Программа вечера', icon:'clock' },
    { id:'dresscode', name:'Дресс-код', icon:'dress' },
    { id:'details',   name:'Детали', icon:'spark' },
    { id:'gifts',     name:'Пожелания', icon:'gift' },
    { id:'story',     name:'Наша история', icon:'heart' },
    { id:'transport', name:'Трансфер', icon:'bus' },
    { id:'contacts',  name:'Контакты', icon:'phone' },
  ];

  const DEFAULT_LABELS = {
    the:'The', wed:'WEDDING',
    countdownLabel:'До нашей свадьбы осталось:',
    venueTitle:'МЕСТО ВСТРЕЧИ', mapBtn:'Посмотреть на карте',
    timelineTitle:'ПРОГРАММА ДНЯ', dresscodeTitle:'ДРЕСС-КОД', detailsTitle:'ДЕТАЛИ',
    giftsTitle:'ПОЖЕЛАНИЯ', photosTitle:'ФОТОГРАФИИ', storyTitle:'НАША ИСТОРИЯ',
    transportTitle:'ТРАНСФЕР', contactsTitle:'КОНТАКТЫ', faqTitle:'ВОПРОСЫ И ОТВЕТЫ',
  };

  const defaultState = {
    blocks: ['countdown','venue','timeline','dresscode','details'],
    name1: 'Диана', name2: 'Игорь',
    date: '2026-09-12T16:00',
    inviteTitle: 'ДОРОГИЕ ДРУЗЬЯ И БЛИЗКИЕ!',
    inviteText: 'Мы будем счастливы разделить с вами один из самых важных дней нашей жизни. Приглашаем вас на нашу свадьбу!',
    venueName: 'Ресторан «Лесной»',
    venueAddress: 'г. Москва, ул. Лесовая, д. 7, к. 1',
    mapsUrl: '',
    program: [
      { time:'16:00', label:'Сбор гостей' },
      { time:'17:00', label:'Церемония' },
      { time:'18:00', label:'Фотосессия' },
      { time:'20:30', label:'Первый танец' },
      { time:'23:00', label:'Завершение вечера' },
    ],
    dressText: 'Мы очень просим вас поддержать цветовую гамму нашего праздника!',
    dressColors: ['#3c4a1e','#6b7a3a','#8d9a55','#c4cda0','#e7e3cf'],
    detailsText: 'Если хотите порадовать нас\nбукетом, выберите цветы в горшке! А лучшим подарком будет вклад в наш семейный бюджет.',
    giftsText: 'Самый ценный подарок для нас — ваше присутствие. Если захотите, будем рады вкладу в наш семейный бюджет.',
    storyText: 'Мы познакомились однажды весной и с тех пор не расставались. Спустя годы решили сказать друг другу «да».',
    transportText: 'В 15:30 от станции метро будет подан трансфер до площадки. После праздника гостей развезут по домам.',
    contactsText: 'Если у вас появятся вопросы — будем рады помочь!\nДиана: +7 900 000-00-00\nИгорь: +7 900 000-00-01',
    faq: [
      { q:'Можно ли прийти с детьми?', a:'Конечно! Мы будем рады видеть всю вашу семью.' },
      { q:'Будет ли парковка?', a:'Да, рядом с рестораном есть бесплатная парковка.' },
    ],
    closing: 'МЫ ОЧЕНЬ ЖДЁМ КАЖДОГО ИЗ ВАС!\nС ЛЮБОВЬЮ, ВАШИ ДИАНА И ИГОРЬ',
    photos: { hero:'', invite1:'', invite2:'', venue:'', details:'', gifts:'', story:'', transport:'', contacts:'', photos1:'', photos2:'', photos3:'' },
    music: '',
    theme: 'emerald',
    titleColor: '', // цвет «THE WEDDING DAY» (пусто — из темы)
    nameColor: '',  // цвет имён жениха и невесты
    dateColor: '',  // цвет даты в шапке
    nameSize: '',   // размер шрифта имён (px)
    dateSize: '',   // размер шрифта даты (px)
    inviteTitleSize: '', // размер заголовка в конверте (cqw)
    inviteTextSize: '',  // размер текста в конверте (cqw)
    closingSize: '',     // размер финальной фразы (cqw)
  };

  function esc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function bg(url){ return url ? `style="background-image:url('${url}');background-size:cover;background-position:center;background-repeat:no-repeat;"` : ''; }

  // ── секции ── (s = state, L = подписи темы, opts)
  const S = {};

  // hero: бархат-занавес → кружевная салфетка (card) → фото+текст под блёстками → скретч
  S.hero = (s, L, opts) => `
    <section class="v2-hero">
      <div class="v2-stars" data-stars></div>
      <div class="v2-hero__card">
        <div class="v2-hero__paper" data-photo="hero" ${bg(s.photos.hero)}></div>
        <div class="v2-hero__frame">
          ${L.the ? `<span class="v2-hero__small" data-reveal style="transition-delay:.05s">${esc(L.the)}</span>` : ''}
          <h1 class="v2-hero__wed" data-reveal style="transition-delay:.15s${s.titleColor ? ';color:' + esc(s.titleColor) : ''}">${esc(L.wed)}</h1>
          <span class="v2-hero__gem" data-reveal style="transition-delay:.25s" aria-hidden="true">&#9670;</span>
          <div class="v2-hero__names" data-bind="names" data-reveal style="transition-delay:.35s${s.nameColor ? ';color:' + esc(s.nameColor) : ''}">${esc(s.name1)} <span>&amp;</span> ${esc(s.name2)}</div>
          <div class="v2-hero__date" data-bind="heroDate" data-reveal style="transition-delay:.5s">${heroDate(s.date)}</div>
        </div>
        ${opts && opts.scratch ? '<canvas class="v2-hero__scratch" data-scratch></canvas>' : ''}
      </div>
    </section>`;

  // приглашение: букеты по краям, зелёный холм с сургучной печатью, текст, два полароида
  S.invitation = (s) => `
    <section class="v2-sec v2-sec--paper v2-invite">
      <h2 class="v2-h2" data-bind="inviteTitle" data-reveal>${esc(s.inviteTitle)}</h2>
      <div class="v2-invite__scene" data-reveal style="transition-delay:.1s">
        <span class="v2-invite__bouquet v2-invite__bouquet--l" aria-hidden="true"></span>
        <span class="v2-invite__bouquet v2-invite__bouquet--r" aria-hidden="true"></span>
        <div class="v2-invite__hill">
          <span class="v2-invite__seal" aria-hidden="true"></span>
          <p class="v2-body v2-body--light" data-bind="inviteText">${esc(s.inviteText)}</p>
        </div>
      </div>
      <div class="v2-invite__photos">
        <div class="v2-pcard" data-photo="invite1" data-reveal ${bg(s.photos.invite1)}></div>
        <div class="v2-pcard v2-pcard--alt" data-photo="invite2" data-reveal style="transition-delay:.1s" ${bg(s.photos.invite2)}></div>
      </div>
    </section>`;

  S.countdown = (s, L) => `
    <section class="v2-sec v2-sec--paper v2-cd">
      <p class="v2-cd__label" data-reveal>${esc(L.countdownLabel)}</p>
      <div class="v2-cd__row" data-cd data-reveal style="transition-delay:.1s">
        ${cdCell('—','дней')}${cdCell('—','часов')}${cdCell('—','минут')}${cdCell('—','секунд')}
      </div>
    </section>`;

  S.venue = (s, L) => `
    <section class="v2-sec v2-sec--venue v2-venue">
      <h2 class="v2-h2 v2-h2--light" data-reveal>${esc(L.venueTitle)}</h2>
      <div class="v2-venue__frame" data-reveal style="transition-delay:.1s">
        <div class="v2-venue__photo" data-photo="venue" ${bg(s.photos.venue)}></div>
      </div>
      <p class="v2-venue__name" data-bind="venueName" data-reveal>${esc(s.venueName)}</p>
      <p class="v2-venue__addr" data-bind="venueAddress" data-reveal>${esc(s.venueAddress)}</p>
      <a class="v2-btn v2-btn--light" data-mapbtn data-reveal target="_blank" rel="noopener">${esc(L.mapBtn)}</a>
    </section>`;

  S.timeline = (s, L) => `
    <section class="v2-sec v2-sec--green v2-tl">
      <h2 class="v2-h2 v2-h2--light" data-reveal>${esc(L.timelineTitle)}</h2>
      <div class="v2-tl__list" data-timeline></div>
    </section>`;

  S.dresscode = (s, L) => `
    <section class="v2-sec v2-sec--paper v2-dc">
      <h2 class="v2-h2" data-reveal>${esc(L.dresscodeTitle)}</h2>
      <p class="v2-body" data-bind="dressText" data-reveal>${esc(s.dressText)}</p>
      <div class="v2-dc__sw" data-dress></div>
    </section>`;

  S.details = (s, L) => `
    <section class="v2-sec v2-sec--green v2-details">
      <div class="v2-pcard v2-pcard--tilt" data-photo="details" data-reveal ${bg(s.photos.details)}></div>
      <div class="v2-details__txt" data-reveal style="transition-delay:.1s">
        <h2 class="v2-h2 v2-h2--light v2-h2--left">${esc(L.detailsTitle)}</h2>
        <p class="v2-body v2-body--light" data-bind="detailsText">${esc(s.detailsText)}</p>
      </div>
    </section>`;

  S.gifts = (s, L) => `
    <section class="v2-sec v2-sec--paper v2-gifts">
      <h2 class="v2-h2" data-reveal>${esc(L.giftsTitle)}</h2>
      <p class="v2-body" data-bind="giftsText" data-reveal>${esc(s.giftsText)}</p>
    </section>`;

  S.photos = (s, L) => `
    <section class="v2-sec v2-sec--paper v2-gallery">
      <h2 class="v2-h2" data-reveal>${esc(L.photosTitle)}</h2>
      <div class="v2-gallery__grid">
        <div class="v2-pcard" data-photo="photos1" data-reveal ${bg(s.photos.photos1)}></div>
        <div class="v2-pcard" data-photo="photos2" data-reveal style="transition-delay:.08s" ${bg(s.photos.photos2)}></div>
        <div class="v2-pcard" data-photo="photos3" data-reveal style="transition-delay:.16s" ${bg(s.photos.photos3)}></div>
      </div>
    </section>`;

  S.story = (s, L) => `
    <section class="v2-sec v2-sec--green v2-story">
      <h2 class="v2-h2 v2-h2--light" data-reveal>${esc(L.storyTitle)}</h2>
      <p class="v2-body v2-body--light" data-bind="storyText" data-reveal>${esc(s.storyText)}</p>
    </section>`;

  S.transport = (s, L) => `
    <section class="v2-sec v2-sec--paper v2-transport">
      <h2 class="v2-h2" data-reveal>${esc(L.transportTitle)}</h2>
      <p class="v2-body" data-bind="transportText" data-reveal>${esc(s.transportText)}</p>
    </section>`;

  S.faq = (s, L) => `
    <section class="v2-sec v2-sec--green v2-faq">
      <h2 class="v2-h2 v2-h2--light" data-reveal>${esc(L.faqTitle)}</h2>
      <div class="v2-faq__list" data-faq></div>
    </section>`;

  S.contacts = (s, L) => `
    <section class="v2-sec v2-sec--paper v2-contacts">
      <h2 class="v2-h2" data-reveal>${esc(L.contactsTitle)}</h2>
      <p class="v2-body" data-bind="contactsText" data-reveal>${esc(s.contactsText)}</p>
    </section>`;

  S.closing = (s) => `
    <section class="v2-sec v2-sec--green v2-closing">
      <div class="v2-closing__plaque" data-reveal>
        <p class="v2-closing__txt" data-bind="closing">${esc(s.closing)}</p>
      </div>
    </section>`;

  // ── «Оливковая классика»: цельная подложка + оверлеи поверх по координатам ──
  S.oliveSite = (s, L, opts, cropped) => {
    // размер шрифта — в cqw (доля ширины подложки), чтобы масштабироваться на любой ширине
    const st = (col, sz) => (col ? 'color:' + esc(col) + ';' : '') + (sz ? 'font-size:' + (parseFloat(sz) || 0) + 'cqw;' : '');
    const cd = `${cdCell('—','дней')}${cdCell('—','часов')}${cdCell('—','минут')}${cdCell('—','секунд')}`;
    return `
    <div class="olv">
      <div class="v2-stars" data-stars></div>
      <div class="olv-photo olv-ph-hero" data-photo="hero" ${bg(s.photos.hero)}></div>
      <div class="olv-htext">
        <div class="olv-title" data-reveal aria-label="The Wedding day" style="${s.titleColor ? 'background-color:' + esc(s.titleColor) + ';' : ''}"></div>
        <div class="olv-names" data-bind="names" data-reveal style="${st(s.nameColor,s.nameSize)}">${esc(s.name1)} <span>&amp;</span> ${esc(s.name2)}</div>
        <div class="olv-date" data-bind="heroDate" data-reveal style="${st(s.dateColor,s.dateSize)}">${heroDate(s.date)}</div>
      </div>
      ${opts && opts.scratch ? '<canvas class="olv-scratch" data-scratch></canvas><div class="olv-hint">СОТРИ МЕНЯ</div>' : ''}
      <h2 class="olv-invtitle" data-bind="inviteTitle" data-reveal style="${st(null,s.inviteTitleSize)}">${esc(s.inviteTitle)}</h2>
      <p class="olv-invite" data-bind="inviteText" style="${st(null,s.inviteTextSize)}">${esc(s.inviteText)}</p>
      <div class="olv-pola olv-ph-1"><div class="olv-pimg" data-photo="invite1" ${bg(s.photos.invite1)}></div></div>
      <div class="olv-pola olv-ph-2"><div class="olv-pimg" data-photo="invite2" ${bg(s.photos.invite2)}></div></div>
      <div class="olv-cd" data-cd>${cd}</div>
      <div class="olv-photo olv-ph-venue" data-photo="venue" ${bg(s.photos.venue)}></div>
      <div class="olv-vname" data-bind="venueName" data-reveal>${esc(s.venueName)}</div>
      <div class="olv-vaddr" data-bind="venueAddress" data-reveal>${esc(s.venueAddress)}</div>
      <a class="olv-map" data-mapbtn target="_blank" rel="noopener">${esc(L.mapBtn)}</a>
      <div class="olv-prog" data-timeline></div>
      <p class="olv-dresstext" data-bind="dressText" data-reveal>${esc(s.dressText)}</p>
      <div class="olv-dress" data-dress></div>
      <p class="olv-details" data-bind="detailsText" data-reveal>${esc(s.detailsText)}</p>
      ${cropped ? '' : `<div class="olv-pola olv-ph-details" data-reveal><div class="olv-pimg" data-photo="details" ${bg(s.photos.details)}></div></div>
      <p class="olv-closing" data-bind="closing" data-reveal style="${st(null,s.closingSize)}">${esc(s.closing)}</p>`}
    </div>`;
  };
  // полароид «Деталей» — отдельным слоем поверх стыка (только когда выбран доп. блок)
  S.oliveDetailPola = (s) => `<div class="olv-pola olv-bridge" data-reveal><div class="olv-pimg" data-photo="details" ${bg(s.photos.details)}></div></div>`;

  // ── Доп. блоки оливковой темы на зелёном фоне (после «Деталей») ──
  // универсальный экран: заголовок (Jun капсом) + качающийся полароид + центр-текст
  S.oliveExtra = (title, text, photoKey, photo, opts) => `
    <section class="olg" data-reveal>
      <h2 class="olg-title">${esc(title)}</h2>
      <div class="olg-pola"><div class="olv-pimg" data-photo="${photoKey}" ${bg(photo)}></div></div>
      <p class="olg-text">${esc(text)}</p>
    </section>`;
  // финальная бирка на отдельном нижнем фоне (по центру стыка зелёного блока и фона-низа)
  S.oliveBirka = (s) => {
    const sz = s.closingSize ? `font-size:${parseFloat(s.closingSize) || 0}cqw;` : '';
    return `
    <section class="olg-bottom" data-reveal>
      <div class="olg-birka"><p class="olg-sign" data-bind="closing" style="${sz}">${esc(s.closing)}</p></div>
    </section>`;
  };

  // собирает доп. блок (после деталей) + финальную бирку на нижнем фоне
  S.oliveExtras = (s, L, opts) => {
    const b = s.blocks || [];
    let h = '';
    if (b.includes('gifts'))     h += S.oliveExtra('Пожелания', s.giftsText, 'gifts', s.photos.gifts, opts);
    if (b.includes('story'))     h += S.oliveExtra('Наша история', s.storyText, 'story', s.photos.story, opts);
    if (b.includes('transport')) h += S.oliveExtra('Трансфер', s.transportText, 'transport', s.photos.transport, opts);
    if (b.includes('contacts'))  h += S.oliveExtra('Контакты', s.contactsText, 'contacts', s.photos.contacts, opts);
    h += S.oliveBirka(s);
    return h;
  };

  function cdCell(v, l){ return `<div class="v2-cd__cell"><b>${v}</b><span>${l}</span></div>`; }
  function heroDate(date){ const d=new Date(date); if(isNaN(d)) return ''; return pad(d.getDate())+'.'+pad(d.getMonth()+1)+'.'+d.getFullYear(); }
  function pad(n){ return String(n).padStart(2,'0'); }

  function markup(){ return `<div class="v2-root" data-v2root></div>`; }

  function diff(dateStr){
    const d=new Date(dateStr); let ms=d.getTime()-Date.now(); if(isNaN(ms)||ms<0) ms=0;
    const s=Math.floor(ms/1000);
    return { days:Math.floor(s/86400), hours:Math.floor((s%86400)/3600), minutes:Math.floor((s%3600)/60), seconds:s%60 };
  }

  function render(state, root, opts){
    opts = opts || {};
    const container = root.querySelector('[data-v2root]') || root;

    // тема резолвится раньше состояния — её stateDefaults задают палитру/дефолты под шаблон
    const themeId = opts.themeId || (state && state.theme) || defaultState.theme;
    let theme = null;
    if (global.ThemeKit) theme = global.ThemeKit.apply(root, themeId);
    const sd = (theme && theme.stateDefaults) || {};
    const s = Object.assign({}, defaultState, sd, state||{});
    s.photos = Object.assign({}, defaultState.photos, sd.photos||{}, (state&&state.photos)||{});
    const L = Object.assign({}, DEFAULT_LABELS, (theme && theme.labels) || {});

    const fixed = !!(theme && theme.fixedLayout);
    if (fixed) {
      const EXTRA_IDS = ['gifts','story','transport','contacts'];
      const hasExtra = (s.blocks || []).some((id) => EXTRA_IDS.includes(id));
      if (hasExtra) {
        // выбран доп. блок: обрезаем низ подложки, добавляем зелёный блок + бирку на нижнем фоне,
        // полароид деталей — отдельным слоем поверх стыка
        container.innerHTML = '<div class="olv-stack">'
          + '<div class="olv-wrap">' + S.oliveSite(s, L, opts, true) + '</div>'
          + S.oliveExtras(s, L, opts)
          + S.oliveDetailPola(s)
          + '</div>';
      } else {
        // доп. блоков нет — оригинальный дизайн (впечатанная этикетка, полароид деталей внутри)
        container.innerHTML = S.oliveSite(s, L, opts, false);
      }
      container.classList.add('v2-fixed');
    } else {
      let html = S.hero(s, L, opts) + S.invitation(s, L);
      (s.blocks||[]).forEach((id)=>{ if(S[id]) html += S[id](s, L, opts); });
      html += S.closing(s, L);
      container.innerHTML = html;
      container.classList.remove('v2-fixed');
    }

    // карта: в подложке надпись/рамка впечатаны — текст показываем всегда; ссылка — если задана
    const mb = container.querySelector('[data-mapbtn]');
    if (mb) {
      if (s.mapsUrl) mb.href = s.mapsUrl; else mb.removeAttribute('href');
      mb.style.display = (fixed || s.mapsUrl) ? '' : 'none';
    }

    // программа (каждый пункт проявляется при прокрутке — стаггер через transition-delay)
    const tl = container.querySelector('[data-timeline]');
    if (tl) tl.innerHTML = (s.program||[]).slice(0,10).map((it,i)=> fixed
      ? `<div class="olv-prow" data-reveal style="transition-delay:${(i*0.16).toFixed(2)}s"><span class="olv-ptime">${esc(it.time)}</span><span class="olv-pdot"></span><span class="olv-plabel">${esc(it.label)}</span></div>`
      : `<div class="v2-tl__item" data-reveal style="transition-delay:${(i*0.16).toFixed(2)}s"><span class="v2-tl__time">${esc(it.time)}</span><span class="v2-tl__dot"></span><span class="v2-tl__label">${esc(it.label)}</span></div>`).join('');

    // дресс-код — образцы (в венках для модульной темы, простыми кружками для подложки)
    const dr = container.querySelector('[data-dress]');
    if (dr) dr.innerHTML = (s.dressColors||[]).slice(0,10).map((c,i)=> fixed
      ? `<span class="olv-wreath" data-reveal style="transition-delay:${(i*0.05).toFixed(2)}s"><span class="olv-wreath__dot" style="background:${esc(c)}"></span></span>`
      : `<span class="v2-wreath" data-reveal style="transition-delay:${(i*0.06).toFixed(2)}s"><span class="v2-wreath__dot" style="background:${esc(c)}"></span></span>`).join('');

    // faq
    const fq = container.querySelector('[data-faq]');
    if (fq) fq.innerHTML = (s.faq||[]).map((it)=>`<div class="v2-faq__item"><p class="v2-faq__q">${esc(it.q)}</p><p class="v2-faq__a">${esc(it.a)}</p></div>`).join('');

    updateCountdown(s, container);

    // анимации — только если тема их просит
    const A = global.Animations;
    const wants = (name) => !theme || (theme.anims && theme.anims.indexOf(name) !== -1);
    const starsEl = container.querySelector('[data-stars]');
    if (starsEl && wants('stars') && A && A.fallingStars) A.fallingStars(starsEl);

    // проявление контента: по скроллу проявляется ТОЛЬКО программа дня (стаггер),
    // всё остальное подгружено сразу; в конструкторе — тоже всё сразу
    if (opts.animate && A && A.scrollReveal) {
      // всё, что не относится к программе дня, показываем немедленно
      container.querySelectorAll('[data-reveal]').forEach((e) => {
        if (!e.closest('[data-timeline]')) e.classList.add('is-in');
      });
      A.scrollReveal(container); // проявит по скроллу оставшееся — пункты программы дня
    } else {
      container.querySelectorAll('[data-reveal]').forEach((e) => e.classList.add('is-in'));
    }
    return container;
  }

  function updateCountdown(s, container){
    const row = container.querySelector('[data-cd]');
    if (!row) return;
    const t = diff(s.date);
    const cells = row.querySelectorAll('.v2-cd__cell b');
    if (cells.length === 4) { cells[0].textContent=t.days; cells[1].textContent=pad(t.hours); cells[2].textContent=pad(t.minutes); cells[3].textContent=pad(t.seconds); }
  }

  function fit(){ /* нативный поток, масштабирование не нужно */ }

  function startCountdown(root, getState){
    const container = root.querySelector('[data-v2root]') || root;
    function tick(){ updateCountdown(Object.assign({}, defaultState, getState()), container); }
    tick();
    return setInterval(tick, 1000);
  }

  global.TPLV2 = { defaultState, BLOCKS, DEFAULT_LABELS, markup, render, fit, startCountdown };
})(window);

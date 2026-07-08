// ░░░ Веер шаблонов на телефоне: раскрывается при скролле вниз (а не по тапу) ░░░
(function () {
  const fan = document.querySelector('.hero__fan');
  if (!fan) return;
  let ticking = false;
  function update() {
    ticking = false;
    if (window.scrollY > 24) fan.classList.add('is-spread');
    else fan.classList.remove('is-spread');
  }
  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
  update();
})();

// ░░░ Клик по карточке шаблона → предпросмотр (с темой, если задана) ░░░
document.querySelectorAll('.card').forEach((card) => {
  card.style.cursor = 'pointer';
  card.addEventListener('click', () => {
    const theme = card.dataset.theme;
    window.location.href = theme ? ('preview.html?theme=' + encodeURIComponent(theme)) : 'preview.html';
  });
});

// ░░░ Все кнопки «Выбрать шаблон» → плавный скролл к секции #templates ░░░
document.querySelectorAll('.js-choose').forEach((btn) => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.getElementById('templates');
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    closeMenu();
  });
});

// ░░░ Мобильное меню ░░░
const burger = document.getElementById('burger');
const nav = document.getElementById('nav');
function closeMenu() {
  nav.classList.remove('is-open');
  burger.classList.remove('is-open');
  burger.setAttribute('aria-expanded', 'false');
}
burger.addEventListener('click', () => {
  const open = nav.classList.toggle('is-open');
  burger.classList.toggle('is-open', open);
  burger.setAttribute('aria-expanded', String(open));
});
// закрываем меню при клике по обычной ссылке навигации
nav.querySelectorAll('.nav__link').forEach((link) =>
  link.addEventListener('click', closeMenu)
);

// ░░░ Фильтры: что празднуем + категория → показываем подходящие шаблоны ░░░
const cardsWrap = document.querySelector('.cards');
const filterCards = cardsWrap ? [...cardsWrap.querySelectorAll('.card')] : [];
function activePill(group, attr) {
  const a = group && group.querySelector('.pill.is-active');
  return a ? a.dataset[attr] : null;
}
function applyFilters() {
  const ev = activePill(document.querySelector('.filters[data-group="event"]'), 'event');
  const cat = activePill(document.querySelector('.filters[data-group="category"]'), 'cat');
  let shown = 0;
  filterCards.forEach((card) => {
    const okEv = !ev || !card.dataset.event || card.dataset.event === ev;
    const okCat = !cat || cat === 'all' || card.dataset.cat === cat;
    const ok = okEv && okCat;
    card.classList.toggle('is-hidden', !ok);
    if (ok) shown++;
  });
  const empty = document.getElementById('cardsEmpty');
  if (empty) empty.hidden = shown > 0;
}
document.querySelectorAll('.filters').forEach((group) => {
  group.addEventListener('click', (e) => {
    const pill = e.target.closest('.pill');
    if (!pill) return;
    group.querySelectorAll('.pill').forEach((p) => p.classList.remove('is-active'));
    pill.classList.add('is-active');
    applyFilters();
  });
});
// показываем все карточки сразу (фильтр — основной механизм), кнопка «Показать еще» не нужна
if (cardsWrap) cardsWrap.classList.add('is-expanded');
applyFilters();

// ░░░ Карусель отзывов ░░░
const track = document.getElementById('track');
const prev = document.getElementById('prev');
const next = document.getElementById('next');

function cardStep() {
  const card = track.querySelector('.review');
  if (!card) return 320;
  const gap = parseInt(getComputedStyle(track).columnGap || '22', 10);
  return card.offsetWidth + gap;
}
next.addEventListener('click', () => track.scrollBy({ left: cardStep(), behavior: 'smooth' }));
prev.addEventListener('click', () => track.scrollBy({ left: -cardStep(), behavior: 'smooth' }));

// перетаскивание мышью
let isDown = false, startX = 0, startScroll = 0;
track.addEventListener('mousedown', (e) => {
  isDown = true; startX = e.pageX; startScroll = track.scrollLeft;
  track.style.cursor = 'grabbing';
});
window.addEventListener('mouseup', () => { isDown = false; track.style.cursor = ''; });
track.addEventListener('mousemove', (e) => {
  if (!isDown) return;
  e.preventDefault();
  track.scrollLeft = startScroll - (e.pageX - startX);
});

// ░░░ FAQ с эффектом «печати» ответа ░░░
const answers = [
  'Выберите понравившийся шаблон, добавьте свои фотографии и информацию о событии, затем опубликуйте приглашение. После этого вы получите ссылку, которую можно отправить гостям любым удобным способом.',
  'Сейчас доступны только свадебные приглашения. Шаблоны для других событий — дней рождения, выпускных, годовщин и не только — уже в разработке и скоро появятся.',
  'Это не проблема. Все шаблоны уже разработаны профессиональными дизайнерами. Вам нужно только выбрать понравившийся вариант и заполнить его своими данными.',
  'Конечно. Пока вы собираете приглашение, можно менять текст, фотографии, дату, адрес и любые детали в пару кликов. Когда всё готово, вы публикуете приглашение и получаете ссылку — поэтому советуем проверить все данные перед тем, как отправить её гостям.',
  'Гости открывают вашу ссылку и подтверждают присутствие прямо на странице приглашения. Все ответы собираются автоматически, поэтому вам не придётся вести учёт вручную в сообщениях и чатах.',
];

const faqList = document.getElementById('faqList');
let typingTimer = null;

function typeAnswer(el, text) {
  clearTimeout(typingTimer);
  el.classList.remove('done');
  el.textContent = '';
  let i = 0;
  const speed = 12; // мс на символ
  (function step() {
    if (i <= text.length) {
      el.textContent = text.slice(0, i);
      i++;
      typingTimer = setTimeout(step, speed);
    } else {
      el.classList.add('done');
    }
  })();
}

function openItem(item) {
  // закрываем остальные
  faqList.querySelectorAll('.faq__item').forEach((it) => {
    if (it !== item) it.classList.remove('is-open');
  });
  item.classList.add('is-open');
  const idx = +item.querySelector('.faq__q').dataset.answer;
  typeAnswer(item.querySelector('.faq__text'), answers[idx]);
}

faqList.addEventListener('click', (e) => {
  const q = e.target.closest('.faq__q');
  if (!q) return;
  const item = q.closest('.faq__item');
  if (item.classList.contains('is-open')) {
    // повторный клик — сворачиваем
    item.classList.remove('is-open');
    clearTimeout(typingTimer);
  } else {
    openItem(item);
  }
});

// первый вопрос раскрыт и напечатан сразу
openItem(faqList.querySelector('.faq__item'));

// ░░░ «Показать еще» больше не нужна — все карточки показываются, фильтр сам сужает ░░░
const showMore = document.getElementById('showMore');
if (showMore) showMore.style.display = 'none';

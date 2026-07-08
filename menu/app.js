// ---------- Telegram WebApp ----------
const tg = window.Telegram && window.Telegram.WebApp ? window.Telegram.WebApp : null;
if (tg) {
  try {
    tg.ready();
    tg.expand();
    tg.setHeaderColor && tg.setHeaderColor("#4A3F35");
    tg.setBackgroundColor && tg.setBackgroundColor("#FBEEDD");
  } catch (e) {}
}
function haptic(kind) {
  try { tg && tg.HapticFeedback && tg.HapticFeedback.impactOccurred(kind || "light"); } catch (e) {}
}

const root = document.documentElement;
const $ = (s) => document.querySelector(s);

// ---------- ПЛАВАЮЩАЯ ПЛАШКА ----------
function buildRibbon() {
  const track = $("#ribbonTrack");
  // соберём разнообразный набор круглых фото из всех категорий
  const pics = [];
  CATEGORIES.forEach((c) => {
    c.items.forEach((it, i) => { if (i % 3 === 0) pics.push(it.img); });
  });
  // дублируем для бесшовной прокрутки
  const seq = pics.concat(pics);
  track.innerHTML = seq
    .map((src) => `<img class="ribbon__item" src="${src}" alt="" loading="lazy" />`)
    .join("");
}

// ---------- КАТЕГОРИИ ----------
let current = 0;

function applyAccent(cat) {
  root.style.setProperty("--accent", cat.accent);
  root.style.setProperty("--accent-soft", cat.accentSoft);
  if (tg) { try { tg.setHeaderColor && tg.setHeaderColor("#4A3F35"); } catch (e) {} }
}

function buildCats() {
  const nav = $("#cats");
  nav.innerHTML = CATEGORIES.map(
    (c, i) => `<button class="cat" data-i="${i}">${c.title}</button>`
  ).join("");
  nav.addEventListener("click", (e) => {
    const btn = e.target.closest(".cat");
    if (!btn) return;
    const i = +btn.dataset.i;
    if (i !== current) { selectCat(i); haptic("light"); }
  });
}

function selectCat(i) {
  current = i;
  const cat = CATEGORIES[i];
  applyAccent(cat);
  document.querySelectorAll(".cat").forEach((b) =>
    b.classList.toggle("is-active", +b.dataset.i === i)
  );
  renderNote(cat);
  renderGrid(cat);
}

function renderNote(cat) {
  const el = $("#note");
  if (!cat.note) { el.innerHTML = ""; return; }
  if (cat.note === "pasta") {
    el.innerHTML = `На выбор: <span class="note__choice">спагетти / фетучини / пенне / птитим</span>`;
  } else {
    el.textContent = NOTE_TEXT[cat.note];
  }
}

function renderGrid(cat) {
  const grid = $("#grid");
  grid.innerHTML = cat.items
    .map(
      (it, i) => `
      <div class="dish" data-i="${i}" style="animation-delay:${Math.min(i, 12) * 22}ms">
        <div class="dish__imgwrap">
          <img class="dish__img" src="${it.img}" alt="${it.name}" loading="lazy" />
          ${it.pre ? '<span class="dish__pre">⏰</span>' : ""}
        </div>
        <div class="dish__name">${it.name}</div>
      </div>`
    )
    .join("");
}

// делегируем клик по блюду
$("#grid").addEventListener("click", (e) => {
  const card = e.target.closest(".dish");
  if (!card) return;
  const it = CATEGORIES[current].items[+card.dataset.i];
  openSheet(it);
  haptic("light");
});

// ---------- КАРТОЧКА БЛЮДА ----------
function openSheet(it) {
  $("#sheetImg").src = it.img;
  $("#sheetImg").alt = it.name;
  $("#sheetName").textContent = it.name;
  $("#sheetDesc").textContent = it.desc || "";
  $("#sheetCat").textContent = CATEGORIES[current].title;
  $("#sheetPre").hidden = !it.pre;
  $("#sheet").setAttribute("aria-hidden", "false");
  if (tg) { try { tg.BackButton.show(); tg.BackButton.onClick(closeSheet); } catch (e) {} }
}
function closeSheet() {
  $("#sheet").setAttribute("aria-hidden", "true");
  if (tg) { try { tg.BackButton.hide(); tg.BackButton.offClick(closeSheet); } catch (e) {} }
}
$("#sheetBackdrop").addEventListener("click", closeSheet);

// ---------- CTA ----------
$("#cta").addEventListener("click", () => {
  $("#cats").scrollIntoView({ behavior: "smooth", block: "start" });
  haptic("medium");
});

// ---------- INIT ----------
buildRibbon();
buildCats();
selectCat(0);

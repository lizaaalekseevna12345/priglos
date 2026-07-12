(function () {
  const preview = document.getElementById('preview');
  let state = JSON.parse(JSON.stringify(TPLV2.defaultState));

  // тема шаблона из ?theme= (по умолчанию — изумруд)
  const tParam = new URLSearchParams(location.search).get('theme');
  // дефолты темы (напр. палитра дресс-кода из цветов приглашения) — поверх базовых,
  // но ниже сохранённых правок пользователя
  const th0 = tParam && window.ThemeKit && ThemeKit.get(tParam);
  if (th0 && th0.stateDefaults) Object.assign(state, JSON.parse(JSON.stringify(th0.stateDefaults)));

  const m = /(?:data|edit)=([^&]+)/.exec(location.hash);
  if (m) { try { state = Object.assign(state, decodeState(m[1])); } catch (e) {} }
  if (tParam) state.theme = tParam;

  function encodeState(s){ return btoa(unescape(encodeURIComponent(JSON.stringify(s)))); }
  function decodeState(str){ return JSON.parse(decodeURIComponent(escape(atob(str)))); }
  function attr(v){ return String(v==null?'':v).replace(/"/g,'&quot;'); }

  preview.innerHTML = TPLV2.markup();
  let scratchDone = false; // когда блёстки уже стёрли — больше не возвращаем при правках
  function render(){
    TPLV2.render(state, preview, { scratch: true, themeId: state.theme });
    // блёстки-скретч поверх обложки (как увидит гость)
    const sc = preview.querySelector('[data-scratch]');
    if (sc && window.ScratchEffect) {
      if (scratchDone) {
        sc.style.display = 'none'; // уже открыто — не перекрываем заново при редактировании
        const h = preview.querySelector('.olv-hint'); if (h) h.style.display = 'none';
      } else {
        const theme = (window.ThemeKit && ThemeKit.get(state.theme)) || {};
        ScratchEffect.init(sc, (theme.decor && theme.decor.glitter) || 'frost', {
          radius: 18,
          onReveal: () => {
            scratchDone = true;
            const olv = preview.querySelector('.olv');
            if (olv && window.Animations) Animations.glitterBurst(olv); // салют по обложке
          },
        });
      }
    }
  }

  // ── выбор блоков ──
  const bsel = document.getElementById('bsel');
  const bselGrid = document.getElementById('bselGrid');
  const bselCount = document.getElementById('bselCount');

  const ICONS = {
    timer:'<circle cx="12" cy="13" r="7"/><path d="M12 13V9.5"/><path d="M9.5 2.5h5"/><path d="M12 2.5v2"/>',
    pin:'<path d="M12 21s6.5-5.8 6.5-10.5A6.5 6.5 0 1 0 5.5 10.5C5.5 15.2 12 21 12 21z"/><circle cx="12" cy="10" r="2.4"/>',
    clock:'<circle cx="12" cy="12" r="8"/><path d="M12 7.5V12l3 1.8"/>',
    dress:'<path d="M10 3c0 1.6 4 1.6 4 0"/><path d="M10 4 8 9l2 1-2 10h8l-2-10 2-1-2-5"/>',
    spark:'<path d="M12 3l1.8 6.2L20 11l-6.2 1.8L12 19l-1.8-6.2L4 11l6.2-1.8z"/>',
    gift:'<rect x="4" y="9" width="16" height="11" rx="1"/><path d="M4 13h16"/><path d="M12 9v11"/><path d="M12 9C9.5 9 8.5 4.5 12 6.2 15.5 4.5 14.5 9 12 9z"/>',
    camera:'<rect x="3" y="7" width="18" height="13" rx="2"/><circle cx="12" cy="13.5" r="3.4"/><path d="M8.5 7l1.3-2h4.4L15.5 7"/>',
    heart:'<path d="M12 20s-7-4.4-7-9.4A3.6 3.6 0 0 1 12 7a3.6 3.6 0 0 1 7 3.6C19 15.6 12 20 12 20z"/>',
    bus:'<rect x="4" y="5" width="16" height="12" rx="2"/><path d="M4 12.5h16"/><path d="M7.5 9h9"/><circle cx="8" cy="18.5" r="1.3"/><circle cx="16" cy="18.5" r="1.3"/>',
    faq:'<circle cx="12" cy="12" r="9"/><path d="M9.6 9.6a2.5 2.5 0 0 1 4 1.9c0 1.5-2 1.8-2 3.2"/><path d="M12 17.4h.01"/>',
    phone:'<path d="M6.5 4h3l1.4 4-2 1.4a11 11 0 0 0 5.2 5.2l1.4-2 4 1.4v3a1.5 1.5 0 0 1-1.6 1.5A15.5 15.5 0 0 1 5 6.6 1.5 1.5 0 0 1 6.5 4z"/>',
  };
  function svg(name){ return `<svg class="bsel__svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${ICONS[name]||ICONS.spark}</svg>`; }
  const lockSvg = '<svg class="bsel__lock" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="5.5" y="11" width="13" height="8.5" rx="2"/><path d="M8.5 11V8a3.5 3.5 0 0 1 7 0v3"/></svg>';
  // постоянные блоки (нельзя снять) и доп. блоки (можно выбрать только 1)
  const PERMANENT = ['countdown','venue','timeline','dresscode','details'];
  const EXTRAS = ['gifts','story','transport','contacts'];
  function updateCount(){
    const n = (state.blocks||[]).filter((x)=>EXTRAS.includes(x)).length;
    bselCount.textContent = n ? 'Доп. блок выбран (1 из 1)' : 'Можно добавить 1 доп. блок';
  }
  function buildSelector(){
    bselGrid.innerHTML = '';
    TPLV2.BLOCKS.forEach((b) => {
      const locked = PERMANENT.includes(b.id);
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'bsel__card' + (state.blocks.includes(b.id) ? ' is-on' : '') + (locked ? ' is-locked' : '');
      card.innerHTML = `<span class="bsel__ic">${svg(b.icon)}</span><span class="bsel__name">${b.name}</span><span class="bsel__check${locked ? ' bsel__check--lock' : ''}">${locked ? lockSvg : '✓'}</span>`;
      card.addEventListener('click', () => {
        if (locked) return; // постоянный блок — снять нельзя
        const isOn = state.blocks.includes(b.id);
        state.blocks = state.blocks.filter((x)=> !EXTRAS.includes(x)); // только 1 доп. блок — снимаем все
        if (!isOn) state.blocks.push(b.id);                            // выбираем текущий
        state.blocks = TPLV2.BLOCKS.filter((x)=> state.blocks.includes(x.id)).map((x)=>x.id); // порядок
        buildSelector(); updateCount(); syncGroups(); render();
      });
      bselGrid.appendChild(card);
    });
    updateCount();
  }
  function syncGroups(){
    document.querySelectorAll('.grp[data-block]').forEach((g) => {
      g.style.display = state.blocks.includes(g.dataset.block) ? '' : 'none';
    });
  }
  document.getElementById('bselDone').addEventListener('click', () => { bsel.classList.add('is-hidden'); });
  document.getElementById('editBlocks').addEventListener('click', () => { buildSelector(); bsel.classList.remove('is-hidden'); });
  document.getElementById('bselLater').addEventListener('click', () => {
    state.blocks = JSON.parse(JSON.stringify(TPLV2.defaultState.blocks));
    buildSelector(); syncGroups(); render(); bsel.classList.add('is-hidden');
  });

  // ── текстовые поля ──
  // Полный render() пересобирает всю разметку + переинициализирует скретч/звёзды/таймер —
  // на телефоне это заметно тормозит ввод. Поэтому при печати обновляем ТОЛЬКО нужный
  // элемент превью напрямую (мгновенно), а тяжёлый render зовём лишь когда без него нельзя.
  function escHtml(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function liveText(key) {
    if (key === 'date') return false; // влияет на счётчик и формат даты — нужен полный рендер
    if (key === 'name1' || key === 'name2') {
      const el = preview.querySelector('[data-bind="names"]');
      if (!el) return false;
      el.innerHTML = escHtml(state.name1) + ' <span>&amp;</span> ' + escHtml(state.name2);
      return true;
    }
    const els = preview.querySelectorAll('[data-bind="' + key + '"]');
    if (!els.length) return false;
    els.forEach((el) => { el.textContent = state[key]; });
    return true;
  }
  let renderT = 0;
  function renderDebounced() { clearTimeout(renderT); renderT = setTimeout(render, 160); }
  document.querySelectorAll('[data-field]').forEach((input) => {
    const key = input.dataset.field;
    if (state[key] != null) input.value = state[key];
    input.addEventListener('input', () => {
      state[key] = input.value;
      // мгновенное точечное обновление; если элемент не нашёлся — откат на дебаунс-рендер
      if (!liveText(key)) renderDebounced();
    });
  });

  // ── фото ──
  document.querySelectorAll('[data-up]').forEach((up) => {
    const key = up.dataset.up;
    up.innerHTML = '<span class="up__txt">📷 Фото</span><button class="up__x" type="button">×</button>';
    const file = document.createElement('input'); file.type='file'; file.accept='image/*'; file.style.display='none'; up.appendChild(file);
    function fill(d){ state.photos[key]=d; up.style.backgroundImage=d?`url("${d}")`:''; up.classList.toggle('is-filled',!!d); render(); }
    up.addEventListener('click',(e)=>{ if(!e.target.classList.contains('up__x')) file.click(); });
    file.addEventListener('change',()=>{ const f=file.files[0]; if(!f) return; const fr=new FileReader(); fr.onload=()=>fill(fr.result); fr.readAsDataURL(f); });
    up.querySelector('.up__x').addEventListener('click',()=>{ file.value=''; fill(''); });
    if (state.photos[key]) { up.style.backgroundImage=`url("${state.photos[key]}")`; up.classList.add('is-filled'); }
  });

  // ── цвет заголовка и имён (только обложка) ──
  document.querySelectorAll('[data-color]').forEach((sw) => {
    const key = sw.dataset.color;
    const def = sw.dataset.default || '#3c402f';
    function paint(){ sw.style.background = state[key] || def; }
    paint();
    sw.addEventListener('click', () => ColorPicker.open({
      anchor: sw, color: state[key] || def,
      onChange: (hex) => { state[key] = hex; paint(); render(); },
    }));
  });

  // ── размер шрифта имён и даты (cqw) ──
  // базовый (красивый по умолчанию) размер для каждой темы. Ползунок настраиваем так,
  // чтобы этот размер стоял на ~30% дорожки: 30% запаса вниз, 70% вверх на увеличение.
  // Формула для позиции 30%: min = base·0.571, max = base·2.
  const SIZEBASE = {
    olive:    { nameSize: 15, dateSize: 13 },
    burgundy: { nameSize: 11, dateSize: 4 },
    choco:    { nameSize: 20, dateSize: 4 },
    emerald:  { nameSize: 10.2, dateSize: 13 },
  };
  document.querySelectorAll('[data-size]').forEach((inp) => {
    const key = inp.dataset.size;
    const base = (SIZEBASE[state.theme] || {})[key];
    if (base != null) {
      inp.min = (base * 0.571).toFixed(1);
      inp.max = (base * 2).toFixed(1);
      inp.step = '0.1';
      inp.dataset.default = String(base); // дефолт-позиция = базовый размер (≈30% дорожки)
    }
    inp.value = parseFloat(state[key]) || parseFloat(inp.dataset.default || '2');
    inp.addEventListener('input', () => { state[key] = inp.value; render(); });
  });

  // ── программа ──
  const progList = document.getElementById('progList');
  let progDragRow = null;
  function renderProg(){
    progList.innerHTML='';
    state.program.forEach((it)=>{
      const row=document.createElement('div'); row.className='prog__row'; row._item=it;
      row.innerHTML=`<span class="prog__drag" title="Перетащите, чтобы поменять порядок">⠿</span><input type="time" value="${attr(it.time)}" /><input value="${attr(it.label)}" placeholder="Сбор гостей" /><button class="prog__del" type="button">×</button>`;
      const [t,l]=row.querySelectorAll('input');
      // при вводе — дебаунс-рендер (без лагов), правим сам объект по ссылке
      t.addEventListener('input',()=>{it.time=t.value;renderDebounced();});
      l.addEventListener('input',()=>{it.label=l.value;renderDebounced();});
      row.querySelector('.prog__del').addEventListener('click',()=>{ const idx=state.program.indexOf(it); if(idx>-1) state.program.splice(idx,1); renderProg(); render(); });
      row.querySelector('.prog__drag').addEventListener('pointerdown',(e)=>progStartDrag(e,row));
      progList.appendChild(row);
    });
  }
  // перетаскивание пунктов (мышь + палец): двигаем сам DOM-узел, порядок state собираем на отпускании
  function progStartDrag(e, row){
    e.preventDefault();
    progDragRow = row;
    row.classList.add('is-dragging');
    try { e.target.setPointerCapture(e.pointerId); } catch(_){}
    document.addEventListener('pointermove', progOnDrag);
    document.addEventListener('pointerup', progEndDrag, { once:true });
  }
  function progOnDrag(e){
    if(!progDragRow) return;
    const others=[].slice.call(progList.querySelectorAll('.prog__row:not(.is-dragging)'));
    let before=null;
    for(const r of others){ const b=r.getBoundingClientRect(); if(e.clientY < b.top + b.height/2){ before=r; break; } }
    if(before) progList.insertBefore(progDragRow, before);
    else progList.appendChild(progDragRow);
  }
  function progEndDrag(){
    document.removeEventListener('pointermove', progOnDrag);
    if(progDragRow) progDragRow.classList.remove('is-dragging');
    progDragRow=null;
    // пересобираем порядок state.program из порядка строк в DOM
    state.program = [].slice.call(progList.querySelectorAll('.prog__row')).map((r)=>r._item);
    render();
  }
  document.getElementById('progAdd').addEventListener('click',()=>{ if(state.program.length>=10) return alert('Максимум 10 пунктов.'); state.program.push({time:'12:00',label:'Новый пункт'}); renderProg(); render(); });

  // ── дресс-код ──
  const dressList = document.getElementById('dressList');
  function renderDress(){
    dressList.innerHTML='';
    state.dressColors.forEach((c,i)=>{
      const chip=document.createElement('div'); chip.className='dress-chip';
      chip.innerHTML=`<div class="dress-chip__sw" style="background:${c}"></div><button class="dress-chip__del" type="button">×</button>`;
      const sw=chip.querySelector('.dress-chip__sw');
      sw.addEventListener('click',()=>ColorPicker.open({anchor:sw,color:state.dressColors[i],onChange:(hex)=>{state.dressColors[i]=hex;sw.style.background=hex;render();}}));
      chip.querySelector('.dress-chip__del').addEventListener('click',()=>{state.dressColors.splice(i,1);renderDress();render();});
      dressList.appendChild(chip);
    });
  }
  document.getElementById('dressAdd').addEventListener('click',()=>{ if(state.dressColors.length>=10) return alert('Максимум 10 цветов.'); state.dressColors.push('#7a8450'); renderDress(); render(); });

  // ── FAQ (удалён — заменён блоком «Опрос гостей») ──
  function renderFaq(){}

  // ── музыка ──
  const musicUp=document.getElementById('musicUp'), musicLabel=document.getElementById('musicLabel'), musicClear=document.getElementById('musicClear');
  const musicFile=document.createElement('input'); musicFile.type='file'; musicFile.accept='audio/*'; musicFile.style.display='none'; musicUp.appendChild(musicFile);
  function musicSync(){ const on=!!state.music; musicUp.classList.toggle('is-set',on); musicLabel.textContent=on?'🎵 Музыка добавлена':'Загрузить аудио (mp3)'; musicClear.hidden=!on; }
  musicUp.addEventListener('click',(e)=>{ if(e.target!==musicClear) musicFile.click(); });
  musicFile.addEventListener('change',()=>{ const f=musicFile.files[0]; if(!f) return; const fr=new FileReader(); fr.onload=()=>{state.music=fr.result;musicSync();}; fr.readAsDataURL(f); });
  musicClear.addEventListener('click',()=>{ state.music=''; musicFile.value=''; musicSync(); });

  // ── ссылка ──
  // приглашение сохраняется в облако (Supabase), гостю уходит короткая ссылка ?id=…
  // (раньше все данные + фото зашивались в URL — ссылки распухали и ломались)
  const modal=document.getElementById('shareModal');
  const shareBtn=document.getElementById('shareBtn');
  const shareLink=document.getElementById('shareLink');
  const shareOpen=document.getElementById('shareOpen');
  const shareCopy=document.getElementById('shareCopy');
  shareBtn.addEventListener('click', async ()=>{
    modal.hidden=false;
    shareLink.value='Создаём ссылку…'; shareOpen.removeAttribute('href');
    if(shareCopy) shareCopy.disabled=true;
    shareBtn.disabled=true;
    try {
      const id = await InviteStore.save(state);
      const url = new URL('invite.html', location.href).href + '?id=' + id;
      shareLink.value=url; shareOpen.href=url;
      if(shareCopy) shareCopy.disabled=false;
    } catch(e) {
      shareLink.value='';
      alert('Не удалось создать ссылку: ' + (e && e.message ? e.message : 'ошибка сети') + '. Попробуйте ещё раз.');
    } finally {
      shareBtn.disabled=false;
    }
  });
  document.getElementById('shareClose').addEventListener('click',()=>(modal.hidden=true));
  modal.addEventListener('click',(e)=>{ if(e.target===modal) modal.hidden=true; });
  document.getElementById('shareCopy').addEventListener('click',(e)=>{ const inp=document.getElementById('shareLink'); inp.select(); navigator.clipboard?.writeText(inp.value).then(()=>{e.target.textContent='Скопировано ✓';setTimeout(()=>(e.target.textContent='Копировать'),1500);},()=>{}); });

  // ── старт ──
  buildSelector(); syncGroups(); renderProg(); renderDress(); renderFaq(); musicSync(); render();
  TPLV2.startCountdown(preview, () => state);
})();

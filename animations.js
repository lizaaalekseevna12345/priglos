/* ░░░ Анимации приглашения ░░░
   Animations.fallingStars(container)  — лёгкий слой падающих звёздочек/искр
   Animations.glitterScatter(heroEl)   — блёстки разлетаются от курсора по обложке
   Animations.envelopeIntro({onDone, videoSrc}) — интро «открывается конверт»
   Все эффекты уважают prefers-reduced-motion.
*/
(function (global) {
  const reduced = () => global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── падающие звёзды (canvas в контейнере) ──────────────────────────────
  function fallingStars(container) {
    if (!container || container.dataset.starsInit) return;
    container.dataset.starsInit = '1';
    if (reduced()) return;

    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;';
    container.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    let W = 0, H = 0, dpr = Math.min(global.devicePixelRatio || 1, 2), stars = [], raf = 0;

    function resize() {
      const r = container.getBoundingClientRect();
      W = Math.max(1, r.width); H = Math.max(1, r.height);
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round(W * H / 520); // много мелкой пыли
      stars = [];
      for (let i = 0; i < n; i++) stars.push(spawn(true));
    }
    function spawn(initial) {
      return {
        x: Math.random() * W,
        y: initial ? Math.random() * H : -4,
        s: Math.random() * 0.7 + 0.35,        // мелкая пыль 0.35–1.05px
        v: Math.random() * 0.26 + 0.05,       // медленный дрейф
        sway: Math.random() * 0.5 + 0.12,
        ph: Math.random() * Math.PI * 2,
        tw: Math.random() * 0.09 + 0.03,      // частое мерцание
        col: Math.random() < 0.5 ? '#fff7e6' : '#f1dd9a',
      };
    }
    function frame() {
      if (!container.isConnected) return; // контейнер удалён при ре-рендере — гасим цикл
      ctx.clearRect(0, 0, W, H);
      for (const p of stars) {
        p.y += p.v; p.ph += p.tw; p.x += Math.sin(p.ph) * p.sway * 0.25;
        if (p.y > H + 4) Object.assign(p, spawn(false));
        ctx.globalAlpha = 0.12 + Math.abs(Math.sin(p.ph)) * 0.78; // мерцание
        ctx.fillStyle = p.col;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.s, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(frame);
    }
    resize();
    frame();
    if (global.ResizeObserver) new ResizeObserver(resize).observe(container);
    return { stop() { cancelAnimationFrame(raf); } };
  }

  // ── блёстки разлетаются от курсора ─────────────────────────────────────
  function glitterScatter(heroEl) {
    if (!heroEl || heroEl.dataset.glitterInit) return;
    heroEl.dataset.glitterInit = '1';
    if (reduced()) return;

    const layer = document.createElement('div');
    layer.style.cssText = 'position:absolute;inset:0;z-index:7;pointer-events:none;overflow:hidden;';
    heroEl.appendChild(layer);

    let last = 0;
    function emit(x, y) {
      const now = performance.now();
      if (now - last < 28) return; // троттлинг
      last = now;
      const count = 2 + (Math.random() * 2 | 0);
      for (let i = 0; i < count; i++) {
        const sp = document.createElement('span');
        const sz = 3 + Math.random() * 4;
        const dx = (Math.random() - 0.5) * 70;
        const dy = (Math.random() - 0.5) * 70 - 10;
        const rot = (Math.random() * 360) | 0;
        sp.style.cssText =
          `position:absolute;left:${x}px;top:${y}px;width:${sz}px;height:${sz}px;` +
          `background:radial-gradient(circle,#fffbe9,#d8c178);` +
          `clip-path:polygon(50% 0,61% 39%,100% 50%,61% 61%,50% 100%,39% 61%,0 50%,39% 39%);` +
          `transform:translate(-50%,-50%) rotate(${rot}deg);opacity:1;will-change:transform,opacity;`;
        layer.appendChild(sp);
        const dur = 520 + Math.random() * 360;
        sp.animate(
          [
            { transform: `translate(-50%,-50%) rotate(${rot}deg) scale(1)`, opacity: 1 },
            { transform: `translate(calc(-50% + ${dx}px),calc(-50% + ${dy}px)) rotate(${rot + 120}deg) scale(0)`, opacity: 0 },
          ],
          { duration: dur, easing: 'cubic-bezier(.2,.7,.3,1)' }
        ).onfinish = () => sp.remove();
      }
    }
    function pos(e) {
      const r = heroEl.getBoundingClientRect();
      const p = e.touches ? e.touches[0] : e;
      emit(p.clientX - r.left, p.clientY - r.top);
    }
    heroEl.addEventListener('pointermove', pos);
    heroEl.addEventListener('touchmove', pos, { passive: true });
  }

  // ── проявление по скроллу (имена, секции, пункты программы) ────────────
  function scrollReveal(container) {
    if (!container) return;
    const items = container.querySelectorAll('[data-reveal]');
    if (!items.length) return;
    if (reduced() || !('IntersectionObserver' in global)) {
      items.forEach((el) => el.classList.add('is-in'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });
    items.forEach((el) => { if (!el.classList.contains('is-in')) io.observe(el); });
  }

  // повторно проиграть проявление для группы (напр. имена после стирания блёсток)
  function replayReveal(scope) {
    if (!scope) return;
    const items = scope.querySelectorAll ? scope.querySelectorAll('[data-reveal]') : [];
    items.forEach((el) => {
      el.classList.remove('is-in');
      void el.offsetWidth; // форсируем reflow
      el.classList.add('is-in');
    });
  }

  // ── интро «открывается конверт» ────────────────────────────────────────
  function envelopeIntro(opts) {
    opts = opts || {};
    const done = () => { try { opts.onDone && opts.onDone(); } catch (e) {} };
    // тема без обложки/видео/конверта — интро не показываем (открывается сразу, напр. бордовая со скретчем)
    if (!opts.videoSrc && !opts.coverSrc && !opts.imageSrc) { done(); return; }
    if (sessionStorage.getItem('env_seen') === '1') { done(); return; } // один раз за сессию
    sessionStorage.setItem('env_seen', '1');
    if (reduced()) { done(); return; }

    const ov = document.createElement('div');
    ov.style.cssText = 'position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;cursor:pointer;overflow:hidden;' +
      'background:' + (opts.bg || 'radial-gradient(130% 120% at 50% 38%,#26331a,#0c1006)') + ';';
    document.body.appendChild(ov);

    function close() {
      const finish = () => { if (ov.__done) return; ov.__done = true; try { ov.remove(); } catch (e) {} done(); };
      try { ov.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 500, easing: 'ease', fill: 'forwards' }).onfinish = finish; } catch (e) {}
      setTimeout(finish, 620); // подстраховка: закрываем даже если колбэк анимации не сработает
    }

    // видео конверта (когда добавишь) — иначе картинка конверта
    if (opts.videoSrc) {
      const v = document.createElement('video');
      v.src = opts.videoSrc; v.autoplay = true; v.muted = true; v.playsInline = true; v.setAttribute('playsinline', '');
      v.style.cssText = 'max-width:100%;max-height:100%;';
      ov.appendChild(v); v.play().catch(() => {});
      v.addEventListener('ended', close); ov.addEventListener('click', close); setTimeout(close, 9000);
      return;
    }

    // ── режим полноэкранной обложки (Frame 41): фон + конверт + «ВАМ ПРИШЛО ПРИГЛАШЕНИЕ» ──
    if (opts.coverSrc) {
      const cover = document.createElement('div');
      cover.style.cssText = 'position:absolute;inset:0;background-size:contain;background-position:center;background-repeat:no-repeat;' +
        "background-image:url('" + opts.coverSrc + "');opacity:0;will-change:transform,opacity;";
      ov.appendChild(cover);
      const hint = document.createElement('div');
      hint.textContent = 'нажмите, чтобы открыть';
      hint.style.cssText = "position:absolute;left:0;right:0;bottom:8%;text-align:center;font-family:'Jun',Georgia,serif;" +
        "letter-spacing:.22em;text-transform:uppercase;font-size:12px;color:#8a8a6a;opacity:0;pointer-events:none;";
      ov.appendChild(hint);

      cover.animate([{ opacity: 0, transform: 'scale(1.05)' }, { opacity: 1, transform: 'none' }],
        { duration: 700, easing: 'cubic-bezier(.2,.7,.3,1)', fill: 'forwards' });
      let pulse = null;
      setTimeout(function () {
        hint.animate([{ opacity: 0 }, { opacity: .85 }], { duration: 500, fill: 'forwards' });
        pulse = setInterval(function () { hint.animate([{ opacity: .4 }, { opacity: .85 }, { opacity: .4 }], { duration: 1700 }); }, 1750);
      }, 780);

      let opened = false;
      function openCover() {
        if (opened) return; opened = true; if (pulse) clearInterval(pulse);
        if (opts.glitter) { try { glitterBurst(ov, { heightPct: 100, count: 320 }); } catch (e) {} }
        cover.animate([{ transform: 'scale(1)', opacity: 1 }, { transform: 'scale(1.85)', opacity: 0 }],
          { duration: 820, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'forwards' });
        hint.animate([{ opacity: .85 }, { opacity: 0 }], { duration: 200, fill: 'forwards' });
        setTimeout(close, 680);
      }
      ov.addEventListener('click', openCover);
      return;
    }

    const wrap = document.createElement('div');
    wrap.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:18px;';
    const img = document.createElement('img');
    img.src = opts.imageSrc || ''; img.alt = '';
    img.style.cssText = 'width:min(258px,62vw);filter:drop-shadow(0 24px 52px rgba(0,0,0,.55));opacity:0;';
    const hint = document.createElement('div');
    hint.textContent = 'нажмите, чтобы открыть';
    hint.style.cssText = "font-family:'Jun',Georgia,serif;letter-spacing:.2em;text-transform:uppercase;font-size:12px;color:#dcdcc4;opacity:0;";
    wrap.appendChild(img); wrap.appendChild(hint); ov.appendChild(wrap);

    img.animate([{ opacity: 0, transform: 'translateY(22px) scale(.92)' }, { opacity: 1, transform: 'none' }],
      { duration: 720, easing: 'cubic-bezier(.2,.7,.3,1)', fill: 'forwards' });
    setTimeout(() => hint.animate([{ opacity: 0 }, { opacity: .85 }], { duration: 500, fill: 'forwards' }), 720);

    let opened = false;
    function open() {
      if (opened) return; opened = true;
      img.animate([{ transform: 'scale(1)', opacity: 1 }, { transform: 'scale(1.55)', opacity: 0 }],
        { duration: 650, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'forwards' });
      hint.animate([{ opacity: .85 }, { opacity: 0 }], { duration: 220, fill: 'forwards' });
      setTimeout(close, 560);
    }
    ov.addEventListener('click', open);
    setTimeout(open, 2400); // авто-открытие, если гость не нажал
  }

  // ── САЛЮТ блёсток по обложке (когда стёрли скретч) — золотая вспышка + искры ──
  const STAR = 'polygon(50% 0,61% 39%,100% 50%,61% 61%,50% 100%,39% 61%,0 50%,39% 39%)';
  const GLT_COLORS = ['#fffbe9', '#ffe9a8', '#e6cf86', '#ffd97a', '#ffffff', '#f4dd9a'];
  function glitterBurst(container, opts) {
    opts = opts || {};
    if (!container || reduced()) return;
    const layer = document.createElement('div');
    layer.style.cssText = 'position:absolute;left:0;right:0;top:0;z-index:30;pointer-events:none;overflow:visible;' +
      'height:' + (opts.heightPct || 19) + '%;';
    container.appendChild(layer);

    // 1) золотая вспышка-волна из центра
    const flash = document.createElement('div');
    flash.style.cssText = 'position:absolute;left:50%;top:46%;width:56%;aspect-ratio:1;border-radius:50%;' +
      'transform:translate(-50%,-50%) scale(.2);mix-blend-mode:screen;opacity:0;' +
      'background:radial-gradient(circle,rgba(255,245,205,.7),rgba(255,224,150,.16) 45%,transparent 70%);';
    layer.appendChild(flash);
    flash.animate(
      [{ opacity: 0, transform: 'translate(-50%,-50%) scale(.2)' },
       { opacity: 1, transform: 'translate(-50%,-50%) scale(1)', offset: .3 },
       { opacity: 0, transform: 'translate(-50%,-50%) scale(2)' }],
      { duration: 1400, easing: 'cubic-bezier(.2,.7,.3,1)' }
    ).onfinish = () => flash.remove();

    // 2) облако мелкой мерцающей пыли — разлетается во все стороны
    const n = opts.count || 460;
    for (let i = 0; i < n; i++) {
      const sp = document.createElement('span');
      const sz = 1.4 + Math.random() * 2.8;                 // заметная мерцающая пыль 1.4–4.2px
      const x = Math.random() * 100, y = Math.random() * 100;
      const ang = Math.random() * Math.PI * 2;
      const dist = 30 + Math.random() * 170;
      const dx = Math.cos(ang) * dist, dy = Math.sin(ang) * dist - 12;
      const col = GLT_COLORS[(Math.random() * GLT_COLORS.length) | 0];
      const delay = Math.random() * 520;                    // шире разброс старта — салют длится дольше
      sp.style.cssText =
        'position:absolute;left:' + x + '%;top:' + y + '%;width:' + sz + 'px;height:' + sz + 'px;border-radius:50%;' +
        'background:radial-gradient(circle,#fff,' + col + ');box-shadow:0 0 ' + (sz*1.6) + 'px rgba(255,240,200,.7);' +
        'transform:translate(-50%,-50%) scale(0);opacity:0;will-change:transform,opacity;';
      layer.appendChild(sp);
      sp.animate(
        [
          { transform: 'translate(-50%,-50%) scale(0)', opacity: 0, offset: 0 },
          { transform: 'translate(calc(-50% + ' + (dx * .35) + 'px),calc(-50% + ' + (dy * .35) + 'px)) scale(1)', opacity: 1, offset: 0.16 },
          { transform: 'translate(calc(-50% + ' + (dx * .72) + 'px),calc(-50% + ' + (dy * .72) + 'px)) scale(1)', opacity: 1, offset: 0.62 },
          { transform: 'translate(calc(-50% + ' + dx + 'px),calc(-50% + ' + dy + 'px)) scale(.25)', opacity: 0, offset: 1 },
        ],
        { duration: 2000 + Math.random() * 1500, delay: delay, easing: 'cubic-bezier(.15,.65,.3,1)' }
      ).onfinish = () => sp.remove();
      // мерцание пылинки (через яркость — не конфликтует с прозрачностью)
      sp.animate([{ filter: 'brightness(.7)' }, { filter: 'brightness(1.8)' }, { filter: 'brightness(.7)' }],
        { duration: 360 + Math.random() * 260, delay: delay, iterations: 7, easing: 'ease-in-out' });
    }
    setTimeout(() => layer.remove(), 2900);
  }

  global.Animations = { fallingStars, glitterScatter, glitterBurst, envelopeIntro, scrollReveal, replayReveal };
})(window);

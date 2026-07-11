/* ░░░ Скретч-эффект ░░░
   <canvas> со слоем «блёсток» поверх центра салфетки. Движение мышью/пальцем
   стирает блёстки и проявляет фото+текст под ними. Сама салфетка-кружево статична.
   При стирании блёстки прикольно разлетаются во все стороны (искры).
   ScratchEffect.init(canvas, cover, { radius, threshold, onReveal })
   cover: URL картинки блёсток ИЛИ 'frost' (сгенерированный слой).
*/
(function (global) {
  function init(canvas, cover, opts) {
    opts = opts || {};
    const radius = opts.radius || 26;
    const threshold = opts.threshold || 0.55;
    const ctx = canvas.getContext('2d');
    let revealed = false, drawing = false, ready = false;

    // слой искр (разлетающиеся блёстки) — поверх канваса, может вылетать за его край
    const host = canvas.parentNode;
    let spark = null;
    if (host) {
      spark = document.createElement('div');
      spark.className = 'v2-hero__spark';
      host.appendChild(spark);
    }
    const reduced = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let img = null;
    if (cover && cover !== 'frost') {
      img = new Image(); img.crossOrigin = 'anonymous';
      img.onload = () => { ready = true; paint(); };
      img.onerror = () => { img = null; ready = true; paint(); };
      img.src = cover;
    } else { ready = true; }

    function size() {
      const r = canvas.getBoundingClientRect();
      const dpr = Math.min(global.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(r.width * dpr));
      canvas.height = Math.max(1, Math.round(r.height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      return r;
    }
    function paint() {
      if (!ready) return;
      const r = size();
      ctx.globalCompositeOperation = 'source-over';
      ctx.clearRect(0, 0, r.width, r.height);
      if (img) {
        // вписываем блёстки по принципу cover
        const ir = img.width / img.height, cr = r.width / r.height;
        let w, hh, x, y;
        if (ir > cr) { hh = r.height; w = hh * ir; x = (r.width - w) / 2; y = 0; }
        else { w = r.width; hh = w / ir; x = 0; y = (r.height - hh) / 2; }
        ctx.drawImage(img, x, y, w, hh);
      } else {
        const g = ctx.createLinearGradient(0, 0, r.width, r.height);
        g.addColorStop(0, '#e9ece0'); g.addColorStop(.5, '#dde0d2'); g.addColorStop(1, '#eef0e6');
        ctx.fillStyle = g; ctx.fillRect(0, 0, r.width, r.height);
        const n = Math.round(r.width * r.height / 90);
        for (let i = 0; i < n; i++) {
          const x = Math.random() * r.width, y = Math.random() * r.height, s = Math.random() * 1.6 + .3;
          ctx.globalAlpha = Math.random() * 0.5 + 0.2;
          ctx.fillStyle = Math.random() < .5 ? '#ffffff' : '#c7cbb8';
          ctx.beginPath(); ctx.arc(x, y, s, 0, Math.PI * 2); ctx.fill();
        }
        ctx.globalAlpha = 1;
      }
    }

    function pos(e) {
      const r = canvas.getBoundingClientRect();
      const p = e.touches ? e.touches[0] : e;
      return { x: p.clientX - r.left, y: p.clientY - r.top };
    }
    function erase(e) {
      const { x, y } = pos(e);
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fill();
      burst(x, y);
      maybeReveal();
    }

    // искры разлетаются от точки стирания во все стороны
    let lastBurst = 0;
    function burst(x, y) {
      if (!spark || reduced) return;
      const now = performance.now();
      if (now - lastBurst < 32) return;
      lastBurst = now;
      const ox = canvas.offsetLeft, oy = canvas.offsetTop; // координаты внутри салфетки
      const count = 3 + (Math.random() * 3 | 0);
      for (let i = 0; i < count; i++) {
        const sp = document.createElement('span');
        const sz = 3 + Math.random() * 5;
        const ang = Math.random() * Math.PI * 2;
        const dist = 26 + Math.random() * 60;
        const dx = Math.cos(ang) * dist, dy = Math.sin(ang) * dist - 10;
        const rot = (Math.random() * 360) | 0;
        sp.style.cssText =
          'position:absolute;left:' + (ox + x) + 'px;top:' + (oy + y) + 'px;width:' + sz + 'px;height:' + sz + 'px;' +
          'background:radial-gradient(circle,#fffdf2,#ddc987);' +
          'clip-path:polygon(50% 0,61% 39%,100% 50%,61% 61%,50% 100%,39% 61%,0 50%,39% 39%);' +
          'transform:translate(-50%,-50%) rotate(' + rot + 'deg);opacity:1;will-change:transform,opacity;';
        spark.appendChild(sp);
        sp.animate(
          [
            { transform: 'translate(-50%,-50%) rotate(' + rot + 'deg) scale(1)', opacity: 1 },
            { transform: 'translate(calc(-50% + ' + dx + 'px),calc(-50% + ' + dy + 'px)) rotate(' + (rot + 140) + 'deg) scale(.2)', opacity: 0 },
          ],
          { duration: 600 + Math.random() * 400, easing: 'cubic-bezier(.2,.7,.3,1)' }
        ).onfinish = () => sp.remove();
      }
    }

    function maybeReveal() {
      if (revealed) return;
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      let clear = 0, total = 0;
      for (let i = 3; i < data.length; i += 4 * 200) { total++; if (data[i] < 40) clear++; }
      if (total && clear / total > threshold) revealAll();
    }
    function revealAll() {
      if (revealed) return; revealed = true;
      canvas.style.transition = 'opacity .6s ease'; canvas.style.opacity = '0';
      setTimeout(() => { canvas.style.display = 'none'; }, 600);
      // подсказка «сотри меня плиз» — гаснет вместе с блёстками
      const hint = canvas.parentNode && canvas.parentNode.querySelector('.olv-hint');
      if (hint) { hint.style.transition = 'opacity .5s ease'; hint.style.opacity = '0'; setTimeout(() => { hint.style.display = 'none'; }, 500); }
      if (opts.onReveal) try { opts.onReveal(); } catch (e) {}
    }

    canvas.addEventListener('mousedown', (e) => { drawing = true; erase(e); });
    canvas.addEventListener('mousemove', (e) => { if (drawing) erase(e); });
    global.addEventListener('mouseup', () => { drawing = false; });
    canvas.addEventListener('touchstart', (e) => { drawing = true; erase(e); e.preventDefault(); }, { passive: false });
    canvas.addEventListener('touchmove', (e) => { erase(e); e.preventDefault(); }, { passive: false });
    canvas.addEventListener('touchend', () => { drawing = false; });
    global.addEventListener('resize', () => { if (!revealed) paint(); });
    global.addEventListener('load', () => { if (!revealed) paint(); });
    if (global.ResizeObserver) { new ResizeObserver(() => { if (!revealed) paint(); }).observe(canvas); }

    setTimeout(paint, 60);
    setTimeout(() => { if (!revealed) paint(); }, 400);
    return { reset: paint, revealAll };
  }
  global.ScratchEffect = { init };
})(window);

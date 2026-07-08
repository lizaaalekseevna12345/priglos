/* ░░░ Мини-палитра в стиле Figma ░░░
   ColorPicker.open({ anchor, color, onChange, onClose })
   - поле насыщенность/яркость, ползунок оттенка, HEX-инпут
*/
(function (global) {
  let pop = null;
  let state = { h: 0, s: 1, v: 1 };
  let cb = null;

  function hsvToRgb(h, s, v) {
    const c = v * s, x = c * (1 - Math.abs(((h / 60) % 2) - 1)), m = v - c;
    let r = 0, g = 0, b = 0;
    if (h < 60) [r, g, b] = [c, x, 0];
    else if (h < 120) [r, g, b] = [x, c, 0];
    else if (h < 180) [r, g, b] = [0, c, x];
    else if (h < 240) [r, g, b] = [0, x, c];
    else if (h < 300) [r, g, b] = [x, 0, c];
    else [r, g, b] = [c, 0, x];
    return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
  }
  function rgbToHsv(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
    let h = 0;
    if (d) {
      if (max === r) h = ((g - b) / d) % 6;
      else if (max === g) h = (b - r) / d + 2;
      else h = (r - g) / d + 4;
      h *= 60; if (h < 0) h += 360;
    }
    const s = max === 0 ? 0 : d / max;
    return { h, s, v: max };
  }
  function toHex(h, s, v) {
    const [r, g, b] = hsvToRgb(h, s, v);
    return '#' + [r, g, b].map((n) => n.toString(16).padStart(2, '0')).join('').toUpperCase();
  }
  function fromHex(hex) {
    const m = /^#?([0-9a-f]{6})$/i.exec(hex || '');
    if (!m) return null;
    const n = parseInt(m[1], 16);
    return rgbToHsv((n >> 16) & 255, (n >> 8) & 255, n & 255);
  }

  function build() {
    pop = document.createElement('div');
    pop.className = 'cp';
    pop.innerHTML = `
      <div class="cp__sv" data-sv>
        <div class="cp__sv-white"></div>
        <div class="cp__sv-black"></div>
        <div class="cp__sv-handle" data-sv-handle></div>
      </div>
      <div class="cp__hue" data-hue>
        <div class="cp__hue-handle" data-hue-handle></div>
      </div>
      <div class="cp__row">
        <span class="cp__preview" data-preview></span>
        <input class="cp__hex" data-hex maxlength="7" />
        <button class="cp__done" data-done>Готово</button>
      </div>`;
    document.body.appendChild(pop);

    const sv = pop.querySelector('[data-sv]');
    const hue = pop.querySelector('[data-hue]');
    bindDrag(sv, (x, y) => { state.s = x; state.v = 1 - y; update(); });
    bindDrag(hue, (x) => { state.h = x * 360; update(); }, true);

    pop.querySelector('[data-hex]').addEventListener('input', (e) => {
      const hsv = fromHex(e.target.value.trim());
      if (hsv) { state = hsv; update(false); }
    });
    pop.querySelector('[data-done]').addEventListener('click', close);
    pop.addEventListener('mousedown', (e) => e.stopPropagation());
  }

  function bindDrag(el, fn, horizontal) {
    function move(e) {
      const r = el.getBoundingClientRect();
      const px = (e.touches ? e.touches[0].clientX : e.clientX);
      const py = (e.touches ? e.touches[0].clientY : e.clientY);
      let x = (px - r.left) / r.width;
      let y = (py - r.top) / r.height;
      x = Math.min(1, Math.max(0, x)); y = Math.min(1, Math.max(0, y));
      fn(x, y);
    }
    el.addEventListener('mousedown', (e) => {
      e.preventDefault(); move(e);
      const up = () => { document.removeEventListener('mousemove', move); document.removeEventListener('mouseup', up); };
      document.addEventListener('mousemove', move); document.addEventListener('mouseup', up);
    });
  }

  function update(updateHex = true) {
    const sv = pop.querySelector('[data-sv]');
    const hueColor = toHex(state.h, 1, 1);
    sv.style.background = hueColor;
    pop.querySelector('[data-sv-handle]').style.left = state.s * 100 + '%';
    pop.querySelector('[data-sv-handle]').style.top = (1 - state.v) * 100 + '%';
    pop.querySelector('[data-hue-handle]').style.left = (state.h / 360) * 100 + '%';
    const hex = toHex(state.h, state.s, state.v);
    pop.querySelector('[data-preview]').style.background = hex;
    if (updateHex) pop.querySelector('[data-hex]').value = hex;
    if (cb) cb(hex);
  }

  function position(anchor) {
    const r = anchor.getBoundingClientRect();
    const top = r.bottom + window.scrollY + 8;
    let left = r.left + window.scrollX;
    left = Math.min(left, window.scrollX + document.documentElement.clientWidth - 240);
    pop.style.top = top + 'px';
    pop.style.left = Math.max(8, left) + 'px';
  }

  function open(opts) {
    close();
    cb = opts.onChange || null;
    if (!pop) build();
    pop.style.display = 'block';
    const hsv = fromHex(opts.color) || { h: 0, s: 1, v: 1 };
    state = hsv;
    update();
    position(opts.anchor);
    setTimeout(() => document.addEventListener('mousedown', outside), 0);
    open._onClose = opts.onClose;
  }

  function outside() { close(); }

  function close() {
    document.removeEventListener('mousedown', outside);
    if (pop) pop.style.display = 'none';
    if (open._onClose) { const f = open._onClose; open._onClose = null; f(); }
    cb = null;
  }

  global.ColorPicker = { open, close };
})(window);

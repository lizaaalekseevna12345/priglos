/* ░░░ Хранилище приглашений (Supabase) ░░░
   Вместо того чтобы зашивать все данные в URL (ссылки распухали до мегабайтов и ломались),
   приглашение сохраняется в облаке, а гостю уходит короткая ссылка invite.html?id=xxxxxxxx.
   Ключ anon — публичный по дизайну (доступ ограничен RLS-политиками: только insert/select). */
(function (global) {
  const SUPA_URL = 'https://blbptaqcrilsbsrxcfgs.supabase.co';
  const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsYnB0YXFjcmlsc2JzcnhjZmdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM3ODE0NTQsImV4cCI6MjA5OTM1NzQ1NH0.unQHp5zJP6O_lTUO3djOVTl6AFuAgkiRUkgxNmw7GJs';
  const H = { apikey: SUPA_KEY, Authorization: 'Bearer ' + SUPA_KEY };

  // короткий id без похожих символов (l/1/o/0)
  function randId(n) {
    const a = 'abcdefghijkmnpqrstuvwxyz23456789';
    let s = '';
    for (let i = 0; i < (n || 8); i++) s += a[(Math.random() * a.length) | 0];
    return s;
  }

  // сжать фото (data URL) перед сохранением: длинная сторона ≤ 1400px, JPEG — чтобы строки не пухли
  function compress(dataUrl) {
    return new Promise((resolve) => {
      if (!dataUrl || String(dataUrl).slice(0, 11) !== 'data:image/') { resolve(dataUrl); return; }
      const img = new Image();
      img.onload = () => {
        let w = img.naturalWidth, h = img.naturalHeight;
        const max = 1400;
        if (Math.max(w, h) > max) { const k = max / Math.max(w, h); w = Math.round(w * k); h = Math.round(h * k); }
        try {
          const c = document.createElement('canvas'); c.width = w; c.height = h;
          c.getContext('2d').drawImage(img, 0, 0, w, h);
          resolve(c.toDataURL('image/jpeg', 0.82));
        } catch (e) { resolve(dataUrl); }
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    });
  }

  // сохранить приглашение → вернуть короткий id
  async function save(state) {
    const s = JSON.parse(JSON.stringify(state || {}));
    if (s.photos) { for (const k in s.photos) { s.photos[k] = await compress(s.photos[k]); } }
    // несколько попыток на случай крайне маловероятной коллизии id
    for (let attempt = 0; attempt < 3; attempt++) {
      const id = randId(8);
      const r = await fetch(SUPA_URL + '/rest/v1/invites', {
        method: 'POST',
        headers: Object.assign({ 'Content-Type': 'application/json', Prefer: 'return=minimal' }, H),
        body: JSON.stringify({ id, data: s }),
      });
      if (r.ok) return id;
      if (r.status !== 409) throw new Error('Не удалось сохранить приглашение (' + r.status + ')');
    }
    throw new Error('Не удалось сгенерировать уникальную ссылку');
  }

  // загрузить приглашение по id
  async function load(id) {
    const r = await fetch(SUPA_URL + '/rest/v1/invites?id=eq.' + encodeURIComponent(id) + '&select=data', { headers: H });
    if (!r.ok) throw new Error('load ' + r.status);
    const rows = await r.json();
    if (!rows.length) throw new Error('not found');
    return rows[0].data;
  }

  global.InviteStore = { save, load };
})(window);

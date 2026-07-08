/* ░░░ Фоновая музыка приглашения ░░░
   MusicPlayer.mount(src) — добавляет плавающую кнопку play/pause и <audio>.
   Браузеры блокируют автоплей, поэтому старт — по первому клику/касанию.
*/
(function (global) {
  function mount(src) {
    if (!src) return null;
    const audio = document.createElement('audio');
    audio.src = src;
    audio.loop = true;
    audio.preload = 'auto';
    document.body.appendChild(audio);

    const btn = document.createElement('button');
    btn.className = 'music-fab';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Музыка');
    btn.innerHTML = '<span class="music-ico">♪</span>';
    document.body.appendChild(btn);

    let playing = false;
    function toggle() {
      if (playing) { audio.pause(); }
      else { audio.play().catch(() => {}); }
    }
    audio.addEventListener('play', () => { playing = true; btn.classList.add('is-playing'); });
    audio.addEventListener('pause', () => { playing = false; btn.classList.remove('is-playing'); });
    btn.addEventListener('click', toggle);

    // попытка стартовать при первом любом взаимодействии со страницей
    function firstTouch() {
      audio.play().catch(() => {});
      window.removeEventListener('pointerdown', firstTouch);
    }
    window.addEventListener('pointerdown', firstTouch, { once: true });

    return { audio, btn, toggle };
  }
  global.MusicPlayer = { mount };
})(window);

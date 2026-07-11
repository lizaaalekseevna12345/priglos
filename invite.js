(function () {
  // приглашение всегда открывается сверху — иначе браузер восстанавливает прокрутку
  // на середину, и «Программа дня» проявляется без анимации (уже в зоне видимости)
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);
  function decodeState(str) { return JSON.parse(decodeURIComponent(escape(atob(str)))); }
  const root = document.getElementById('invite');

  // ── рендер приглашения по готовому state ──
  function boot(state) {
    state = state || {};
    root.innerHTML = TPLV2.markup();
    const theme = (window.ThemeKit && ThemeKit.get(state.theme || 'emerald')) || { decor: {}, envelope: '' };

    TPLV2.render(state, root, { scratch: true, animate: true });
    TPLV2.startCountdown(root, () => state);

    // скретч-эффект: стираются настоящие блёстки, разлетаются искры; кружево статично
    const sc = root.querySelector('[data-scratch]');
    if (sc && window.ScratchEffect) ScratchEffect.init(sc, (theme.decor && theme.decor.glitter) || 'frost', {
      radius: 26,
      onReveal: () => {
        if (!window.Animations) return;
        const olv = root.querySelector('.olv');
        if (olv) Animations.glitterBurst(olv);           // салют по обложке
        else Animations.replayReveal(root.querySelector('.v2-hero__frame'));
      },
    });

    // фоновая музыка
    if (state.music && window.MusicPlayer) MusicPlayer.mount(state.music);

    // интро «открывается конверт»: видео темы (если .mp4/.webm) — иначе картинка конверта
    if (window.Animations && Animations.envelopeIntro) {
      const env = theme.envelope || '';
      const isVideo = /\.(mp4|webm)$/i.test(env);
      const intro = theme.intro || {};
      Animations.envelopeIntro({
        coverSrc: intro.cover || '',
        bg: intro.bg || '',
        glitter: !!intro.glitter,
        videoSrc: isVideo ? env : '',
        imageSrc: (theme.decor && theme.decor.envelope) || (isVideo ? '' : env),
        onDone: () => {},
      });
    }
  }

  // простой экран загрузки, пока тянем данные из облака
  function showLoading() {
    root.innerHTML = '<div style="min-height:100vh;display:flex;align-items:center;justify-content:center;' +
      "font-family:'Jun',Georgia,serif;color:#e8e2d2;letter-spacing:.15em;text-transform:uppercase;font-size:14px;opacity:.8;\">Загружаем приглашение…</div>";
  }
  function showError() {
    root.innerHTML = '<div style="min-height:100vh;display:flex;align-items:center;justify-content:center;text-align:center;padding:24px;' +
      "font-family:'Jun',Georgia,serif;color:#e8e2d2;font-size:15px;line-height:1.5;\">Приглашение не найдено.<br>Проверьте ссылку или попросите отправить её заново.</div>";
  }

  // ── источник данных: короткая ссылка ?id=… (облако) или старая #data=… ──
  const idm = /[?&]id=([A-Za-z0-9_-]+)/.exec(location.search);
  if (idm && window.InviteStore) {
    showLoading();
    InviteStore.load(idm[1]).then(boot).catch(showError);
  } else {
    let state = {};
    const m = /data=([^&]+)/.exec(location.hash);
    if (m) { try { state = decodeState(m[1]) || {}; } catch (e) {} }
    boot(state);
  }
})();

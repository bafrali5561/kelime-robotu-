(() => {
  function moveVocabularyToEnd() {
    const main = document.querySelector('#appShell main');
    const roadmap = document.getElementById('vocabRoadmap');
    if (!main || !roadmap) return;
    if (main.lastElementChild !== roadmap) main.appendChild(roadmap);
  }

  function init() {
    moveVocabularyToEnd();

    const main = document.querySelector('#appShell main');
    if (!main) return;

    const observer = new MutationObserver(() => moveVocabularyToEnd());
    observer.observe(main, { childList: true });

    // Some dashboard modules are loaded asynchronously. Run a few lightweight
    // follow-up checks so the final order settles without depending on load timing.
    let checks = 0;
    const timer = setInterval(() => {
      moveVocabularyToEnd();
      checks += 1;
      if (checks >= 12) clearInterval(timer);
    }, 500);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
// Themes for ChatGPT - content script.
// Applies the selected theme and follows ChatGPT's light/dark state unless the
// popup mode switcher is set to a manual mode.

(() => {
  const api = (typeof browser !== 'undefined' ? browser : chrome);
  const STYLE_ID = 'chatthemes-style';
  const THEME_KEY = 'selectedTheme';
  const MODE_KEY = 'themeMode';
  const RESOLVED_MODE_KEY = 'resolvedMode';
  const CACHE_KEY = 'chatthemes:lastState';
  const DEFAULTS = { [THEME_KEY]: 'default', [MODE_KEY]: 'auto' };

  let state = { ...DEFAULTS };
  let lastSignature = '';
  let scheduled = 0;

  function storageGet(keys) {
    try {
      const result = api.storage.sync.get(keys);
      if (result && typeof result.then === 'function') return result;
    } catch (_) {
      // Fall through to callback API.
    }
    return new Promise(resolve => api.storage.sync.get(keys, resolve));
  }

  function normalizeMode(mode) {
    return mode === 'light' || mode === 'dark' ? mode : 'auto';
  }

  function normalizeResolvedMode(mode) {
    return mode === 'light' || mode === 'dark' ? mode : '';
  }

  function readCachedState() {
    try {
      const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
      if (!cached || typeof cached !== 'object') return null;
      return {
        [THEME_KEY]: cached[THEME_KEY] || DEFAULTS[THEME_KEY],
        [MODE_KEY]: normalizeMode(cached[MODE_KEY]),
        [RESOLVED_MODE_KEY]: normalizeResolvedMode(cached[RESOLVED_MODE_KEY])
      };
    } catch (_) {
      return null;
    }
  }

  function writeCachedState(nextState, resolvedMode) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        [THEME_KEY]: nextState[THEME_KEY] || DEFAULTS[THEME_KEY],
        [MODE_KEY]: normalizeMode(nextState[MODE_KEY]),
        [RESOLVED_MODE_KEY]: normalizeResolvedMode(resolvedMode || nextState[RESOLVED_MODE_KEY])
      }));
    } catch (_) {
      // Page storage can be unavailable in hardened/private contexts.
    }
  }

  function detectChatGptMode(fallbackMode) {
    const root = document.documentElement;
    const attr = [
      root.getAttribute('data-theme'),
      root.getAttribute('data-color-scheme'),
      root.getAttribute('color-scheme'),
      document.body && document.body.getAttribute('data-theme')
    ].filter(Boolean).join(' ').toLowerCase();

    if (/\bdark\b/.test(attr) || root.classList.contains('dark')) return 'dark';
    if (/\blight\b/.test(attr) || root.classList.contains('light')) return 'light';

    if (document.body) {
      const bg = getComputedStyle(document.body).backgroundColor;
      const match = bg && bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
      if (match) {
        const r = Number(match[1]);
        const g = Number(match[2]);
        const b = Number(match[3]);
        return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255 < 0.45 ? 'dark' : 'light';
      }
    }

    const cachedMode = normalizeResolvedMode(fallbackMode);
    if (cachedMode) return cachedMode;

    return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function getStyleEl() {
    let el = document.getElementById(STYLE_ID);
    if (!el) {
      el = document.createElement('style');
      el.id = STYLE_ID;
      (document.head || document.documentElement).appendChild(el);
    }
    return el;
  }

  function moveStyleIntoHead() {
    if (!document.head) return;
    const el = getStyleEl();
    if (el.parentNode !== document.head) document.head.prepend(el);
  }

  function applyTheme() {
    const themeId = state[THEME_KEY] || DEFAULTS[THEME_KEY];
    const modeSetting = normalizeMode(state[MODE_KEY]);
    const resolvedMode = modeSetting === 'auto'
      ? detectChatGptMode(state[RESOLVED_MODE_KEY])
      : modeSetting;
    const signature = `${themeId}:${modeSetting}:${resolvedMode}`;

    if (signature === lastSignature && document.getElementById(STYLE_ID)) return;
    lastSignature = signature;
    state[RESOLVED_MODE_KEY] = resolvedMode;

    const theme = (CHATTHEMES.themes || []).find(t => t.id === themeId);
    const css = theme ? CHATTHEMES.buildCSS(theme, resolvedMode) : '';
    getStyleEl().textContent = css;
    document.documentElement.setAttribute('data-chattheme', themeId);
    document.documentElement.setAttribute('data-chattheme-mode', resolvedMode);
    writeCachedState(state, resolvedMode);
  }

  function scheduleApply() {
    if (scheduled) return;
    scheduled = requestAnimationFrame(() => {
      scheduled = 0;
      applyTheme();
    });
  }

  const cachedState = readCachedState();
  if (cachedState) {
    state = { ...DEFAULTS, ...cachedState };
    applyTheme();
  }

  storageGet([THEME_KEY, MODE_KEY]).then(result => {
    state = { ...DEFAULTS, ...state, ...(result || {}) };
    applyTheme();
  });

  api.storage.onChanged.addListener((changes, area) => {
    if (area !== 'sync') return;
    if (changes[THEME_KEY]) state[THEME_KEY] = changes[THEME_KEY].newValue || DEFAULTS[THEME_KEY];
    if (changes[MODE_KEY]) state[MODE_KEY] = normalizeMode(changes[MODE_KEY].newValue);
    if (changes[THEME_KEY] || changes[MODE_KEY]) {
      writeCachedState(state);
      scheduleApply();
    }
  });

  const rootObserver = new MutationObserver(scheduleApply);
  rootObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class', 'data-theme', 'data-color-scheme', 'color-scheme'],
    childList: false,
    subtree: false
  });

  function watchBodyTheme() {
    if (!document.body) return;
    const bodyObserver = new MutationObserver(scheduleApply);
    bodyObserver.observe(document.body, {
      attributes: true,
      attributeFilter: ['class', 'data-theme', 'data-color-scheme', 'color-scheme'],
      childList: false,
      subtree: false
    });
  }

  function watchHead() {
    if (!document.head) {
      const rootHeadObserver = new MutationObserver(() => {
        if (!document.head) return;
        rootHeadObserver.disconnect();
        watchHead();
      });
      rootHeadObserver.observe(document.documentElement, { childList: true, subtree: false });
      return;
    }
    moveStyleIntoHead();
    const headObserver = new MutationObserver(() => {
      if (document.getElementById(STYLE_ID)) moveStyleIntoHead();
      else scheduleApply();
    });
    headObserver.observe(document.head, { childList: true, subtree: false });
  }

  watchHead();

  if (document.body) watchBodyTheme();
  else document.addEventListener('DOMContentLoaded', watchBodyTheme, { once: true });

  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', scheduleApply);
})();

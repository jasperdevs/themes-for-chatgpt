// Themes for ChatGPT - popup.
// Renders theme cards, the light/dark mode switcher, and persists settings.

(() => {
  const api = (typeof browser !== 'undefined' ? browser : chrome);
  const THEME_KEY = 'selectedTheme';
  const MODE_KEY = 'themeMode';
  const DEFAULTS = { [THEME_KEY]: 'default', [MODE_KEY]: 'auto' };

  const grid = document.getElementById('grid');
  const tpl = document.getElementById('card-template');
  const modeButtons = Array.from(document.querySelectorAll('.mode-option'));

  let state = { ...DEFAULTS };

  function storageGet(keys) {
    try {
      const result = api.storage.sync.get(keys);
      if (result && typeof result.then === 'function') return result;
    } catch (_) {
      // Fall through to callback API.
    }
    return new Promise(resolve => api.storage.sync.get(keys, resolve));
  }

  function storageSet(values) {
    try {
      const result = api.storage.sync.set(values);
      if (result && typeof result.then === 'function') return result;
    } catch (_) {
      // Fall through to callback API.
    }
    return new Promise(resolve => api.storage.sync.set(values, resolve));
  }

  function normalizeMode(mode) {
    return mode === 'light' || mode === 'dark' ? mode : 'auto';
  }

  function renderModes() {
    const selectedMode = normalizeMode(state[MODE_KEY]);
    for (const button of modeButtons) {
      const selected = button.dataset.mode === selectedMode;
      button.classList.toggle('selected', selected);
      button.setAttribute('aria-checked', selected ? 'true' : 'false');
      button.tabIndex = selected ? 0 : -1;
    }
  }

  function renderThemes() {
    const selectedId = state[THEME_KEY] || DEFAULTS[THEME_KEY];
    grid.replaceChildren();

    for (const theme of CHATTHEMES.themes) {
      const node = tpl.content.firstElementChild.cloneNode(true);
      node.dataset.themeId = theme.id;
      node.classList.toggle('selected', theme.id === selectedId);
      node.setAttribute('aria-pressed', theme.id === selectedId ? 'true' : 'false');

      const swatches = node.querySelector('.swatches');
      for (const color of theme.swatches) {
        const s = document.createElement('span');
        s.style.background = color;
        swatches.appendChild(s);
      }

      node.querySelector('.card-name').textContent = theme.name;
      node.querySelector('.card-type').textContent = theme.id === 'default' ? 'Native' : 'Adaptive';
      node.addEventListener('click', () => selectTheme(theme.id));
      grid.appendChild(node);
    }
  }

  function render() {
    renderModes();
    renderThemes();
  }

  function selectTheme(id) {
    state[THEME_KEY] = id;
    storageSet({ [THEME_KEY]: id }).then(render);
  }

  function selectMode(mode) {
    state[MODE_KEY] = normalizeMode(mode);
    storageSet({ [MODE_KEY]: state[MODE_KEY] }).then(renderModes);
  }

  for (const button of modeButtons) {
    button.addEventListener('click', () => selectMode(button.dataset.mode));
    button.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const currentIndex = modeButtons.indexOf(button);
      const lastIndex = modeButtons.length - 1;
      const nextIndex = {
        ArrowLeft: currentIndex === 0 ? lastIndex : currentIndex - 1,
        ArrowRight: currentIndex === lastIndex ? 0 : currentIndex + 1,
        Home: 0,
        End: lastIndex
      }[event.key];
      modeButtons[nextIndex].focus();
      selectMode(modeButtons[nextIndex].dataset.mode);
    });
  }

  storageGet([THEME_KEY, MODE_KEY]).then(result => {
    state = { ...DEFAULTS, ...(result || {}), [MODE_KEY]: normalizeMode(result && result[MODE_KEY]) };
    render();
  });
})();

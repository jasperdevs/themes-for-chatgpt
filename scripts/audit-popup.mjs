import path from 'node:path';
import { createRequire } from 'node:module';
import { chromium } from 'playwright';

const require = createRequire(import.meta.url);
const CHATTHEMES = require('../src/themes.js');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 380, height: 420 } });

await page.addInitScript(() => {
  globalThis.chrome = {
    storage: {
      sync: {
        get: (keys, callback) => callback({ selectedTheme: 'claude', themeMode: 'auto' }),
        set: (values, callback) => callback && callback()
      },
      onChanged: { addListener() {} }
    }
  };
});

await page.goto(`file:///${path.resolve('popup.html').replace(/\\/g, '/')}`, { waitUntil: 'load' });
await page.waitForTimeout(100);

const result = await page.evaluate(() => {
  const cards = [...document.querySelectorAll('.card')];
  const modes = [...document.querySelectorAll('.mode-option')];
  const modeRects = modes.map(el => el.getBoundingClientRect());
  const cardRects = cards.map(el => el.getBoundingClientRect());

  return {
    cardCount: cards.length,
    selectedCard: document.querySelector('.card.selected .card-name')?.textContent,
    selectedMode: document.querySelector('.mode-option.selected')?.dataset.mode,
    minModeHeight: Math.min(...modeRects.map(rect => rect.height)),
    minCardHeight: Math.min(...cardRects.map(rect => rect.height)),
    overflowX: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    missingCardTypes: cards.filter(card => !card.querySelector('.card-type')?.textContent.trim()).length
  };
});

await browser.close();

assert(result.cardCount === CHATTHEMES.themes.length, `popup: expected ${CHATTHEMES.themes.length} cards, got ${result.cardCount}`);
assert(result.selectedCard === 'Claude', `popup: expected Claude selected, got ${result.selectedCard || 'none'}`);
assert(result.selectedMode === 'auto', `popup: expected auto mode selected, got ${result.selectedMode || 'none'}`);
assert(result.minModeHeight >= 40, `popup: mode hit area is ${result.minModeHeight}px`);
assert(result.minCardHeight >= 80, `popup: theme card height is ${result.minCardHeight}px`);
assert(!result.overflowX, 'popup: horizontal overflow detected');
assert(result.missingCardTypes === 0, 'popup: missing card type labels');

console.log('Popup audit passed: layout, selection, hit areas, and overflow');

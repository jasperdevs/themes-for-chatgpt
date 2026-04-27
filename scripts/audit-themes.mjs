import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const CHATTHEMES = require('../src/themes.js');

const REQUIRED_TOKENS = [
  'bg1',
  'bg2',
  'bg3',
  'bg4',
  'text1',
  'text2',
  'text3',
  'accent',
  'accentHover',
  'border',
  'userBubble',
  'codeBg'
];

const REQUIRED_CSS = [
  '.markdown h2',
  '.markdown blockquote',
  '.markdown table',
  '.markdown:has(table)',
  '[data-message-author-role] img',
  '[data-message-author-role] div:has(> img)',
  '[data-message-author-role] [style*="overflow"]:has(img)',
  '[data-testid*="conversation-turn"] [style*="overflow"]:has(img)',
  '[data-testid*="conversation-turn"] [class*="aspect-"]:has(img)',
  '[data-testid*="conversation-turn"] [class*="imagegen"]:has(img) img',
  '.markdown details',
  '.markdown div:has(> pre)',
  '.markdown pre code',
  'pre [class*="sticky"]',
  '[data-message-author-role] button',
  '[data-testid*="sources"]',
  '[aria-label*="Citations"]',
  '[class*="from-token-main-surface-primary"]',
  'nav a',
  'nav svg',
  'form[data-type="unified"]',
  '[data-testid="composer"]',
  'form:has([data-testid*="prompt-textarea"])',
  'form[data-type="unified"] > div',
  '[data-testid="composer"] > div',
  'form[data-type="unified"] button[aria-haspopup]',
  '[data-testid="composer"] button[aria-haspopup]',
  '[data-testid*="prompt-textarea"]',
  'button[aria-label*="Dictate"]',
  '[role="tooltip"] kbd',
  '[data-radix-popper-content-wrapper] > [data-side][data-align]:has(kbd)',
  '[role="menuitem"][aria-checked="true"]',
  '[role="menuitemcheckbox"][aria-checked="true"]',
  '[role="tab"][aria-selected="true"]',
  'main:has([role="tablist"]) h1',
  '[data-testid*="deep-research"]',
  '.text-blue-400',
  '[class*="spinner"]',
  '[data-testid*="thought"]',
  '[class*="bottom"][class*="bg-gradient-to-"]',
  '[data-testid*="conversation-list"]',
  'main [aria-label*="Chats"][role="table"]',
  'main:has(input[placeholder*="Search library"]) [role="table"]',
  'main a[href*="/reports"]',
  '[role="switch"][aria-checked="true"]',
  '[aria-label*="Scroll to bottom"]',
  '[data-testid*="attachment"]',
  '[class*="file-preview"]',
  '[role="combobox"]',
  '[role="switch"]',
  '[role="dialog"]'
];

const FORBIDDEN_CSS = [
  { pattern: /\na\s*\{/, label: 'global anchor color rule' },
  { pattern: /\[class\*="file"\]/, label: 'over-broad file class selector' },
  { pattern: /\[class\*="rounded"\]/, label: 'over-broad rounded class selector' },
  { pattern: /\[data-message-author-role\]\s+a\s*\{/, label: 'over-broad message anchor selector' },
  { pattern: /\[data-message-author-role\]\s+a:hover\s*\{/, label: 'over-broad message anchor hover selector' },
  { pattern: /\[class\*="composer"\]/, label: 'over-broad composer class selector' },
  { pattern: /\[role="status"\]/, label: 'generic status role styling' },
  { pattern: /\[role="alert"\]/, label: 'generic alert role styling' },
  { pattern: /\n\s*\[class\*="from-transparent"\]\s*,/, label: 'broad transparent gradient selector' },
  { pattern: /\n\s*\[class\*="to-transparent"\]\s*\{/, label: 'broad transparent gradient selector' }
];

function hexToRgb(hex) {
  const value = hex.replace('#', '');
  const full = value.length === 3 ? value.split('').map(x => x + x).join('') : value;
  const parsed = Number.parseInt(full, 16);
  return {
    r: (parsed >> 16) & 255,
    g: (parsed >> 8) & 255,
    b: parsed & 255
  };
}

function channel(value) {
  const normalized = value / 255;
  return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
}

function luminance(hex) {
  const { r, g, b } = hexToRgb(hex);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrast(foreground, background) {
  const lighter = Math.max(luminance(foreground), luminance(background));
  const darker = Math.min(luminance(foreground), luminance(background));
  return (lighter + 0.05) / (darker + 0.05);
}

const failures = [];

for (const theme of CHATTHEMES.themes) {
  if (theme.id === 'default') continue;

  for (const mode of ['light', 'dark']) {
    const scheme = theme.schemes && theme.schemes[mode];
    if (!scheme) {
      failures.push(`${theme.id}/${mode}: missing scheme`);
      continue;
    }

    for (const token of REQUIRED_TOKENS) {
      if (!scheme[token]) failures.push(`${theme.id}/${mode}: missing ${token}`);
    }

    const textContrast = contrast(scheme.text1, scheme.bg1);
    if (textContrast < 4.5) {
      failures.push(`${theme.id}/${mode}: text1 on bg1 contrast ${textContrast.toFixed(2)} < 4.5`);
    }

    const softTextContrast = contrast(scheme.text2, scheme.bg1);
    if (softTextContrast < 3) {
      failures.push(`${theme.id}/${mode}: text2 on bg1 contrast ${softTextContrast.toFixed(2)} < 3`);
    }

    const onAccent = contrast('#111111', scheme.accent) >= contrast('#ffffff', scheme.accent)
      ? '#111111'
      : '#ffffff';
    const accentContrast = contrast(onAccent, scheme.accent);
    if (accentContrast < 4.5) {
      failures.push(`${theme.id}/${mode}: on-accent contrast ${accentContrast.toFixed(2)} < 4.5`);
    }

    const css = CHATTHEMES.buildCSS(theme, mode);
    for (const selector of REQUIRED_CSS) {
      if (!css.includes(selector)) failures.push(`${theme.id}/${mode}: generated CSS missing ${selector}`);
    }

    for (const forbidden of FORBIDDEN_CSS) {
      if (forbidden.pattern.test(css)) {
        failures.push(`${theme.id}/${mode}: generated CSS contains ${forbidden.label}`);
      }
    }
  }
}

const defaultCss = CHATTHEMES.buildCSS(CHATTHEMES.themes.find(theme => theme.id === 'default'), 'dark');
if (defaultCss !== '') failures.push('default: generated CSS must stay empty/no-op');

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

const checkedThemes = CHATTHEMES.themes.filter(theme => theme.id !== 'default').length;
console.log(`Theme audit passed: ${checkedThemes} adaptive themes x 2 modes`);

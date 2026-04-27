import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const cdpUrl = process.env.CHATTHEMES_CDP_URL || 'http://127.0.0.1:9222';
const outputDir = path.resolve('dom-scans');

function safeTokenList(value) {
  return String(value || '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 80);
}

function summarize(items, key) {
  const counts = new Map();
  for (const item of items) {
    const value = item[key];
    if (!value) continue;
    if (Array.isArray(value)) {
      for (const entry of value) counts.set(entry, (counts.get(entry) || 0) + 1);
    } else {
      counts.set(value, (counts.get(value) || 0) + 1);
    }
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 200)
    .map(([value, count]) => ({ value, count }));
}

async function connect() {
  try {
    const browser = await chromium.connectOverCDP(cdpUrl);
    return { browser, connected: true };
  } catch (error) {
    throw new Error(
      `Could not connect to ${cdpUrl}. Start Chrome/Edge with --remote-debugging-port=9222, open ChatGPT, then rerun this script.`
    );
  }
}

const { browser } = await connect();
const contexts = browser.contexts();
const pages = contexts.flatMap(context => context.pages());
const page = pages.find(candidate => /https:\/\/(chatgpt|chat\.openai)\.com\//.test(candidate.url()));

if (!page) {
  await browser.close();
  throw new Error('No open ChatGPT tab found in the connected debug browser.');
}

const scan = await page.evaluate(() => {
  const elements = [...document.querySelectorAll('*')];
  const transparent = color => !color || color === 'transparent' || color === 'rgba(0, 0, 0, 0)';
  const parseRgb = color => {
    const match = color && color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
    return match ? [Number(match[1]), Number(match[2]), Number(match[3])] : null;
  };
  const channel = value => {
    const normalized = value / 255;
    return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
  };
  const luminance = color => {
    const rgb = parseRgb(color);
    if (!rgb) return null;
    return 0.2126 * channel(rgb[0]) + 0.7152 * channel(rgb[1]) + 0.0722 * channel(rgb[2]);
  };
  const contrastRatio = (fg, bg) => {
    const a = luminance(fg);
    const b = luminance(bg);
    if (a === null || b === null) return null;
    const lighter = Math.max(a, b);
    const darker = Math.min(a, b);
    return (lighter + 0.05) / (darker + 0.05);
  };
  const closestBackground = el => {
    let current = el;
    while (current) {
      const color = getComputedStyle(current).backgroundColor;
      if (!transparent(color)) return color;
      current = current.parentElement;
    }
    return getComputedStyle(document.body).backgroundColor;
  };
  const elementSummary = (el, index) => {
    const rect = el.getBoundingClientRect();
    const style = getComputedStyle(el);
    const attrs = {};
    for (const attr of el.getAttributeNames()) {
      if (
        attr === 'role' ||
        attr === 'class' ||
        attr === 'id' ||
        attr.startsWith('data-') ||
        attr.startsWith('aria-')
      ) {
        attrs[attr] = el.getAttribute(attr);
      }
    }
    return {
      index,
      tag: el.tagName.toLowerCase(),
      id: el.id || '',
      role: el.getAttribute('role') || '',
      testid: el.getAttribute('data-testid') || '',
      aria: el.getAttribute('aria-label') || '',
      classes: String(el.className || '').split(/\s+/).filter(Boolean).slice(0, 80),
      attrs,
      text: (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 120),
      rect: {
        x: Math.round(rect.x),
        y: Math.round(rect.y),
        width: Math.round(rect.width),
        height: Math.round(rect.height)
      },
      visible: rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none',
      style: {
        display: style.display,
        position: style.position,
        backgroundColor: style.backgroundColor,
        color: style.color,
        borderColor: style.borderColor,
        borderRadius: style.borderRadius,
        overflow: style.overflow,
        overflowX: style.overflowX,
        overflowY: style.overflowY,
        zIndex: style.zIndex
      },
      layout: {
        clientWidth: el.clientWidth,
        clientHeight: el.clientHeight,
        scrollWidth: el.scrollWidth,
        scrollHeight: el.scrollHeight
      }
    };
  };
  const summaries = elements.map(elementSummary);
  const issues = {
    clipped: [],
    lowContrastText: [],
    transparentSurfaces: []
  };

  for (let index = 0; index < elements.length; index += 1) {
    const el = elements[index];
    const item = summaries[index];
    if (!item.visible) continue;

    const style = getComputedStyle(el);
    const clipsContent =
      (style.overflow !== 'visible' || style.overflowX !== 'visible' || style.overflowY !== 'visible') &&
      (el.scrollHeight > el.clientHeight + 3 || el.scrollWidth > el.clientWidth + 3) &&
      item.rect.width > 12 &&
      item.rect.height > 8;
    if (clipsContent) issues.clipped.push(item);

    const text = (el.textContent || '').trim();
    if (text && item.rect.width > 12 && item.rect.height > 8) {
      const ratio = contrastRatio(style.color, closestBackground(el));
      if (ratio !== null && ratio < 3) issues.lowContrastText.push({ ...item, contrast: Number(ratio.toFixed(2)) });
    }

    const surfaceLike =
      /dialog|menu|listbox|option|tab|table|grid|row|button|textbox|combobox/i.test(item.role) ||
      /composer|prompt|conversation|chat|project|menu|dialog|popover|tooltip|toast|attachment|file/i.test(item.testid) ||
      /Send|Attach|Dictate|Voice|Microphone|Search|New chat|Share|Sources/i.test(item.aria);
    if (surfaceLike && transparent(style.backgroundColor) && item.rect.width > 16 && item.rect.height > 12) {
      issues.transparentSurfaces.push(item);
    }
  }

  return {
    url: location.href,
    title: document.title,
    htmlClass: document.documentElement.className,
    bodyClass: document.body.className,
    count: elements.length,
    viewport: { width: innerWidth, height: innerHeight },
    elements: summaries,
    issues
  };
});

await browser.close();

fs.mkdirSync(outputDir, { recursive: true });
const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
const jsonPath = path.join(outputDir, `chatgpt-dom-${stamp}.json`);
const mdPath = path.join(outputDir, `chatgpt-dom-${stamp}.md`);

const summary = {
  roles: summarize(scan.elements, 'role'),
  testids: summarize(scan.elements, 'testid'),
  ariaLabels: summarize(scan.elements, 'aria'),
  classTokens: summarize(scan.elements, 'classes')
};

fs.writeFileSync(jsonPath, JSON.stringify({ scan, summary }, null, 2));
fs.writeFileSync(
  mdPath,
  [
    '# ChatGPT DOM Scan',
    '',
    `- URL: ${scan.url}`,
    `- Title: ${scan.title}`,
    `- Elements: ${scan.count}`,
    `- Viewport: ${scan.viewport.width}x${scan.viewport.height}`,
    `- Clipped candidates: ${scan.issues.clipped.length}`,
    `- Low-contrast text candidates: ${scan.issues.lowContrastText.length}`,
    `- Transparent surface candidates: ${scan.issues.transparentSurfaces.length}`,
    '',
    '## Top Roles',
    ...summary.roles.slice(0, 40).map(item => `- ${item.value}: ${item.count}`),
    '',
    '## Top data-testid Values',
    ...summary.testids.slice(0, 80).map(item => `- ${item.value}: ${item.count}`),
    '',
    '## Top aria-label Values',
    ...summary.ariaLabels.slice(0, 80).map(item => `- ${item.value}: ${item.count}`),
    '',
    '## Top Class Tokens',
    ...summary.classTokens.slice(0, 120).map(item => `- ${item.value}: ${item.count}`),
    '',
    '## Clipped Candidates',
    ...scan.issues.clipped.slice(0, 50).map(item => `- #${item.index} ${item.tag}${item.id ? `#${item.id}` : ''} role=${item.role || '-'} testid=${item.testid || '-'} overflow=${item.style.overflow} rect=${item.rect.width}x${item.rect.height} scroll=${item.layout.scrollWidth}x${item.layout.scrollHeight} text="${item.text}"`),
    '',
    '## Low Contrast Text Candidates',
    ...scan.issues.lowContrastText.slice(0, 50).map(item => `- #${item.index} ${item.tag}${item.id ? `#${item.id}` : ''} role=${item.role || '-'} testid=${item.testid || '-'} contrast=${item.contrast} fg=${item.style.color} bg=${item.style.backgroundColor} text="${item.text}"`),
    '',
    '## Transparent Surface Candidates',
    ...scan.issues.transparentSurfaces.slice(0, 50).map(item => `- #${item.index} ${item.tag}${item.id ? `#${item.id}` : ''} role=${item.role || '-'} testid=${item.testid || '-'} aria="${item.aria}" rect=${item.rect.width}x${item.rect.height} text="${item.text}"`),
    ''
  ].join('\n')
);

console.log(`Wrote ${jsonPath}`);
console.log(`Wrote ${mdPath}`);

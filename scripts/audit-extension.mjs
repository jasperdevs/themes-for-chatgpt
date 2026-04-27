import fs from 'node:fs';

const failures = [];

const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));
const popupHtml = fs.readFileSync('popup.html', 'utf8');
const popupJs = fs.readFileSync('popup.js', 'utf8');
const contentJs = fs.readFileSync('src/content.js', 'utf8');

function requireCondition(condition, message) {
  if (!condition) failures.push(message);
}

requireCondition(manifest.manifest_version === 3, 'manifest: must use MV3');
requireCondition(JSON.stringify(manifest.permissions || []) === JSON.stringify(['storage']), 'manifest: permissions must stay storage-only');
requireCondition((manifest.host_permissions || []).includes('https://chatgpt.com/*'), 'manifest: missing chatgpt.com host permission');
requireCondition((manifest.host_permissions || []).includes('https://chat.openai.com/*'), 'manifest: missing chat.openai.com host permission');

const contentScript = manifest.content_scripts && manifest.content_scripts[0];
requireCondition(Boolean(contentScript), 'manifest: missing content script');
requireCondition(contentScript.run_at === 'document_start', 'manifest: content script must run at document_start');
requireCondition(contentScript.all_frames === false, 'manifest: content script must stay top-frame only');
requireCondition(JSON.stringify(contentScript.js) === JSON.stringify(['src/themes.js', 'src/content.js']), 'manifest: content scripts must load themes before content');

for (const mode of ['auto', 'light', 'dark']) {
  requireCondition(popupHtml.includes(`data-mode="${mode}"`), `popup: missing ${mode} mode button`);
}

requireCondition(popupJs.includes("const THEME_KEY = 'selectedTheme'"), 'popup: missing selectedTheme storage key');
requireCondition(popupJs.includes("const MODE_KEY = 'themeMode'"), 'popup: missing themeMode storage key');
requireCondition(popupJs.includes('aria-checked'), 'popup: mode buttons need radio checked state');
requireCondition(popupJs.includes('aria-pressed'), 'popup: theme cards need pressed state');

requireCondition(contentJs.includes("const THEME_KEY = 'selectedTheme'"), 'content: missing selectedTheme storage key');
requireCondition(contentJs.includes("const MODE_KEY = 'themeMode'"), 'content: missing themeMode storage key');
requireCondition(contentJs.includes("const RESOLVED_MODE_KEY = 'resolvedMode'"), 'content: missing cached resolved mode key');
requireCondition(contentJs.includes('detectChatGptMode'), 'content: missing ChatGPT mode detection');
requireCondition(contentJs.includes('MutationObserver'), 'content: missing style/root observer');
requireCondition(contentJs.includes('watchBodyTheme'), 'content: missing body-level theme observer');
requireCondition(contentJs.includes('data-chattheme-mode'), 'content: missing resolved mode marker');
requireCondition(contentJs.includes('moveStyleIntoHead'), 'content: missing early style head migration');

const cachedApplyIndex = contentJs.indexOf('const cachedState = readCachedState();');
const storageLoadIndex = contentJs.indexOf('storageGet([THEME_KEY, MODE_KEY])');
requireCondition(cachedApplyIndex >= 0 && storageLoadIndex >= 0 && cachedApplyIndex < storageLoadIndex, 'content: cached theme must apply before async storage read');

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log('Extension audit passed: manifest, popup, and content wiring');

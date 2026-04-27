import fs from 'node:fs';
import path from 'node:path';

const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));
const artifact = path.join('web-ext-artifacts', `themes_for_chatgpt-${manifest.version}.zip`);
const allowed = new Set([
  'manifest.json',
  'popup.html',
  'popup.css',
  'popup.js',
  'src/themes.js',
  'src/content.js',
  'icons/icon.svg',
  'icons/icon-16.png',
  'icons/icon-32.png',
  'icons/icon-48.png',
  'icons/icon-128.png'
]);

function readZipEntries(filePath) {
  const data = fs.readFileSync(filePath);
  let eocd = -1;
  for (let index = data.length - 22; index >= 0; index -= 1) {
    if (data.readUInt32LE(index) === 0x06054b50) {
      eocd = index;
      break;
    }
  }
  if (eocd < 0) throw new Error(`Could not read ZIP end record: ${filePath}`);

  const entryCount = data.readUInt16LE(eocd + 10);
  let offset = data.readUInt32LE(eocd + 16);
  const entries = [];

  for (let index = 0; index < entryCount; index += 1) {
    if (data.readUInt32LE(offset) !== 0x02014b50) {
      throw new Error(`Could not read ZIP central directory at offset ${offset}`);
    }
    const nameLength = data.readUInt16LE(offset + 28);
    const extraLength = data.readUInt16LE(offset + 30);
    const commentLength = data.readUInt16LE(offset + 32);
    const name = data.subarray(offset + 46, offset + 46 + nameLength).toString('utf8');
    entries.push(name);
    offset += 46 + nameLength + extraLength + commentLength;
  }

  return entries.sort();
}

if (!fs.existsSync(artifact)) {
  throw new Error(`Package artifact missing: ${artifact}`);
}

const entries = readZipEntries(artifact).filter(entry => !entry.endsWith('/'));
const unexpected = entries.filter(entry => !allowed.has(entry));
const missing = [...allowed].filter(entry => !entries.includes(entry));

if (unexpected.length || missing.length) {
  if (unexpected.length) console.error(`Unexpected packaged files:\n${unexpected.join('\n')}`);
  if (missing.length) console.error(`Missing packaged files:\n${missing.join('\n')}`);
  process.exit(1);
}

console.log(`Package audit passed: ${entries.length} extension files`);

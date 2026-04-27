// web-ext config — auto-reload extension in Zen on file changes.
// Run: npm run dev

module.exports = {
  sourceDir: __dirname,
  artifactsDir: __dirname + '/web-ext-artifacts',
  ignoreFiles: [
    'node_modules',
    'scripts',
    'package.json',
    'package-lock.json',
    'web-ext-artifacts',
    'web-ext-config.cjs',
    '.github',
    'README.md',
    'LICENSE',
    'docs'
  ],
  run: {
    target: ['firefox-desktop'],
    firefox: 'C:\\Program Files\\Zen Browser\\zen.exe',
    firefoxProfile: process.env.APPDATA + '\\zen\\Profiles\\x0lzpkzv.Default (release)',
    keepProfileChanges: true,
    startUrl: ['https://chatgpt.com'],
    browserConsole: false
  },
  build: {
    overwriteDest: true
  }
};

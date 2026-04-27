// Themes for ChatGPT - preset palettes and a conservative CSS builder.
// The content script picks the light or dark scheme from ChatGPT's current mode
// unless the user overrides it in the popup.

const CHATTHEMES = (() => {
  const themes = [
    {
      id: 'default',
      name: 'Default',
      type: 'system',
      swatches: ['#212121', '#f7f7f8', '#10a37f', '#ececf1']
    },
    {
      id: 'claude',
      name: 'Claude',
      type: 'adaptive',
      swatches: ['#faf9f5', '#e8e6dc', '#141413', '#d97757'],
      schemes: {
        light: {
          bg1: '#faf9f5',
          bg2: '#f2f0e8',
          bg3: '#e8e6dc',
          bg4: '#d7d3c5',
          text1: '#141413',
          text2: '#4f4f4b',
          text3: '#76736a',
          accent: '#d97757',
          accentHover: '#c76342',
          border: 'rgba(20, 20, 19, 0.14)',
          userBubble: '#e8e6dc',
          codeBg: '#e4e1d6'
        },
        dark: {
          bg1: '#141413',
          bg2: '#1d1c1a',
          bg3: '#292722',
          bg4: '#3b382f',
          text1: '#faf9f5',
          text2: '#d8d5ca',
          text3: '#b0aea5',
          accent: '#d97757',
          accentHover: '#e58b70',
          border: 'rgba(250, 249, 245, 0.14)',
          userBubble: '#2e2b24',
          codeBg: '#24221f'
        }
      },
      fonts: {
        ui: '-apple-system, BlinkMacSystemFont, "Segoe UI", Inter, Arial, system-ui, sans-serif',
        body: '"Anthropic Serif", Lora, Georgia, "Times New Roman", serif',
        heading: '"Anthropic Serif", Lora, Georgia, "Times New Roman", serif',
        mono: '"JetBrains Mono", "SF Mono", "Cascadia Code", monospace'
      },
      radii: { card: '12px', button: '10px', input: '12px', message: '16px', chip: '8px' },
      tweaks: { bodyLineHeight: '1.6', headingWeight: '600', strongWeight: '600', tableHeaderWeight: '600' }
    },
    {
      id: 'gemini',
      name: 'Gemini',
      type: 'adaptive',
      swatches: ['#ffffff', '#f1f3f4', '#1f1f1f', '#8ab4f8'],
      schemes: {
        light: {
          bg1: '#ffffff',
          bg2: '#f8fafd',
          bg3: '#f1f3f4',
          bg4: '#e8eaed',
          text1: '#1f1f1f',
          text2: '#3c4043',
          text3: '#5f6368',
          accent: '#1a73e8',
          accentHover: '#1558b0',
          border: 'rgba(60, 64, 67, 0.16)',
          userBubble: '#d3e3fd',
          codeBg: '#eef3fb'
        },
        dark: {
          bg1: '#1f1f1f',
          bg2: '#282a2c',
          bg3: '#303134',
          bg4: '#3c4043',
          text1: '#e8eaed',
          text2: '#c4c7c5',
          text3: '#9aa0a6',
          accent: '#8ab4f8',
          accentHover: '#aecbfa',
          border: 'rgba(232, 234, 237, 0.14)',
          userBubble: '#1a3258',
          codeBg: '#242628'
        }
      },
      fonts: {
        ui: '"Google Sans Text", "Google Sans", Roboto, Arial, system-ui, sans-serif',
        body: '"Google Sans Text", "Google Sans", Roboto, Arial, system-ui, sans-serif',
        heading: '"Google Sans Display", "Google Sans", Roboto, Arial, system-ui, sans-serif',
        mono: '"Roboto Mono", "SF Mono", "Cascadia Code", monospace'
      },
      radii: { card: '24px', button: '9999px', input: '24px', message: '22px', chip: '9999px' },
      tweaks: { bodyLineHeight: '1.5', headingWeight: '500' }
    },
    {
      id: 'perplexity',
      name: 'Perplexity',
      type: 'adaptive',
      swatches: ['#fbfaf4', '#e8f0ed', '#091717', '#21808d'],
      schemes: {
        light: {
          bg1: '#fbfaf4',
          bg2: '#f1f4ef',
          bg3: '#e2ebe8',
          bg4: '#cddbd8',
          text1: '#091717',
          text2: '#243d3d',
          text3: '#59706e',
          accent: '#21808d',
          accentHover: '#176774',
          border: 'rgba(9, 23, 23, 0.14)',
          userBubble: '#dce9e6',
          codeBg: '#e7eeeb'
        },
        dark: {
          bg1: '#091717',
          bg2: '#0e1c1d',
          bg3: '#163030',
          bg4: '#1f3e3e',
          text1: '#fbfaf4',
          text2: '#c8d3d0',
          text3: '#8ba09d',
          accent: '#21808d',
          accentHover: '#2c9cab',
          border: 'rgba(251, 250, 244, 0.14)',
          userBubble: '#123132',
          codeBg: '#0d2425'
        }
      },
      fonts: {
        ui: 'pplxSans, Inter, system-ui, sans-serif',
        body: 'pplxSans, "Space Grotesk", Inter, system-ui, sans-serif',
        heading: 'pplxSans, "Space Grotesk", Inter, system-ui, sans-serif',
        mono: '"Berkeley Mono", "IBM Plex Mono", "SF Mono", "Cascadia Code", monospace'
      },
      radii: { card: '12px', button: '8px', input: '10px', message: '14px', chip: '8px' },
      tweaks: { bodyLineHeight: '1.55', headingWeight: '600' }
    }
  ];

  function hexToRgb(hex) {
    const value = hex.replace('#', '');
    const bigint = parseInt(value.length === 3 ? value.split('').map(x => x + x).join('') : value, 16);
    return {
      r: (bigint >> 16) & 255,
      g: (bigint >> 8) & 255,
      b: bigint & 255
    };
  }

  function readableTextOn(hex) {
    const blackContrast = contrastRatio('#111111', hex);
    const whiteContrast = contrastRatio('#ffffff', hex);
    return blackContrast >= whiteContrast ? '#111111' : '#ffffff';
  }

  function alpha(hex, amount) {
    const { r, g, b } = hexToRgb(hex);
    return `rgba(${r}, ${g}, ${b}, ${amount})`;
  }

  function linearChannel(value) {
    const normalized = value / 255;
    return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
  }

  function relativeLuminance(hex) {
    const { r, g, b } = hexToRgb(hex);
    return 0.2126 * linearChannel(r) + 0.7152 * linearChannel(g) + 0.0722 * linearChannel(b);
  }

  function contrastRatio(foreground, background) {
    const lighter = Math.max(relativeLuminance(foreground), relativeLuminance(background));
    const darker = Math.min(relativeLuminance(foreground), relativeLuminance(background));
    return (lighter + 0.05) / (darker + 0.05);
  }

  function resolveScheme(theme, mode) {
    if (!theme.schemes) return null;
    return theme.schemes[mode === 'light' ? 'light' : 'dark'];
  }

  function buildCSS(theme, mode = 'dark') {
    const c = resolveScheme(theme, mode);
    if (!c) return '';

    const f = theme.fonts;
    const r = theme.radii;
    const tw = theme.tweaks || {};
    const isDark = mode !== 'light';
    const onAccent = readableTextOn(c.accent);
    const accentSoft = alpha(c.accent, isDark ? 0.28 : 0.18);
    const surfaceSoft = alpha(c.bg4, isDark ? 0.42 : 0.32);
    const surfaceOverlay = alpha(c.bg1, isDark ? 0.92 : 0.9);
    const uiFont = f.ui || '-apple-system, BlinkMacSystemFont, "Segoe UI", Inter, Arial, system-ui, sans-serif';
    const bodyWeight = tw.bodyWeight || '400';
    const strongWeight = tw.strongWeight || '650';
    const tableHeaderWeight = tw.tableHeaderWeight || '600';

    return `
      :root,
      html,
      html.dark,
      html.light,
      html[data-theme],
      body {
        --ct-bg-primary: ${c.bg1};
        --ct-bg-secondary: ${c.bg2};
        --ct-bg-tertiary: ${c.bg3};
        --ct-bg-quaternary: ${c.bg4};
        --ct-text-primary: ${c.text1};
        --ct-text-secondary: ${c.text2};
        --ct-text-tertiary: ${c.text3};
        --ct-accent: ${c.accent};
        --ct-accent-hover: ${c.accentHover};
        --ct-border: ${c.border};
        --ct-user-bubble: ${c.userBubble};
        --ct-on-accent: ${onAccent};

        --main-surface-primary: ${c.bg1} !important;
        --main-surface-secondary: ${c.bg2} !important;
        --main-surface-tertiary: ${c.bg3} !important;
        --surface-primary: ${c.bg1} !important;
        --surface-secondary: ${c.bg2} !important;
        --surface-tertiary: ${c.bg3} !important;
        --surface-chat: ${c.bg1} !important;
        --surface-elevated: ${c.bg2} !important;
        --surface-fill-primary: ${c.bg2} !important;
        --surface-fill-secondary: ${c.bg3} !important;
        --surface-fill-tertiary: ${c.bg4} !important;
        --sidebar-surface-primary: ${c.bg2} !important;
        --sidebar-surface-secondary: ${c.bg3} !important;
        --sidebar-surface-tertiary: ${c.bg3} !important;
        --composer-surface-primary: ${c.bg2} !important;
        --composer-surface-secondary: ${c.bg3} !important;
        --composer-bg: ${c.bg2} !important;
        --bg-primary: ${c.bg1} !important;
        --bg-secondary: ${c.bg2} !important;
        --bg-tertiary: ${c.bg3} !important;
        --bg-elevated-primary: ${c.bg2} !important;
        --bg-elevated-secondary: ${c.bg3} !important;
        --message-surface: ${c.userBubble} !important;
        --message-surface-primary: ${c.userBubble} !important;
        --message-bg: ${c.userBubble} !important;

        --text-primary: ${c.text1} !important;
        --text-secondary: ${c.text2} !important;
        --text-tertiary: ${c.text3} !important;
        --text-quaternary: ${c.text3} !important;
        --token-text-primary: ${c.text1} !important;
        --token-text-secondary: ${c.text2} !important;
        --token-text-tertiary: ${c.text3} !important;
        --text-on-accent: ${onAccent} !important;

        --border-light: ${c.border} !important;
        --border-medium: ${c.border} !important;
        --border-heavy: ${c.border} !important;
        --border-default: ${c.border} !important;
        --border-sharp: ${c.border} !important;
        --border-xlight: ${c.border} !important;

        --link: ${c.accent} !important;
        --link-hover: ${c.accentHover} !important;
        --brand-purple: ${c.accent} !important;
        --interactive-bg-accent-primary: ${c.accent} !important;
        --interactive-bg-accent-primary-hover: ${c.accentHover} !important;
        --interactive-bg-secondary: ${c.bg3} !important;
        --interactive-bg-secondary-hover: ${c.bg4} !important;

        --icon-primary: ${c.text1} !important;
        --icon-secondary: ${c.text2} !important;
        --icon-tertiary: ${c.text3} !important;

        color-scheme: ${isDark ? 'dark' : 'light'};
        accent-color: ${c.accent} !important;
        -webkit-font-smoothing: antialiased;
        text-rendering: optimizeLegibility;
      }

      html,
      body,
      #__next,
      main,
      [role="main"] {
        background-color: ${c.bg1} !important;
        color: ${c.text1} !important;
        font-family: ${uiFont} !important;
        line-height: ${tw.bodyLineHeight || '1.5'} !important;
      }

      h1,
      [data-testid*="welcome"] h1,
      main h1 {
        font-family: ${f.heading} !important;
        font-weight: ${tw.headingWeight || '600'} !important;
      }

      .markdown,
      .prose,
      [data-message-author-role] {
        font-family: ${f.body} !important;
        font-weight: ${bodyWeight} !important;
      }

      .markdown,
      .prose {
        color: ${c.text1} !important;
        overflow-wrap: anywhere !important;
        word-break: normal !important;
      }

      .markdown *,
      .prose * {
        border-color: ${c.border} !important;
      }

      .markdown h1,
      .markdown h2,
      .markdown h3,
      .markdown h4,
      .markdown h5,
      .markdown h6,
      .prose h1,
      .prose h2,
      .prose h3,
      .prose h4,
      .prose h5,
      .prose h6 {
        color: ${c.text1} !important;
        font-family: ${f.heading} !important;
        font-weight: ${tw.headingWeight || '600'} !important;
        letter-spacing: 0 !important;
        line-height: 1.22 !important;
      }

      .markdown h1,
      .prose h1 {
        font-size: 1.5em !important;
      }

      .markdown h2,
      .prose h2 {
        font-size: 1.28em !important;
        margin-top: 1.15em !important;
        margin-bottom: 0.45em !important;
      }

      .markdown h3,
      .prose h3 {
        font-size: 1.12em !important;
        margin-top: 1em !important;
        margin-bottom: 0.35em !important;
      }

      .markdown h4,
      .prose h4 {
        font-size: 1.04em !important;
        margin-top: 0.9em !important;
        margin-bottom: 0.3em !important;
      }

      .markdown h5,
      .markdown h6,
      .prose h5,
      .prose h6 {
        font-size: 0.96em !important;
        margin-top: 0.85em !important;
        margin-bottom: 0.25em !important;
      }

      .markdown p,
      .prose p,
      .markdown li,
      .prose li {
        color: ${c.text1} !important;
        line-height: ${tw.bodyLineHeight || '1.55'} !important;
        font-weight: ${bodyWeight} !important;
        text-wrap: pretty !important;
      }

      .markdown p,
      .prose p {
        margin-top: 0.65em !important;
        margin-bottom: 0.65em !important;
      }

      .markdown strong,
      .prose strong {
        color: ${c.text1} !important;
        font-weight: ${strongWeight} !important;
      }

      .markdown em,
      .prose em {
        color: ${c.text2} !important;
      }

      .markdown ul,
      .markdown ol,
      .prose ul,
      .prose ol {
        padding-left: 1.35em !important;
      }

      .markdown li::marker,
      .prose li::marker {
        color: ${c.accent} !important;
      }

      .markdown blockquote,
      .prose blockquote {
        margin: 1em 0 !important;
        padding: 0.1em 0 0.1em 1em !important;
        color: ${c.text2} !important;
        border-left: 4px solid ${c.accent} !important;
        background: transparent !important;
      }

      .markdown blockquote p,
      .prose blockquote p {
        color: ${c.text2} !important;
      }

      .markdown hr,
      .prose hr {
        border-color: ${c.border} !important;
      }

      .markdown table,
      .prose table {
        display: table !important;
        width: auto !important;
        min-width: 0 !important;
        max-width: 100% !important;
        table-layout: auto !important;
        border-collapse: separate !important;
        border-spacing: 0 !important;
        overflow: hidden !important;
        background-color: ${c.bg2} !important;
        border: 1px solid ${c.border} !important;
        border-radius: ${r.card} !important;
      }

      .markdown:has(table),
      .prose:has(table) {
        overflow-x: auto !important;
      }

      .markdown th,
      .prose th {
        background-color: ${c.bg3} !important;
        color: ${c.text1} !important;
        font-weight: ${tableHeaderWeight} !important;
        padding: 0.65em 0.85em !important;
      }

      .markdown td,
      .prose td {
        color: ${c.text1} !important;
        font-weight: ${bodyWeight} !important;
        padding: 0.65em 0.85em !important;
        vertical-align: top !important;
      }

      .markdown sup,
      .markdown sub,
      .prose sup,
      .prose sub {
        color: ${c.text2} !important;
      }

      .markdown mark,
      .prose mark {
        color: ${c.text1} !important;
        background-color: ${accentSoft} !important;
        border-radius: 4px !important;
      }

      .markdown details,
      .prose details {
        background-color: ${c.bg2} !important;
        border: 1px solid ${c.border} !important;
        border-radius: ${r.card} !important;
        color: ${c.text1} !important;
        padding: 0.75em 1em !important;
      }

      .markdown summary,
      .prose summary {
        color: ${c.text1} !important;
      }

      .markdown img,
      .prose img,
      [data-message-author-role] img,
      [data-message-author-role] picture,
      .markdown video,
      .prose video,
      [data-message-author-role] video,
      [data-message-author-role] canvas {
        display: block !important;
        max-width: 100% !important;
        height: auto !important;
        max-height: none !important;
        object-fit: contain !important;
        border-radius: ${r.card} !important;
        border: 1px solid ${c.border} !important;
        clip-path: none !important;
      }

      [data-message-author-role] a:has(> img),
      [data-message-author-role] div:has(> img),
      [data-message-author-role] span:has(> img),
      [data-message-author-role] button:has(> img),
      [data-message-author-role] figure:has(img),
      [data-message-author-role] [style*="overflow"]:has(img),
      [data-message-author-role] [class*="overflow-hidden"]:has(img),
      [data-message-author-role] [class*="max-h-"]:has(img) {
        overflow: visible !important;
        max-height: none !important;
        height: auto !important;
        clip-path: none !important;
      }

      pre,
      code,
      kbd,
      samp,
      .hljs,
      [class*="language-"],
      [class*="font-mono"] {
        font-family: ${f.mono} !important;
      }

      .bg-token-main-surface-primary,
      [class*="bg-token-main-surface-primary"] { background-color: ${c.bg1} !important; }
      .bg-token-main-surface-secondary,
      [class*="bg-token-main-surface-secondary"] { background-color: ${c.bg2} !important; }
      .bg-token-main-surface-tertiary,
      [class*="bg-token-main-surface-tertiary"] { background-color: ${c.bg3} !important; }
      .bg-token-sidebar-surface-primary { background-color: ${c.bg2} !important; }
      .bg-token-sidebar-surface-secondary,
      .bg-token-sidebar-surface-tertiary { background-color: ${c.bg3} !important; }
      .bg-token-message-surface { background-color: ${c.userBubble} !important; }
      .bg-token-surface-primary { background-color: ${c.bg1} !important; }
      .bg-token-surface-secondary { background-color: ${c.bg2} !important; }
      .bg-token-surface-tertiary { background-color: ${c.bg3} !important; }
      .bg-token-bg-elevated-primary { background-color: ${c.bg2} !important; }
      .bg-token-bg-elevated-secondary { background-color: ${c.bg3} !important; }

      .text-token-text-primary { color: ${c.text1} !important; }
      .text-token-text-secondary { color: ${c.text2} !important; }
      .text-token-text-tertiary,
      .text-token-text-quaternary { color: ${c.text3} !important; }

      .border-token-border-light,
      .border-token-border-medium,
      .border-token-border-heavy,
      .border-token-border-default,
      .border-token-border-sharp,
      .divide-token-border-light > * + * { border-color: ${c.border} !important; }

      nav,
      aside,
      [class*="sidebar"],
      [data-testid*="sidebar"] {
        background-color: ${c.bg2} !important;
        color: ${c.text1} !important;
        font-family: ${uiFont} !important;
      }

      nav a,
      aside a,
      [class*="sidebar"] a,
      [data-testid*="sidebar"] a,
      nav button,
      aside button,
      [class*="sidebar"] button,
      [data-testid*="sidebar"] button {
        background-color: transparent !important;
        color: ${c.text2} !important;
        font-family: ${uiFont} !important;
      }

      nav a:hover,
      aside a:hover,
      [class*="sidebar"] a:hover,
      [data-testid*="sidebar"] a:hover,
      nav button:hover,
      aside button:hover,
      [class*="sidebar"] button:hover,
      [data-testid*="sidebar"] button:hover,
      nav [aria-current="page"],
      aside [aria-current="page"],
      [class*="sidebar"] [aria-current="page"],
      [data-testid*="sidebar"] [aria-current="page"],
      nav [aria-selected="true"],
      aside [aria-selected="true"],
      [class*="sidebar"] [aria-selected="true"],
      [data-testid*="sidebar"] [aria-selected="true"],
      nav [aria-pressed="true"],
      aside [aria-pressed="true"],
      [class*="sidebar"] [aria-pressed="true"],
      [data-testid*="sidebar"] [aria-pressed="true"],
      nav a[data-state="active"],
      aside a[data-state="active"],
      [class*="sidebar"] a[data-state="active"],
      [data-testid*="sidebar"] a[data-state="active"],
      nav a[data-active="true"],
      aside a[data-active="true"],
      [class*="sidebar"] a[data-active="true"],
      [data-testid*="sidebar"] a[data-active="true"] {
        background-color: ${c.bg3} !important;
        color: ${c.text1} !important;
      }

      nav [class*="text-token-text-tertiary"],
      aside [class*="text-token-text-tertiary"],
      [class*="sidebar"] [class*="text-token-text-tertiary"],
      [data-testid*="sidebar"] [class*="text-token-text-tertiary"],
      nav [class*="uppercase"],
      aside [class*="uppercase"],
      [class*="sidebar"] [class*="uppercase"],
      [data-testid*="sidebar"] [class*="uppercase"] {
        color: ${c.text3} !important;
        font-family: ${uiFont} !important;
      }

      nav svg,
      aside svg,
      [class*="sidebar"] svg,
      [data-testid*="sidebar"] svg {
        color: ${c.text2} !important;
      }

      nav a:hover svg,
      aside a:hover svg,
      [class*="sidebar"] a:hover svg,
      [data-testid*="sidebar"] a:hover svg,
      nav button:hover svg,
      aside button:hover svg,
      [class*="sidebar"] button:hover svg,
      [data-testid*="sidebar"] button:hover svg {
        color: ${c.text1} !important;
      }

      [data-testid*="prompt-textarea"],
      form[data-type="unified"],
      textarea,
      [contenteditable="true"] {
        background-color: ${c.bg2} !important;
        color: ${c.text1} !important;
        caret-color: ${c.accent} !important;
        font-family: ${uiFont} !important;
        line-height: 1.45 !important;
        box-sizing: border-box !important;
      }

      form[data-type="unified"] {
        overflow: visible !important;
        background-color: ${c.bg2} !important;
        border-color: ${c.border} !important;
        border-radius: ${r.input} !important;
      }

      form[data-type="unified"] > * {
        min-height: 0 !important;
      }

      form[data-type="unified"] > div,
      form[data-type="unified"] > div > div {
        overflow: visible !important;
        max-height: none !important;
        box-shadow: none !important;
      }

      form[data-type="unified"] > div > div {
        background: transparent !important;
        border-color: transparent !important;
      }

      [data-testid*="prompt-textarea"],
      [class*="ProseMirror"],
      [contenteditable="true"] {
        background: transparent !important;
        outline: none !important;
        overflow-y: auto !important;
        padding-top: 0.25rem !important;
        padding-bottom: 0.25rem !important;
      }

      textarea,
      [contenteditable="true"] {
        min-height: 1.5em !important;
        max-height: min(35vh, 320px) !important;
      }

      form[data-type="unified"] textarea,
      form[data-type="unified"] [contenteditable="true"],
      form[data-type="unified"] [data-testid*="prompt-textarea"] {
        min-height: 24px !important;
        line-height: 1.5 !important;
      }

      textarea::placeholder,
      input::placeholder,
      [contenteditable="true"]::before {
        color: ${c.text3} !important;
        opacity: 1 !important;
      }

      button[class*="btn-primary"],
      button[data-testid*="send"],
      button[aria-label*="Send"],
      button[aria-label*="Submit"] {
        background-color: ${c.accent} !important;
        color: ${onAccent} !important;
        border-color: ${c.accent} !important;
      }

      button[class*="btn-primary"]:hover,
      button[data-testid*="send"]:hover,
      button[aria-label*="Send"]:hover,
      button[aria-label*="Submit"]:hover {
        background-color: ${c.accentHover} !important;
        border-color: ${c.accentHover} !important;
      }

      button:disabled,
      [aria-disabled="true"] {
        opacity: 0.55 !important;
      }

      .bg-white,
      .bg-black,
      .bg-gray-900,
      .bg-gray-950,
      .bg-neutral-900 { background-color: ${c.bg1} !important; }
      .bg-gray-50,
      .bg-gray-100,
      .bg-neutral-50,
      .bg-neutral-100,
      .bg-gray-700,
      .bg-gray-800,
      .bg-neutral-800 { background-color: ${c.bg2} !important; }
      .bg-gray-200,
      .bg-gray-300 { background-color: ${c.bg3} !important; }

      .text-white,
      .text-black,
      .text-gray-800,
      .text-gray-900 { color: ${c.text1} !important; }
      .text-gray-400,
      .text-gray-500,
      .text-gray-600,
      .text-gray-700 { color: ${c.text2} !important; }

      .hover\\:bg-token-main-surface-secondary:hover,
      .hover\\:bg-gray-100:hover,
      .hover\\:bg-gray-200:hover,
      .hover\\:bg-gray-700:hover,
      .hover\\:bg-gray-800:hover {
        background-color: ${c.bg3} !important;
      }
      .hover\\:bg-token-main-surface-tertiary:hover {
        background-color: ${c.bg4} !important;
      }

      [role="dialog"],
      [role="menu"],
      [role="listbox"],
      [data-radix-popper-content-wrapper] > * {
        background-color: ${c.bg2} !important;
        color: ${c.text1} !important;
        border-color: ${c.border} !important;
        box-shadow: 0 18px 50px rgba(0, 0, 0, ${isDark ? '0.34' : '0.14'}) !important;
        font-family: ${uiFont} !important;
      }

      [role="menuitem"]:hover,
      [role="menuitemradio"]:hover,
      [role="menuitemcheckbox"]:hover,
      [role="option"]:hover,
      [data-highlighted],
      [role="menuitem"][aria-checked="true"],
      [role="menuitemradio"][aria-checked="true"],
      [role="menuitemcheckbox"][aria-checked="true"],
      [role="option"][aria-selected="true"],
      [data-state="checked"] {
        background-color: ${c.bg3} !important;
        color: ${c.text1} !important;
      }

      [role="menu"] svg,
      [role="listbox"] svg,
      [role="menuitem"] svg,
      [role="menuitemradio"] svg,
      [role="menuitemcheckbox"] svg,
      [role="option"] svg {
        color: currentColor !important;
        stroke: currentColor !important;
      }

      [role="separator"] {
        background-color: ${c.border} !important;
        border-color: ${c.border} !important;
      }

      button[aria-haspopup="menu"][aria-expanded="true"],
      button[aria-haspopup="listbox"][aria-expanded="true"] {
        background-color: ${c.bg3} !important;
        color: ${c.text1} !important;
        border-color: ${c.border} !important;
      }

      [role="menuitem"] kbd,
      [role="menuitemradio"] kbd,
      [role="menuitemcheckbox"] kbd,
      [role="option"] kbd,
      [role="menuitem"] code,
      [role="menuitemradio"] code,
      [role="menuitemcheckbox"] code,
      [role="option"] code {
        background-color: ${c.bg3} !important;
        color: ${c.text2} !important;
        border: 1px solid ${c.border} !important;
        border-radius: 6px !important;
        font-family: ${f.mono} !important;
      }

      [role="tooltip"] {
        background-color: ${c.bg4} !important;
        color: ${c.text1} !important;
        border-color: ${c.border} !important;
        box-shadow: 0 10px 30px rgba(0, 0, 0, ${isDark ? '0.28' : '0.12'}) !important;
        font-family: ${uiFont} !important;
      }

      [role="tooltip"] kbd,
      [role="tooltip"] code {
        background-color: ${c.bg2} !important;
        color: ${c.text2} !important;
        border: 1px solid ${c.border} !important;
        border-radius: 6px !important;
        font-family: ${f.mono} !important;
      }

      pre,
      pre > code,
      .markdown pre,
      .prose pre {
        background-color: ${c.codeBg} !important;
        color: ${c.text1} !important;
        border-color: ${c.border} !important;
        border-radius: ${r.card} !important;
      }

      pre [class*="sticky"],
      pre [class*="header"],
      .markdown [class*="code"] button,
      .prose [class*="code"] button {
        background-color: ${c.bg3} !important;
        color: ${c.text2} !important;
        border-color: ${c.border} !important;
        font-family: ${uiFont} !important;
      }

      code:not(pre code) {
        background-color: ${c.codeBg} !important;
        color: ${c.accent} !important;
        border-radius: ${r.chip} !important;
        padding: 1px 5px;
      }

      table { border-color: ${c.border} !important; }
      th, td { border-color: ${c.border} !important; }
      thead { background-color: ${c.bg3} !important; }
      tbody tr:nth-child(odd) { background-color: ${c.bg2} !important; }

      ::selection {
        background-color: ${accentSoft} !important;
        color: ${c.text1} !important;
      }

      * {
        scrollbar-color: ${c.bg4} ${c.bg1};
        scrollbar-width: thin;
      }
      *::-webkit-scrollbar { width: 10px; height: 10px; }
      *::-webkit-scrollbar-track { background: transparent; }
      *::-webkit-scrollbar-thumb {
        background: ${c.bg4};
        border-radius: 9999px;
        border: 2px solid ${c.bg1};
      }
      *::-webkit-scrollbar-thumb:hover { background: ${c.text3}; }

      hr { border-color: ${c.border} !important; }

      [role="tablist"] {
        background: transparent !important;
        border-color: ${c.border} !important;
        font-family: ${uiFont} !important;
      }

      [role="tab"] {
        color: ${c.text2} !important;
        background-color: transparent !important;
        border-color: transparent !important;
        border-radius: ${r.chip} !important;
        font-family: ${uiFont} !important;
      }

      [role="tab"]:hover,
      [role="tab"][aria-selected="true"],
      [role="tab"][data-state="active"] {
        color: ${c.text1} !important;
        background-color: ${c.bg3} !important;
      }

      [data-testid*="deep-research"],
      [data-testid*="research-mode"],
      [aria-label*="Deep research"],
      [aria-label*="Research mode"],
      button[aria-pressed="true"],
      button[data-state="active"] {
        color: ${c.accent} !important;
        border-color: ${c.border} !important;
      }

      [data-testid*="deep-research"] svg,
      [data-testid*="research-mode"] svg,
      [aria-label*="Deep research"] svg,
      [aria-label*="Research mode"] svg,
      button[aria-pressed="true"] svg,
      button[data-state="active"] svg {
        color: currentColor !important;
        stroke: currentColor !important;
      }

      .text-blue-300,
      .text-blue-400,
      .text-blue-500,
      .text-sky-300,
      .text-sky-400,
      .text-sky-500,
      .text-indigo-300,
      .text-indigo-400,
      .text-indigo-500 {
        color: ${c.accent} !important;
      }

      .bg-blue-500,
      .bg-blue-600,
      .bg-sky-500,
      .bg-sky-600,
      .bg-indigo-500,
      .bg-indigo-600 {
        background-color: ${c.accent} !important;
        color: ${onAccent} !important;
      }

      .border-blue-400,
      .border-blue-500,
      .border-sky-400,
      .border-sky-500,
      .border-indigo-400,
      .border-indigo-500 {
        border-color: ${c.accent} !important;
      }

      [class*="suggestion"],
      [class*="prompt-card"],
      [data-testid*="report"],
      [class*="report-card"],
      [class*="ReportCard"],
      main a[href*="/reports"],
      main a[href*="/report/"] {
        background-color: ${c.bg2} !important;
        border-color: ${c.border} !important;
        color: ${c.text1} !important;
        border-radius: ${r.card} !important;
      }
      [class*="suggestion"]:hover,
      [class*="prompt-card"]:hover,
      [data-testid*="report"]:hover,
      [class*="report-card"]:hover,
      [class*="ReportCard"]:hover,
      main a[href*="/reports"]:hover,
      main a[href*="/report/"]:hover {
        background-color: ${c.bg3} !important;
      }

      [data-testid*="report"] p,
      [class*="report-card"] p,
      [class*="ReportCard"] p,
      main a[href*="/reports"] p,
      main a[href*="/report/"] p {
        color: ${c.text2} !important;
        font-family: ${uiFont} !important;
        font-weight: ${bodyWeight} !important;
        line-height: 1.45 !important;
      }

      [data-testid*="report"] h1,
      [data-testid*="report"] h2,
      [data-testid*="report"] h3,
      [class*="report-card"] h1,
      [class*="report-card"] h2,
      [class*="report-card"] h3,
      [class*="ReportCard"] h1,
      [class*="ReportCard"] h2,
      [class*="ReportCard"] h3,
      main a[href*="/reports"] h1,
      main a[href*="/reports"] h2,
      main a[href*="/reports"] h3,
      main a[href*="/report/"] h1,
      main a[href*="/report/"] h2,
      main a[href*="/report/"] h3 {
        color: ${c.text1} !important;
        font-family: ${uiFont} !important;
        font-weight: ${strongWeight} !important;
      }

      [data-testid*="report"] [class*="bg-gradient-to-"],
      [class*="report-card"] [class*="bg-gradient-to-"],
      [class*="ReportCard"] [class*="bg-gradient-to-"],
      main a[href*="/reports"] [class*="bg-gradient-to-"],
      main a[href*="/report/"] [class*="bg-gradient-to-"] {
        display: none !important;
      }

      [data-testid*="conversation-list"],
      [data-testid*="chat-list"],
      [data-testid*="project"] [role="list"],
      [data-testid*="project"] [role="table"],
      main [aria-label*="Chats"][role="table"],
      main [aria-label*="Chats"][role="grid"] {
        background-color: ${c.bg2} !important;
        border-color: ${c.border} !important;
        color: ${c.text1} !important;
        border-radius: ${r.card} !important;
        overflow: hidden !important;
      }

      [data-testid*="conversation-list"] a,
      [data-testid*="conversation-list"] button,
      [data-testid*="chat-list"] a,
      [data-testid*="chat-list"] button,
      [data-testid*="project"] [role="listitem"],
      [data-testid*="project"] [role="row"],
      main [aria-label*="Chats"][role="table"] [role="row"],
      main [aria-label*="Chats"][role="grid"] [role="row"],
      main [aria-label*="Chats"][role="table"] [role="cell"],
      main [aria-label*="Chats"][role="grid"] [role="gridcell"],
      main [aria-label*="Chats"][role="table"] [role="columnheader"],
      main [aria-label*="Chats"][role="grid"] [role="columnheader"] {
        color: ${c.text1} !important;
        background-color: transparent !important;
        border-color: ${c.border} !important;
        font-family: ${uiFont} !important;
      }

      [data-testid*="conversation-list"] a:hover,
      [data-testid*="conversation-list"] button:hover,
      [data-testid*="chat-list"] a:hover,
      [data-testid*="chat-list"] button:hover,
      [data-testid*="project"] [role="listitem"]:hover,
      [data-testid*="project"] [role="row"]:hover,
      main [aria-label*="Chats"][role="table"] [role="row"]:hover,
      main [aria-label*="Chats"][role="grid"] [role="row"]:hover {
        background-color: ${c.bg3} !important;
      }

      main:has(input[placeholder*="Search library"]) [role="table"],
      main:has(input[placeholder*="Search library"]) [role="grid"],
      main:has(input[placeholder*="Search Library"]) [role="table"],
      main:has(input[placeholder*="Search Library"]) [role="grid"] {
        background-color: transparent !important;
        border-color: transparent !important;
        border-radius: 0 !important;
        color: ${c.text1} !important;
        overflow: visible !important;
      }

      main:has(input[placeholder*="Search library"]) [role="row"],
      main:has(input[placeholder*="Search Library"]) [role="row"] {
        background-color: transparent !important;
        border-color: ${c.border} !important;
        color: ${c.text1} !important;
        font-family: ${uiFont} !important;
      }

      main:has(input[placeholder*="Search library"]) [role="row"]:hover,
      main:has(input[placeholder*="Search Library"]) [role="row"]:hover {
        background-color: ${surfaceSoft} !important;
      }

      main:has(input[placeholder*="Search library"]) [role="columnheader"],
      main:has(input[placeholder*="Search Library"]) [role="columnheader"] {
        color: ${c.text2} !important;
        background-color: transparent !important;
        font-weight: ${tableHeaderWeight} !important;
      }

      [class*="file-preview"],
      [class*="filePreview"],
      [class*="uploaded-file"],
      [class*="attachment"],
      [data-testid*="attachment"],
      [data-testid*="file"] {
        background-color: ${c.bg2} !important;
        color: ${c.text1} !important;
        border-color: ${c.border} !important;
      }

      [class*="toast"],
      [data-sonner-toast] {
        background-color: ${c.bg2} !important;
        color: ${c.text1} !important;
        border-color: ${c.border} !important;
      }

      [data-message-author-role="user"] .bg-token-message-surface,
      [data-message-author-role="user"] [class*="bg-token-message-surface"] {
        background-color: ${c.userBubble} !important;
        color: ${c.text1} !important;
        border-radius: ${r.message} !important;
      }
      [data-message-author-role="assistant"] {
        color: ${c.text1} !important;
      }

      [data-message-author-role] {
        max-width: 100% !important;
      }

      [data-testid*="conversation-turn"] {
        color: ${c.text1} !important;
      }

      [data-testid*="conversation-turn"] [class*="text-token-text-secondary"],
      [data-testid*="conversation-turn"] [class*="text-token-text-tertiary"],
      [data-testid*="conversation-turn"] [class*="text-token-text-quaternary"],
      [class*="thought"],
      [data-testid*="thought"],
      [aria-label*="Thought"],
      [aria-label*="Thinking"] {
        color: ${c.text2} !important;
        font-family: ${uiFont} !important;
      }

      [data-message-author-role] button,
      [data-message-author-role] [role="button"],
      [data-message-author-role] a[role="button"],
      [data-testid*="conversation-turn"] button,
      [data-testid*="conversation-turn"] [role="button"] {
        color: ${c.text2} !important;
        background-color: transparent !important;
        border-color: transparent !important;
        font-family: ${uiFont} !important;
      }

      [data-message-author-role] button:hover,
      [data-message-author-role] [role="button"]:hover,
      [data-message-author-role] a[role="button"]:hover,
      [data-testid*="conversation-turn"] button:hover,
      [data-testid*="conversation-turn"] [role="button"]:hover {
        color: ${c.text1} !important;
        background-color: ${c.bg3} !important;
        border-color: ${c.border} !important;
      }

      [data-message-author-role] [class*="source"],
      [data-message-author-role] [data-testid*="source"],
      [data-message-author-role] button:has(svg + span),
      [data-testid*="sources"],
      [aria-label*="Sources"],
      [aria-label*="Citations"],
      [class*="citation"] {
        color: ${c.text1} !important;
        background-color: ${c.bg2} !important;
        border-color: ${c.border} !important;
        border-radius: ${r.chip} !important;
      }

      [data-message-author-role] [class*="source"]:hover,
      [data-message-author-role] [data-testid*="source"]:hover,
      [data-testid*="sources"]:hover,
      [aria-label*="Sources"]:hover,
      [aria-label*="Citations"]:hover,
      [class*="citation"]:hover {
        color: ${c.text1} !important;
        background-color: ${c.bg3} !important;
      }

      form[data-type="unified"] button,
      button[aria-label*="Attach"],
      button[aria-label*="Dictate"],
      button[aria-label*="Voice"],
      button[aria-label*="Microphone"],
      button[aria-label*="Record"],
      button[aria-label*="Stop"],
      button[aria-label*="Interrupt"] {
        color: ${c.text2} !important;
        background-color: transparent !important;
        border-color: transparent !important;
        box-shadow: none !important;
        font-family: ${uiFont} !important;
      }

      form[data-type="unified"] button:hover,
      button[aria-label*="Attach"]:hover,
      button[aria-label*="Dictate"]:hover,
      button[aria-label*="Voice"]:hover,
      button[aria-label*="Microphone"]:hover,
      button[aria-label*="Record"]:hover,
      button[aria-label*="Stop"]:hover,
      button[aria-label*="Interrupt"]:hover {
        color: ${c.text1} !important;
        background-color: ${surfaceSoft} !important;
      }

      form[data-type="unified"] button svg,
      button[aria-label*="Dictate"] svg,
      button[aria-label*="Voice"] svg,
      button[aria-label*="Microphone"] svg,
      button[aria-label*="Record"] svg,
      button[aria-label*="Stop"] svg,
      button[aria-label*="Interrupt"] svg {
        color: currentColor !important;
        fill: none !important;
        stroke: currentColor !important;
      }

      button[data-testid*="send"],
      button[aria-label*="Send"],
      button[aria-label*="Submit"],
      form[data-type="unified"] button[data-testid*="send"],
      form[data-type="unified"] button[aria-label*="Send"],
      form[data-type="unified"] button[aria-label*="Submit"],
      [data-testid="composer"] button[data-testid*="send"],
      [data-testid="composer"] button[aria-label*="Send"],
      [data-testid="composer"] button[aria-label*="Submit"] {
        background-color: ${c.accent} !important;
        color: ${onAccent} !important;
        border-color: ${c.accent} !important;
        box-shadow: 0 1px 2px rgba(0, 0, 0, ${isDark ? '0.28' : '0.12'}) !important;
      }

      button[data-testid*="send"]:hover,
      button[aria-label*="Send"]:hover,
      button[aria-label*="Submit"]:hover,
      form[data-type="unified"] button[data-testid*="send"]:hover,
      form[data-type="unified"] button[aria-label*="Send"]:hover,
      form[data-type="unified"] button[aria-label*="Submit"]:hover,
      [data-testid="composer"] button[data-testid*="send"]:hover,
      [data-testid="composer"] button[aria-label*="Send"]:hover,
      [data-testid="composer"] button[aria-label*="Submit"]:hover {
        background-color: ${c.accentHover} !important;
        color: ${onAccent} !important;
        border-color: ${c.accentHover} !important;
      }

      [class*="spinner"],
      [class*="loading"],
      [aria-busy="true"],
      [data-testid*="loading"],
      [data-testid*="spinner"] {
        color: ${c.accent} !important;
        border-color: ${c.border} !important;
      }

      [class*="spinner"] svg,
      [class*="loading"] svg,
      [aria-busy="true"] svg,
      [data-testid*="loading"] svg,
      [data-testid*="spinner"] svg {
        color: ${c.accent} !important;
      }

      [class*="spinner"][class*="bg-white"],
      [class*="loading"][class*="bg-white"],
      [aria-busy="true"][class*="bg-white"],
      [data-testid*="loading"][class*="bg-white"],
      [data-testid*="spinner"][class*="bg-white"] {
        background-color: ${c.bg2} !important;
        color: ${c.accent} !important;
      }

      input,
      select,
      [role="combobox"],
      [role="switch"],
      [role="checkbox"] {
        background-color: ${c.bg2} !important;
        color: ${c.text1} !important;
        border-color: ${c.border} !important;
        border-radius: ${r.input} !important;
        font-family: ${uiFont} !important;
      }

      [role="switch"] {
        background-color: ${c.bg4} !important;
        color: ${c.text1} !important;
        border-color: ${c.border} !important;
        box-shadow: inset 0 0 0 1px ${c.border} !important;
      }

      [role="switch"][aria-checked="true"],
      [role="switch"][data-state="checked"] {
        background-color: ${c.accent} !important;
        color: ${onAccent} !important;
        border-color: ${c.accent} !important;
      }

      [role="switch"] > span,
      [role="switch"] [data-slot*="thumb"],
      [role="switch"] [class*="thumb"] {
        background-color: ${isDark ? c.bg1 : '#ffffff'} !important;
        border-color: ${c.border} !important;
        box-shadow: 0 1px 3px rgba(0, 0, 0, ${isDark ? '0.34' : '0.16'}) !important;
      }

      [role="dialog"] h1,
      [role="dialog"] h2,
      [role="dialog"] h3,
      [role="dialog"] h4 {
        color: ${c.text1} !important;
        font-family: ${uiFont} !important;
        font-weight: ${strongWeight} !important;
      }

      [role="dialog"] p,
      [role="dialog"] label,
      [role="dialog"] span {
        color: ${c.text2} !important;
        font-family: ${uiFont} !important;
      }

      [role="dialog"] a {
        color: ${c.accent} !important;
      }

      [aria-label*="Scroll to bottom"],
      [data-testid*="scroll-to-bottom"] {
        background-color: ${c.bg2} !important;
        color: ${c.text1} !important;
        border-color: ${c.border} !important;
        box-shadow: 0 8px 24px rgba(0, 0, 0, ${isDark ? '0.3' : '0.12'}) !important;
      }

      [aria-label*="Scroll to bottom"] svg,
      [data-testid*="scroll-to-bottom"] svg {
        color: currentColor !important;
        stroke: currentColor !important;
      }

      .markdown a,
      .prose a,
      [data-message-author-role] .markdown a,
      [data-message-author-role] .prose a {
        color: ${c.accent} !important;
      }
      .markdown a:hover,
      .prose a:hover,
      [data-message-author-role] .markdown a:hover,
      [data-message-author-role] .prose a:hover {
        color: ${c.accentHover} !important;
      }

      [class*="from-token-main-surface-primary"],
      [class*="to-token-main-surface-primary"],
      [class*="from-black"],
      [class*="to-black"],
      [class*="from-transparent"][class*="to-token-main-surface-primary"],
      [class*="from-token-main-surface-primary"][class*="to-transparent"],
      [class*="from-transparent"][class*="to-black"],
      [class*="from-black"][class*="to-transparent"] {
        --tw-gradient-from: ${c.bg1} !important;
        --tw-gradient-to: ${c.bg1} !important;
        --tw-gradient-stops: ${c.bg1}, ${c.bg1} !important;
      }

      [class*="bottom"][class*="bg-gradient-to-"],
      [class*="sticky"][class*="bg-gradient-to-"],
      [class*="fixed"][class*="bg-gradient-to-"],
      [class*="absolute"][class*="bg-gradient-to-"] {
        --tw-gradient-from: ${surfaceOverlay} !important;
        --tw-gradient-via: ${surfaceOverlay} !important;
        --tw-gradient-to: ${c.bg1} !important;
      }

      [class*="sticky"][class*="bottom"],
      [class*="absolute"][class*="bottom"],
      [class*="fixed"][class*="bottom"] {
        border-color: ${c.border} !important;
        color: ${c.text1} !important;
      }

      [class*="sticky"][class*="bottom"] button,
      [class*="absolute"][class*="bottom"] button,
      [class*="fixed"][class*="bottom"] button {
        color: ${c.text2} !important;
      }

      svg { color: inherit; }
    `;
  }

  return { themes, buildCSS };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = CHATTHEMES;
}

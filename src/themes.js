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
      swatches: ['#faf9f5', '#f5f4ed', '#1f1f1d', '#d97757'],
      schemes: {
        light: {
          bg1: '#ffffff',
          bg2: '#faf9f5',
          bg3: '#f5f4ed',
          bg4: '#e8e6dc',
          text1: '#141413',
          text2: '#3d3d3a',
          text3: '#73726c',
          accent: '#d97757',
          accentHover: '#c76342',
          border: 'rgba(31, 30, 29, 0.16)',
          userBubble: '#f5f4ed',
          codeBg: '#f5f4ed'
        },
        dark: {
          bg1: '#1f1f1d',
          bg2: '#262624',
          bg3: '#30302e',
          bg4: '#3d3d3a',
          text1: '#faf9f5',
          text2: '#c2c0b6',
          text3: '#9c9a92',
          accent: '#d97757',
          accentHover: '#e58b70',
          border: 'rgba(222, 220, 209, 0.18)',
          userBubble: '#30302e',
          codeBg: '#262624'
        }
      },
      fonts: {
        ui: '-apple-system, BlinkMacSystemFont, "Segoe UI", Inter, Arial, system-ui, sans-serif',
        body: '-apple-system, BlinkMacSystemFont, "Segoe UI", Inter, Arial, system-ui, sans-serif',
        heading: '"Anthropic Serif", Lora, Cambria, Georgia, "Times New Roman", serif',
        contentHeading: '-apple-system, BlinkMacSystemFont, "Segoe UI", Inter, Arial, system-ui, sans-serif',
        mono: '"JetBrains Mono", "SF Mono", "Cascadia Code", monospace'
      },
      radii: { card: '12px', button: '10px', input: '12px', message: '16px', chip: '8px' },
      tweaks: {
        bodyLineHeight: '1.55',
        contentHeadingWeight: '600',
        strongWeight: '500',
        tableHeaderWeight: '500',
        mutedContentAccent: true
      }
    },
    {
      id: 'gemini',
      name: 'Gemini',
      type: 'adaptive',
      swatches: ['#ffffff', '#f0f4f9', '#131314', '#a8c7fa'],
      schemes: {
        light: {
          bg1: '#ffffff',
          bg2: '#f0f4f9',
          bg3: '#e9eef6',
          bg4: '#dde3ea',
          text1: '#1f1f1f',
          text2: '#444746',
          text3: '#747775',
          accent: '#0b57d0',
          accentHover: '#0842a0',
          border: 'rgba(68, 71, 70, 0.22)',
          userBubble: '#d3e3fd',
          codeBg: '#f0f4f9'
        },
        dark: {
          bg1: '#131314',
          bg2: '#1e1f20',
          bg3: '#282a2c',
          bg4: '#333537',
          text1: '#e3e3e3',
          text2: '#c4c7c5',
          text3: '#9a9b9c',
          accent: '#a8c7fa',
          accentHover: '#d3e3fd',
          border: 'rgba(196, 199, 197, 0.22)',
          userBubble: '#1f3760',
          codeBg: '#1e1f20'
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
      swatches: ['#fcfaf6', '#e5e3d4', '#091717', '#218090'],
      schemes: {
        light: {
          bg1: '#fcfaf6',
          bg2: '#f3f3ee',
          bg3: '#e5e3d4',
          bg4: '#badfde',
          text1: '#091717',
          text2: '#13343b',
          text3: '#2e565d',
          accent: '#218090',
          accentHover: '#1fb8cd',
          border: 'rgba(9, 23, 23, 0.14)',
          userBubble: '#e5e3d4',
          codeBg: '#f3f3ee'
        },
        dark: {
          bg1: '#091717',
          bg2: '#13343b',
          bg3: '#2e565d',
          bg4: '#218090',
          text1: '#fcfaf6',
          text2: '#badfde',
          text3: '#e5e3d4',
          accent: '#20b8cd',
          accentHover: '#badfde',
          border: 'rgba(252, 250, 246, 0.16)',
          userBubble: '#13343b',
          codeBg: '#13343b'
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
    const full = value.length === 3 ? value.split('').map(x => x + x).join('') : value;
    const parsed = Number.parseInt(full, 16);
    return {
      r: (parsed >> 16) & 255,
      g: (parsed >> 8) & 255,
      b: parsed & 255
    };
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

  function readableTextOn(hex) {
    return contrastRatio('#111111', hex) >= contrastRatio('#ffffff', hex) ? '#111111' : '#ffffff';
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
    const uiFont = f.ui || '-apple-system, BlinkMacSystemFont, "Segoe UI", Inter, Arial, system-ui, sans-serif';
    const bodyFont = f.body || uiFont;
    const headingFont = f.heading || uiFont;
    const contentHeadingFont = f.contentHeading || headingFont;
    const monoFont = f.mono || '"SF Mono", "Cascadia Code", monospace';
    const bodyWeight = tw.bodyWeight || '400';
    const strongWeight = tw.strongWeight || '650';
    const headingWeight = tw.contentHeadingWeight || tw.headingWeight || '600';
    const tableHeaderWeight = tw.tableHeaderWeight || '600';
    const onAccent = readableTextOn(c.accent);
    const accentSoft = alpha(c.accent, isDark ? 0.24 : 0.16);
    const accentSofter = alpha(c.accent, isDark ? 0.14 : 0.1);
    const surfaceSoft = alpha(c.bg4, isDark ? 0.42 : 0.32);
    const overlay = alpha(c.bg1, isDark ? 0.94 : 0.92);
    const imageOutline = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    const contentAccent = tw.mutedContentAccent ? c.text3 : c.accent;
    const quoteBorder = tw.mutedContentAccent ? alpha(c.accent, isDark ? 0.7 : 0.58) : c.accent;
    const inlineCodeColor = tw.mutedContentAccent ? c.text2 : c.accent;

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
        --sidebar-surface-primary: ${c.bg2} !important;
        --sidebar-surface-secondary: ${c.bg3} !important;
        --sidebar-surface-tertiary: ${c.bg3} !important;
        --surface-primary: ${c.bg1} !important;
        --surface-secondary: ${c.bg2} !important;
        --surface-tertiary: ${c.bg3} !important;
        --surface-elevated: ${c.bg2} !important;
        --surface-chat: ${c.bg1} !important;
        --surface-fill-primary: ${c.bg2} !important;
        --surface-fill-secondary: ${c.bg3} !important;
        --surface-fill-tertiary: ${c.bg4} !important;
        --composer-bg: ${c.bg2} !important;
        --composer-surface-primary: ${c.bg2} !important;
        --composer-surface-secondary: ${c.bg3} !important;
        --bg-primary: ${c.bg1} !important;
        --bg-secondary: ${c.bg2} !important;
        --bg-tertiary: ${c.bg3} !important;
        --bg-elevated-primary: ${c.bg2} !important;
        --bg-elevated-secondary: ${c.bg3} !important;
        --message-surface: ${c.userBubble} !important;
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

      .bg-token-main-surface-primary,
      [class*="bg-token-main-surface-primary"],
      .bg-token-surface-primary,
      [class*="bg-token-surface-primary"],
      [class*="bg-[#0d0d0d]"] {
        background-color: ${c.bg1} !important;
      }

      .bg-token-main-surface-secondary,
      [class*="bg-token-main-surface-secondary"],
      .bg-token-surface-secondary,
      [class*="bg-token-surface-secondary"],
      .bg-token-bg-elevated-primary,
      [class*="bg-token-bg-elevated-primary"] {
        background-color: ${c.bg2} !important;
      }

      .bg-token-main-surface-tertiary,
      [class*="bg-token-main-surface-tertiary"],
      .bg-token-surface-tertiary,
      [class*="bg-token-surface-tertiary"],
      .bg-token-sidebar-surface-secondary,
      .bg-token-sidebar-surface-tertiary {
        background-color: ${c.bg3} !important;
      }

      .bg-token-sidebar-surface-primary,
      [class*="bg-token-sidebar-surface-primary"],
      [data-testid="sidebar"],
      aside {
        background-color: ${c.bg2} !important;
        color: ${c.text1} !important;
        border-color: ${c.border} !important;
      }

      .text-token-text-primary,
      [class*="text-token-text-primary"] {
        color: ${c.text1} !important;
      }

      .text-token-text-secondary,
      [class*="text-token-text-secondary"] {
        color: ${c.text2} !important;
      }

      .text-token-text-tertiary,
      .text-token-text-quaternary,
      [class*="text-token-text-tertiary"],
      [class*="text-token-text-quaternary"] {
        color: ${c.text3} !important;
      }

      .text-blue-400,
      .text-blue-500,
      [class*="text-blue-400"],
      [class*="text-blue-500"],
      [class*="text-token-text-link"] {
        color: ${c.accent} !important;
      }

      .bg-blue-400,
      .bg-blue-500,
      [class*="bg-blue-400"],
      [class*="bg-blue-500"] {
        background-color: ${c.accent} !important;
        color: ${onAccent} !important;
      }

      .border-token-border-light,
      .border-token-border-medium,
      [class*="border-token-border"],
      [class*="border-blue-400"],
      [class*="border-blue-500"] {
        border-color: ${c.border} !important;
      }

      h1,
      [data-testid*="welcome"] h1,
      main h1 {
        color: ${c.text1} !important;
        font-family: ${headingFont} !important;
        font-weight: ${tw.headingWeight || '600'} !important;
        letter-spacing: 0 !important;
        text-wrap: balance !important;
      }

      main:has(form[data-type="unified"]) h1:not(.markdown h1):not(.prose h1),
      main:has([data-testid="composer"]) h1:not(.markdown h1):not(.prose h1) {
        text-align: center !important;
      }

      main:has([role="tablist"]) h1:not(.markdown h1):not(.prose h1),
      main:has(input[placeholder*="Search library"]) h1:not(.markdown h1):not(.prose h1),
      main:has(input[placeholder*="Search Library"]) h1:not(.markdown h1):not(.prose h1) {
        font-family: ${uiFont} !important;
        font-weight: ${headingWeight} !important;
      }

      [data-message-author-role],
      [data-testid*="conversation-turn"] {
        color: ${c.text1} !important;
        font-family: ${uiFont} !important;
        font-weight: ${bodyWeight} !important;
        font-synthesis-weight: none !important;
        max-width: 100% !important;
      }

      .markdown,
      .prose {
        color: ${c.text1} !important;
        font-family: ${bodyFont} !important;
        font-weight: ${bodyWeight} !important;
        font-synthesis-weight: none !important;
        overflow-wrap: anywhere !important;
        word-break: normal !important;
        --tw-prose-body: ${c.text1} !important;
        --tw-prose-headings: ${c.text1} !important;
        --tw-prose-links: ${c.accent} !important;
        --tw-prose-bold: ${c.text1} !important;
        --tw-prose-counters: ${contentAccent} !important;
        --tw-prose-bullets: ${contentAccent} !important;
        --tw-prose-hr: ${c.border} !important;
        --tw-prose-quotes: ${c.text2} !important;
        --tw-prose-quote-borders: ${quoteBorder} !important;
        --tw-prose-code: ${inlineCodeColor} !important;
        --tw-prose-th-borders: ${c.border} !important;
        --tw-prose-td-borders: ${c.border} !important;
        --tw-prose-invert-body: ${c.text1} !important;
        --tw-prose-invert-headings: ${c.text1} !important;
        --tw-prose-invert-links: ${c.accent} !important;
        --tw-prose-invert-bold: ${c.text1} !important;
        --tw-prose-invert-counters: ${contentAccent} !important;
        --tw-prose-invert-bullets: ${contentAccent} !important;
        --tw-prose-invert-hr: ${c.border} !important;
        --tw-prose-invert-quotes: ${c.text2} !important;
        --tw-prose-invert-quote-borders: ${quoteBorder} !important;
        --tw-prose-invert-code: ${inlineCodeColor} !important;
        --tw-prose-invert-th-borders: ${c.border} !important;
        --tw-prose-invert-td-borders: ${c.border} !important;
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
        font-family: ${contentHeadingFont} !important;
        font-weight: ${headingWeight} !important;
        font-synthesis-weight: none !important;
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

      .markdown p,
      .prose p,
      .markdown li,
      .prose li,
      .markdown td,
      .prose td {
        color: ${c.text1} !important;
        font-weight: ${bodyWeight} !important;
        line-height: ${tw.bodyLineHeight || '1.55'} !important;
        text-wrap: pretty !important;
      }

      .markdown p,
      .prose p {
        margin-top: 0.65em !important;
        margin-bottom: 0.65em !important;
      }

      .markdown :where(.font-semibold, .font-bold):not(strong, strong *, b, b *, th, h1, h2, h3, h4, h5, h6),
      .prose :where(.font-semibold, .font-bold):not(strong, strong *, b, b *, th, h1, h2, h3, h4, h5, h6) {
        font-weight: ${bodyWeight} !important;
      }

      .markdown strong,
      .prose strong {
        color: ${c.text1} !important;
        font-weight: ${strongWeight} !important;
        font-synthesis-weight: none !important;
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
        color: ${contentAccent} !important;
      }

      .markdown blockquote,
      .prose blockquote {
        margin: 0.65em 0 !important;
        padding: 0.05em 0 0.05em 0.85em !important;
        color: ${c.text2} !important;
        border-left: 2px solid ${quoteBorder} !important;
        background: transparent !important;
      }

      .markdown blockquote p,
      .prose blockquote p,
      .markdown blockquote li,
      .prose blockquote li {
        color: ${c.text2} !important;
        margin-top: 0 !important;
        margin-bottom: 0 !important;
      }

      .markdown hr,
      .prose hr {
        border-color: ${c.border} !important;
      }

      .markdown a,
      .prose a,
      [data-message-author-role] .markdown a,
      [data-message-author-role] .prose a {
        color: ${c.accent} !important;
      }

      .markdown a:hover,
      .prose a:hover {
        color: ${c.accentHover} !important;
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
        font-synthesis-weight: none !important;
        padding: 0.65em 0.85em !important;
      }

      .markdown td,
      .prose td {
        padding: 0.65em 0.85em !important;
        vertical-align: top !important;
      }

      .markdown code:not(pre code),
      .prose code:not(pre code) {
        color: ${inlineCodeColor} !important;
        background-color: ${accentSofter} !important;
        border-radius: 0.35em !important;
        padding: 0.12em 0.32em !important;
        font-family: ${monoFont} !important;
        font-weight: ${bodyWeight} !important;
      }

      pre,
      code,
      kbd,
      samp,
      .hljs,
      [class*="language-"],
      [class*="font-mono"] {
        font-family: ${monoFont} !important;
      }

      .markdown div:has(> pre),
      .prose div:has(> pre) {
        background: transparent !important;
        border: 0 !important;
        border-color: transparent !important;
        box-shadow: none !important;
        padding: 0 !important;
        overflow: visible !important;
      }

      .markdown pre,
      .prose pre {
        background-color: ${c.codeBg} !important;
        color: ${c.text1} !important;
        border: 1px solid ${c.border} !important;
        border-radius: ${r.card} !important;
        box-shadow: none !important;
        padding: 0.9em 1em !important;
        overflow-x: auto !important;
        overflow-y: hidden !important;
      }

      .markdown pre code,
      .prose pre code {
        background: transparent !important;
        border: 0 !important;
        border-radius: 0 !important;
        color: inherit !important;
        padding: 0 !important;
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
      .markdown video,
      .prose video,
      [data-message-author-role] .markdown img,
      [data-message-author-role] .prose img {
        display: block !important;
        max-width: 100% !important;
        height: auto !important;
        max-height: none !important;
        object-fit: contain !important;
        border: 0 !important;
        border-radius: ${r.card} !important;
        outline: 1px solid ${imageOutline} !important;
        outline-offset: -1px !important;
        clip-path: none !important;
        background-clip: padding-box !important;
      }

      .markdown :is(a, div, span, figure, picture):has(> img),
      .prose :is(a, div, span, figure, picture):has(> img) {
        --ct-media-radius: ${r.card};
        max-height: none !important;
        overflow: hidden !important;
        border-radius: var(--ct-media-radius) !important;
        border-top-left-radius: var(--ct-media-radius) !important;
        border-top-right-radius: var(--ct-media-radius) !important;
        border-bottom-right-radius: var(--ct-media-radius) !important;
        border-bottom-left-radius: var(--ct-media-radius) !important;
        background: transparent !important;
        background-clip: padding-box !important;
        isolation: isolate !important;
      }

      [data-testid*="conversation-turn"] :is([class*="imagegen"], [data-testid*="imagegen"]):has(img) {
        --ct-media-radius: ${r.card};
        background: transparent !important;
        position: relative !important;
        max-height: none !important;
        height: auto !important;
        aspect-ratio: auto !important;
        overflow: visible !important;
        border-radius: 0 !important;
        box-shadow: none !important;
        filter: none !important;
        -webkit-filter: none !important;
      }

      [data-testid*="conversation-turn"] :is([class*="imagegen"], [data-testid*="imagegen"]):has(> img) {
        border-radius: var(--ct-media-radius) !important;
        border-top-left-radius: var(--ct-media-radius) !important;
        border-top-right-radius: var(--ct-media-radius) !important;
        border-bottom-right-radius: var(--ct-media-radius) !important;
        border-bottom-left-radius: var(--ct-media-radius) !important;
        background-clip: padding-box !important;
        isolation: isolate !important;
      }

      [data-testid*="conversation-turn"] :is([class*="imagegen"], [data-testid*="imagegen"]):has(img)::before,
      [data-testid*="conversation-turn"] :is([class*="imagegen"], [data-testid*="imagegen"]):has(img)::after {
        content: none !important;
        display: none !important;
      }

      [data-testid*="conversation-turn"] :is([class*="imagegen"], [data-testid*="imagegen"]) :is([class*="blur"], [class*="Blur"], [class*="shadow"], [class*="Shadow"], [class*="gradient"], [class*="Gradient"]):not(img):not(button):not(a):not([role="button"]) {
        display: none !important;
      }

      [data-testid*="conversation-turn"] :is([class*="imagegen"], [data-testid*="imagegen"]):has(img) :is(div, span, figure, picture):has(> img) {
        --ct-media-radius: ${r.card};
        background: transparent !important;
        max-height: none !important;
        height: auto !important;
        aspect-ratio: auto !important;
        overflow: hidden !important;
        border-radius: var(--ct-media-radius) !important;
        border-top-left-radius: var(--ct-media-radius) !important;
        border-top-right-radius: var(--ct-media-radius) !important;
        border-bottom-right-radius: var(--ct-media-radius) !important;
        border-bottom-left-radius: var(--ct-media-radius) !important;
        box-shadow: none !important;
        filter: none !important;
        -webkit-filter: none !important;
        background-clip: padding-box !important;
        isolation: isolate !important;
      }

      [data-testid*="conversation-turn"] :is([class*="imagegen"], [data-testid*="imagegen"]):has(img) img {
        display: block !important;
        position: static !important;
        inset: auto !important;
        width: 100% !important;
        max-width: 100% !important;
        height: auto !important;
        max-height: none !important;
        object-fit: contain !important;
        border: 0 !important;
        border-radius: ${r.card} !important;
        border-top-left-radius: ${r.card} !important;
        border-top-right-radius: ${r.card} !important;
        border-bottom-right-radius: ${r.card} !important;
        border-bottom-left-radius: ${r.card} !important;
        outline: 1px solid ${imageOutline} !important;
        outline-offset: -1px !important;
        clip-path: none !important;
        background-clip: padding-box !important;
      }

      [data-testid*="conversation-turn"] :is([class*="imagegen"], [data-testid*="imagegen"]):has(> img) > button {
        position: absolute !important;
        top: auto !important;
        right: auto !important;
        bottom: 0.75rem !important;
        left: 0.75rem !important;
        z-index: 3 !important;
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        width: auto !important;
        min-width: 0 !important;
        max-width: none !important;
        height: 2rem !important;
        min-height: 2rem !important;
        margin: 0 !important;
        padding: 0 0.75rem !important;
        color: ${c.text2} !important;
        background-color: ${overlay} !important;
        border-color: ${c.border} !important;
        border-radius: ${r.chip} !important;
        box-shadow: 0 1px 4px rgba(0, 0, 0, ${isDark ? '0.22' : '0.12'}) !important;
        backdrop-filter: blur(10px) !important;
        -webkit-backdrop-filter: blur(10px) !important;
        overflow: visible !important;
        white-space: nowrap !important;
      }

      [data-testid*="conversation-turn"] :is([class*="imagegen"], [data-testid*="imagegen"]):has(> img) > button[aria-label*="Download"],
      [data-testid*="conversation-turn"] :is([class*="imagegen"], [data-testid*="imagegen"]):has(> img) > button[aria-label*="Save"] {
        right: 0.75rem !important;
        left: auto !important;
        width: 2rem !important;
        padding: 0 !important;
      }

      [data-testid*="conversation-turn"] :is([class*="imagegen"], [data-testid*="imagegen"]):has(img) > :is(div, span, figure, picture):not(:has(img)):has(> button[aria-label*="Download"]),
      [data-testid*="conversation-turn"] :is([class*="imagegen"], [data-testid*="imagegen"]):has(img) > :is(div, span, figure, picture):not(:has(img)):has(> button[aria-label*="Save"]) {
        position: absolute !important;
        inset: auto 0.75rem 0.75rem 0.75rem !important;
        z-index: 3 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: flex-start !important;
        gap: 0.5rem !important;
        width: auto !important;
        height: 2rem !important;
        min-height: 2rem !important;
        max-height: 2rem !important;
        margin: 0 !important;
        padding: 0 !important;
        background: transparent !important;
        border: 0 !important;
        border-radius: 0 !important;
        box-shadow: none !important;
        overflow: visible !important;
        pointer-events: none !important;
      }

      [data-testid*="conversation-turn"] :is([class*="imagegen"], [data-testid*="imagegen"]):has(img) > :is(div, span, figure, picture):not(:has(img)):has(> button[aria-label*="Download"]) button,
      [data-testid*="conversation-turn"] :is([class*="imagegen"], [data-testid*="imagegen"]):has(img) > :is(div, span, figure, picture):not(:has(img)):has(> button[aria-label*="Save"]) button {
        position: static !important;
        inset: auto !important;
        top: auto !important;
        right: auto !important;
        bottom: auto !important;
        left: auto !important;
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        flex: 0 0 auto !important;
        width: auto !important;
        min-width: 0 !important;
        max-width: none !important;
        height: 2rem !important;
        min-height: 2rem !important;
        margin: 0 !important;
        padding: 0 0.75rem !important;
        color: ${c.text2} !important;
        background-color: ${overlay} !important;
        border-color: ${c.border} !important;
        border-radius: ${r.chip} !important;
        box-shadow: 0 1px 4px rgba(0, 0, 0, ${isDark ? '0.22' : '0.12'}) !important;
        backdrop-filter: blur(10px) !important;
        -webkit-backdrop-filter: blur(10px) !important;
        overflow: visible !important;
        white-space: nowrap !important;
        pointer-events: auto !important;
      }

      [data-testid*="conversation-turn"] :is([class*="imagegen"], [data-testid*="imagegen"]):has(img) > :is(div, span, figure, picture):not(:has(img)):has(> button[aria-label*="Download"]) button[aria-label*="Download"],
      [data-testid*="conversation-turn"] :is([class*="imagegen"], [data-testid*="imagegen"]):has(img) > :is(div, span, figure, picture):not(:has(img)):has(> button[aria-label*="Save"]) button[aria-label*="Save"] {
        width: 2rem !important;
        padding: 0 !important;
        margin-left: auto !important;
      }

      [data-message-author-role] button,
      [data-message-author-role] [role="button"],
      [data-testid*="conversation-turn"] button,
      [data-testid*="conversation-turn"] [role="button"] {
        color: ${c.text2} !important;
        font-family: ${uiFont} !important;
        border-color: transparent !important;
      }

      [data-message-author-role] button:hover,
      [data-message-author-role] [role="button"]:hover,
      [data-testid*="conversation-turn"] button:hover,
      [data-testid*="conversation-turn"] [role="button"]:hover {
        color: ${c.text1} !important;
      }

      [data-testid*="sources"],
      [aria-label*="Sources"],
      [aria-label*="Citations"],
      [class*="citation"] {
        color: ${c.text1} !important;
        background-color: ${c.bg2} !important;
        border-color: ${c.border} !important;
        border-radius: ${r.chip} !important;
      }

      form[data-type="unified"],
      [data-testid="composer"],
      form:has([data-testid*="prompt-textarea"]),
      form:has(#prompt-textarea) {
        margin-inline: auto !important;
        transform: none !important;
        overflow: visible !important;
        background: transparent !important;
        color: ${c.text1} !important;
        font-family: ${uiFont} !important;
      }

      form[data-type="unified"] > div,
      [data-testid="composer"] > div,
      form:has([data-testid*="prompt-textarea"]) > div,
      form:has(#prompt-textarea) > div {
        background-color: ${c.bg2} !important;
        color: ${c.text1} !important;
        border: 1px solid ${c.border} !important;
        border-radius: ${r.input} !important;
        box-shadow: none !important;
        overflow: visible !important;
        max-height: none !important;
      }

      [data-testid*="prompt-textarea"],
      #prompt-textarea,
      [contenteditable="true"][role="textbox"] {
        color: ${c.text1} !important;
        background: transparent !important;
        font-family: ${uiFont} !important;
        font-weight: ${bodyWeight} !important;
        line-height: 1.45 !important;
      }

      [data-testid*="prompt-textarea"][data-placeholder]::before,
      [contenteditable="true"][data-placeholder]::before,
      textarea::placeholder,
      input::placeholder {
        color: ${c.text3} !important;
      }

      form[data-type="unified"] button,
      [data-testid="composer"] button,
      form:has([data-testid*="prompt-textarea"]) button,
      form:has(#prompt-textarea) button,
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
        font-weight: 400 !important;
      }

      form[data-type="unified"] button:hover,
      [data-testid="composer"] button:hover,
      form:has([data-testid*="prompt-textarea"]) button:hover,
      form:has(#prompt-textarea) button:hover,
      button[aria-label*="Attach"]:hover,
      button[aria-label*="Dictate"]:hover,
      button[aria-label*="Voice"]:hover,
      button[aria-label*="Microphone"]:hover {
        color: ${c.text1} !important;
        background-color: ${surfaceSoft} !important;
      }

      form[data-type="unified"] button[aria-haspopup]:not([aria-expanded="true"]),
      form[data-type="unified"] button[data-state="active"]:not([aria-expanded="true"]),
      [data-testid="composer"] button[aria-haspopup]:not([aria-expanded="true"]),
      [data-testid="composer"] button[data-state="active"]:not([aria-expanded="true"]) {
        background-color: transparent !important;
        border-color: transparent !important;
        box-shadow: none !important;
      }

      button[data-testid*="send"],
      button[aria-label*="Send"],
      button[aria-label*="Submit"],
      form[data-type="unified"] button[data-testid*="send"],
      form[data-type="unified"] button[aria-label*="Send"],
      form[data-type="unified"] button[aria-label*="Submit"],
      [data-testid="composer"] button[data-testid*="send"],
      [data-testid="composer"] button[aria-label*="Send"],
      [data-testid="composer"] button[aria-label*="Submit"],
      form:has([data-testid*="prompt-textarea"]) button[data-testid*="send"],
      form:has([data-testid*="prompt-textarea"]) button[aria-label*="Send"],
      form:has([data-testid*="prompt-textarea"]) button[aria-label*="Submit"],
      form:has(#prompt-textarea) button[data-testid*="send"],
      form:has(#prompt-textarea) button[aria-label*="Send"],
      form:has(#prompt-textarea) button[aria-label*="Submit"] {
        background-color: ${c.accent} !important;
        color: ${onAccent} !important;
        border-color: ${c.accent} !important;
        box-shadow: 0 1px 2px rgba(0, 0, 0, ${isDark ? '0.28' : '0.12'}) !important;
      }

      button[data-testid*="send"]:hover,
      button[aria-label*="Send"]:hover,
      button[aria-label*="Submit"]:hover {
        background-color: ${c.accentHover} !important;
        color: ${onAccent} !important;
        border-color: ${c.accentHover} !important;
      }

      nav,
      [data-testid="sidebar"] {
        color: ${c.text2} !important;
        border-color: ${c.border} !important;
      }

      nav a,
      nav button,
      [data-testid="sidebar"] a,
      [data-testid="sidebar"] button {
        color: ${c.text2} !important;
        background-color: transparent !important;
        border-color: transparent !important;
        font-family: ${uiFont} !important;
      }

      nav a:hover,
      nav button:hover,
      [data-testid="sidebar"] a:hover,
      [data-testid="sidebar"] button:hover {
        color: ${c.text1} !important;
        background-color: ${surfaceSoft} !important;
      }

      nav a[aria-current="page"],
      nav a[data-state="active"],
      [data-testid="sidebar"] a[aria-current="page"],
      [data-testid="sidebar"] a[data-state="active"] {
        color: ${c.text1} !important;
        background-color: ${c.bg3} !important;
      }

      nav svg,
      [data-testid="sidebar"] svg,
      button svg,
      [role="button"] svg {
        color: currentColor !important;
        stroke: currentColor !important;
      }

      [role="dialog"],
      [role="menu"],
      [role="listbox"],
      [role="tooltip"],
      [data-radix-popper-content-wrapper] > * {
        background-color: ${c.bg2} !important;
        color: ${c.text1} !important;
        border-color: ${c.border} !important;
        box-shadow: 0 16px 40px rgba(0, 0, 0, ${isDark ? '0.36' : '0.14'}) !important;
        font-family: ${uiFont} !important;
      }

      [role="tooltip"],
      [data-radix-popper-content-wrapper] [data-side][data-align]:has(kbd),
      [data-radix-popper-content-wrapper] *:has(> kbd) {
        background-color: ${c.bg2} !important;
        color: ${c.text1} !important;
        border: 1px solid ${c.border} !important;
        border-radius: ${r.chip} !important;
        padding: 0.35rem 0.5rem !important;
      }

      [role="tooltip"] kbd,
      [data-radix-popper-content-wrapper] kbd,
      [role="menu"] kbd,
      [role="listbox"] kbd {
        background-color: ${c.bg3} !important;
        color: ${c.text2} !important;
        border-color: ${c.border} !important;
        border-radius: 4px !important;
      }

      [role="menuitem"],
      [role="menuitemradio"],
      [role="menuitemcheckbox"],
      [role="option"] {
        color: ${c.text1} !important;
        background-color: transparent !important;
        font-family: ${uiFont} !important;
      }

      [role="menuitem"]:hover,
      [role="menuitemradio"]:hover,
      [role="menuitemcheckbox"]:hover,
      [role="option"]:hover,
      [role="menuitemradio"][aria-checked="true"],
      [role="menuitemcheckbox"][aria-checked="true"] {
        background-color: ${surfaceSoft} !important;
        color: ${c.text1} !important;
      }

      [role="separator"] {
        background-color: ${c.border} !important;
        border-color: ${c.border} !important;
      }

      [role="tablist"] {
        border-color: ${c.border} !important;
        box-shadow: inset 0 -1px ${c.border} !important;
      }

      [role="tab"] {
        color: ${c.text2} !important;
        background-color: transparent !important;
        border-color: transparent !important;
        font-family: ${uiFont} !important;
      }

      [role="tab"][aria-selected="true"] {
        color: ${c.text1} !important;
        background-color: ${c.bg3} !important;
        border-color: ${c.border} !important;
      }

      input:not([type="range"]):not([type="checkbox"]):not([type="radio"]):not([type="file"]):not([type="hidden"]):not([type="color"]):not([type="button"]):not([type="submit"]):not([type="reset"]),
      select,
      textarea,
      [role="combobox"],
      [role="checkbox"] {
        background-color: ${c.bg2} !important;
        color: ${c.text1} !important;
        border-color: ${c.border} !important;
        border-radius: ${r.input} !important;
        font-family: ${uiFont} !important;
      }

      input[type="range"],
      progress,
      meter,
      [role="progressbar"] {
        background: transparent !important;
        border: 0 !important;
        border-radius: 0 !important;
        box-shadow: none !important;
        color: ${c.accent} !important;
        accent-color: ${c.accent} !important;
        padding: 0 !important;
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

      [data-testid*="deep-research"],
      [aria-label*="Deep research"],
      [aria-label*="Deep Research"] {
        color: ${c.accent} !important;
        border-color: ${c.border} !important;
      }

      [data-testid*="thought"],
      [class*="thought"],
      [aria-label*="Thought"],
      [aria-label*="Thinking"] {
        color: ${c.text2} !important;
        font-family: ${uiFont} !important;
      }

      [data-testid*="conversation-list"],
      [data-testid*="chat-list"],
      main [aria-label*="Chats"][role="table"],
      main [aria-label*="Chats"][role="grid"] {
        background-color: ${c.bg2} !important;
        border-color: ${c.border} !important;
        color: ${c.text1} !important;
        border-radius: ${r.card} !important;
      }

      [data-testid*="conversation-list"] a,
      [data-testid*="conversation-list"] button,
      [data-testid*="chat-list"] a,
      [data-testid*="chat-list"] button,
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
      main [aria-label*="Chats"][role="table"] [role="row"]:hover,
      main [aria-label*="Chats"][role="grid"] [role="row"]:hover {
        background-color: ${surfaceSoft} !important;
      }

      main:has(input[placeholder*="Search library"]) [role="table"],
      main:has(input[placeholder*="Search library"]) [role="grid"],
      main:has(input[placeholder*="Search Library"]) [role="table"],
      main:has(input[placeholder*="Search Library"]) [role="grid"] {
        background-color: transparent !important;
        border-color: transparent !important;
        border-radius: 0 !important;
        color: ${c.text1} !important;
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

      main a[href*="/reports"],
      main a[href*="/report/"],
      [data-testid*="report"],
      [class*="report-card"],
      [class*="ReportCard"] {
        background-color: ${c.bg2} !important;
        color: ${c.text1} !important;
        border-color: ${c.border} !important;
      }

      main a[href*="/reports"] p,
      main a[href*="/report/"] p,
      [data-testid*="report"] p,
      [class*="report-card"] p,
      [class*="ReportCard"] p {
        color: ${c.text2} !important;
      }

      main a[href*="/reports"] [class*="bg-gradient-to-"],
      main a[href*="/report/"] [class*="bg-gradient-to-"],
      [data-testid*="report"] [class*="bg-gradient-to-"],
      [class*="report-card"] [class*="bg-gradient-to-"],
      [class*="ReportCard"] [class*="bg-gradient-to-"] {
        display: none !important;
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

      [class*="from-token-main-surface-primary"],
      [class*="to-token-main-surface-primary"],
      [class*="from-token-bg-primary"],
      [class*="to-token-bg-primary"] {
        --tw-gradient-from: ${c.bg1} !important;
        --tw-gradient-to: ${c.bg1} !important;
        --tw-gradient-stops: ${c.bg1}, ${c.bg1} !important;
      }

      [class*="bottom"][class*="bg-gradient-to-"],
      [class*="sticky"][class*="bg-gradient-to-"],
      [class*="fixed"][class*="bg-gradient-to-"] {
        --tw-gradient-from: ${overlay} !important;
        --tw-gradient-via: ${overlay} !important;
        --tw-gradient-to: ${c.bg1} !important;
      }

      [aria-label*="Scroll to bottom"],
      [data-testid*="scroll-to-bottom"] {
        background-color: ${c.bg2} !important;
        color: ${c.text1} !important;
        border-color: ${c.border} !important;
        box-shadow: 0 8px 24px rgba(0, 0, 0, ${isDark ? '0.3' : '0.12'}) !important;
      }

      svg {
        color: inherit;
      }
    `;
  }

  return { themes, buildCSS };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = CHATTHEMES;
}

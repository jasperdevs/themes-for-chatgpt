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
      tweaks: { bodyLineHeight: '1.55', contentHeadingWeight: '600', strongWeight: '500', tableHeaderWeight: '500', mutedContentAccent: true }
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
    const contentHeadingFont = f.contentHeading || f.heading || uiFont;
    const bodyWeight = tw.bodyWeight || '400';
    const strongWeight = tw.strongWeight || '650';
    const tableHeaderWeight = tw.tableHeaderWeight || '600';
    const contentAccent = tw.mutedContentAccent ? c.text3 : c.accent;
    const blockquoteBorder = tw.mutedContentAccent ? alpha(c.accent, isDark ? 0.72 : 0.64) : c.accent;
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
        letter-spacing: 0 !important;
      }

      [data-testid*="welcome"] h1,
      main:has(form[data-type="unified"]) h1:not(.markdown h1):not(.prose h1),
      main:has([data-testid="composer"]) h1:not(.markdown h1):not(.prose h1) {
        text-align: center !important;
        text-wrap: balance !important;
      }

      [data-message-author-role] {
        font-family: ${uiFont} !important;
        font-weight: ${bodyWeight} !important;
        font-synthesis-weight: none !important;
      }

      .markdown,
      .prose {
        font-family: ${f.body} !important;
        font-weight: ${bodyWeight} !important;
        font-synthesis-weight: none !important;
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
        font-family: ${contentHeadingFont} !important;
        font-weight: ${tw.contentHeadingWeight || tw.headingWeight || '600'} !important;
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

      .markdown :where(p, li, td, blockquote) :where(span, div):not(strong, strong *, b, b *),
      .prose :where(p, li, td, blockquote) :where(span, div):not(strong, strong *, b, b *),
      .markdown :where(.font-semibold, .font-bold):not(strong, strong *, b, b *, th, h1, h2, h3, h4, h5, h6),
      .prose :where(.font-semibold, .font-bold):not(strong, strong *, b, b *, th, h1, h2, h3, h4, h5, h6) {
        font-weight: ${bodyWeight} !important;
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
        border-left: 2px solid ${blockquoteBorder} !important;
        background: transparent !important;
      }

      .markdown blockquote p,
      .prose blockquote p {
        margin-top: 0 !important;
        margin-bottom: 0 !important;
        color: ${c.text2} !important;
      }

      .markdown blockquote > :where(p, ul, ol):first-child,
      .prose blockquote > :where(p, ul, ol):first-child {
        margin-top: 0 !important;
      }

      .markdown blockquote > :where(p, ul, ol):last-child,
      .prose blockquote > :where(p, ul, ol):last-child {
        margin-bottom: 0 !important;
      }

      .markdown blockquote > :where(p, ul, ol) + :where(p, ul, ol),
      .prose blockquote > :where(p, ul, ol) + :where(p, ul, ol) {
        margin-top: 0.55em !important;
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
        font-synthesis-weight: none !important;
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
      [data-testid*="conversation-turn"] img,
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
      [data-message-author-role] [style*="height"]:has(img),
      [data-message-author-role] [class*="overflow-hidden"]:has(img),
      [data-message-author-role] [class*="overflow-clip"]:has(img),
      [data-message-author-role] [class*="max-h"]:has(img),
      [data-message-author-role] [class*="h-"]:has(img),
      [data-message-author-role] [class*="size-"]:has(img),
      [data-testid*="conversation-turn"] [style*="overflow"]:has(img),
      [data-testid*="conversation-turn"] [style*="height"]:has(img),
      [data-testid*="conversation-turn"] [class*="overflow-hidden"]:has(img),
      [data-testid*="conversation-turn"] [class*="overflow-clip"]:has(img),
      [data-testid*="conversation-turn"] [class*="max-h"]:has(img),
      [data-testid*="conversation-turn"] [class*="h-"]:has(img),
      [data-testid*="conversation-turn"] [class*="size-"]:has(img),
      [data-testid*="conversation-turn"] [class*="aspect-"]:has(img),
      [data-testid*="conversation-turn"] [style*="aspect-ratio"]:has(img),
      [data-testid*="conversation-turn"] [class*="imagegen"]:has(img),
      [data-testid*="conversation-turn"] [data-testid*="image"]:has(img),
      [data-testid*="conversation-turn"] :is(div, span, figure, picture):has(> img) {
        background: transparent !important;
        position: relative !important;
        overflow: visible !important;
        max-height: none !important;
        min-height: 0 !important;
        height: auto !important;
        aspect-ratio: auto !important;
        border-radius: 0 !important;
        clip-path: none !important;
        box-shadow: none !important;
        filter: none !important;
        -webkit-filter: none !important;
        backdrop-filter: none !important;
        -webkit-backdrop-filter: none !important;
      }

      [data-message-author-role] a:has(> img)::before,
      [data-message-author-role] a:has(> img)::after,
      [data-message-author-role] div:has(> img)::before,
      [data-message-author-role] div:has(> img)::after,
      [data-message-author-role] span:has(> img)::before,
      [data-message-author-role] span:has(> img)::after,
      [data-message-author-role] figure:has(img)::before,
      [data-message-author-role] figure:has(img)::after,
      [data-testid*="conversation-turn"] [class*="imagegen"]:has(img)::before,
      [data-testid*="conversation-turn"] [class*="imagegen"]:has(img)::after,
      [data-testid*="conversation-turn"] [data-testid*="image"]:has(img)::before,
      [data-testid*="conversation-turn"] [data-testid*="image"]:has(img)::after,
      [data-testid*="conversation-turn"] [class*="aspect-"]:has(img)::before,
      [data-testid*="conversation-turn"] [class*="aspect-"]:has(img)::after,
      [data-testid*="conversation-turn"] [style*="aspect-ratio"]:has(img)::before,
      [data-testid*="conversation-turn"] [style*="aspect-ratio"]:has(img)::after {
        content: none !important;
        display: none !important;
      }

      [data-testid*="conversation-turn"] [class*="imagegen"] [class*="blur"]:not(img):not(button):not(a):not([role="button"]),
      [data-testid*="conversation-turn"] [class*="imagegen"] [class*="Blur"]:not(img):not(button):not(a):not([role="button"]),
      [data-testid*="conversation-turn"] [class*="imagegen"] [class*="shadow"]:not(img):not(button):not(a):not([role="button"]),
      [data-testid*="conversation-turn"] [class*="imagegen"] [class*="Shadow"]:not(img):not(button):not(a):not([role="button"]),
      [data-testid*="conversation-turn"] [class*="imagegen"] [class*="gradient"]:not(img):not(button):not(a):not([role="button"]),
      [data-testid*="conversation-turn"] [class*="imagegen"] [class*="Gradient"]:not(img):not(button):not(a):not([role="button"]),
      [data-testid*="conversation-turn"] [data-testid*="image"] [class*="blur"]:not(img):not(button):not(a):not([role="button"]),
      [data-testid*="conversation-turn"] [data-testid*="image"] [class*="shadow"]:not(img):not(button):not(a):not([role="button"]),
      [data-testid*="conversation-turn"] [data-testid*="image"] [class*="gradient"]:not(img):not(button):not(a):not([role="button"]) {
        display: none !important;
      }

      [data-testid*="conversation-turn"] [class*="imagegen"]:has(img) :is(div, span, figure, picture):not(:has(button)):not(button):not(a):not([role="button"]),
      [data-testid*="conversation-turn"] [data-testid*="image"]:has(img) :is(div, span, figure, picture):not(:has(button)):not(button):not(a):not([role="button"]),
      [data-testid*="conversation-turn"] :is(div, span, figure, picture):has(> img) > :is(div, span, figure, picture):not(:has(button)):not(button):not(a):not([role="button"]),
      [data-testid*="conversation-turn"] :is(div, span, figure, picture):has(img):not(.markdown):not(.prose):not([class*="markdown"]):not([class*="prose"]) > :is(div, span, figure, picture):not(:has(img)):not(:has(button)):not(button):not(a):not([role="button"]) {
        background: transparent !important;
        position: static !important;
        overflow: visible !important;
        max-height: none !important;
        min-height: 0 !important;
        height: auto !important;
        aspect-ratio: auto !important;
        border-radius: 0 !important;
        clip-path: none !important;
        box-shadow: none !important;
        filter: none !important;
        -webkit-filter: none !important;
        backdrop-filter: none !important;
        -webkit-backdrop-filter: none !important;
      }

      [data-testid*="conversation-turn"] [class*="imagegen"]:has(img) img,
      [data-testid*="conversation-turn"] [data-testid*="image"]:has(img) img,
      [data-testid*="conversation-turn"] [class*="aspect-"]:has(img) img,
      [data-testid*="conversation-turn"] [style*="aspect-ratio"]:has(img) img,
      [data-testid*="conversation-turn"] :is(div, span, figure, picture):has(> img) > img,
      [data-testid*="conversation-turn"] :is(div, span, figure, picture):has(img) > :is(div, span, figure, picture):has(> img) > img {
        position: static !important;
        inset: auto !important;
        width: 100% !important;
        height: auto !important;
        max-height: none !important;
        object-fit: contain !important;
        aspect-ratio: auto !important;
        border: 0 !important;
        border-radius: ${r.card} !important;
        clip-path: none !important;
      }

      [data-testid*="conversation-turn"] [class*="imagegen"]:has(img) :is(div, span, figure, picture):has(> img),
      [data-testid*="conversation-turn"] [data-testid*="image"]:has(img) :is(div, span, figure, picture):has(> img),
      [data-testid*="conversation-turn"] :is(div, span, figure, picture):has(> img) {
        position: relative !important;
      }

      [data-testid*="conversation-turn"] [class*="imagegen"]:has(img) button,
      [data-testid*="conversation-turn"] [data-testid*="image"]:has(img) button,
      [data-testid*="conversation-turn"] :is(div, span, figure, picture):has(> img) > button,
      [data-testid*="conversation-turn"] :is(div, span, figure, picture):has(img):not(.markdown):not(.prose):not([class*="markdown"]):not([class*="prose"]) > :is(div, span, figure, picture):not(:has(img)) button {
        position: absolute !important;
        top: auto !important;
        right: auto !important;
        bottom: 0.75rem !important;
        left: 0.75rem !important;
        z-index: 2 !important;
        transform: none !important;
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        width: auto !important;
        min-width: 0 !important;
        height: 2rem !important;
        min-height: 2rem !important;
        margin: 0 !important;
        padding: 0 0.75rem !important;
        color: ${c.text2} !important;
        background-color: ${surfaceOverlay} !important;
        border-color: ${c.border} !important;
        border-radius: ${r.chip} !important;
        box-shadow: 0 1px 4px rgba(0, 0, 0, ${isDark ? '0.22' : '0.12'}) !important;
        backdrop-filter: blur(10px) !important;
        -webkit-backdrop-filter: blur(10px) !important;
      }

      [data-testid*="conversation-turn"] [class*="imagegen"]:has(img) button[aria-label*="Download"],
      [data-testid*="conversation-turn"] [data-testid*="image"]:has(img) button[aria-label*="Download"],
      [data-testid*="conversation-turn"] [class*="imagegen"]:has(img) button[aria-label*="Save"],
      [data-testid*="conversation-turn"] [data-testid*="image"]:has(img) button[aria-label*="Save"],
      [data-testid*="conversation-turn"] :is(div, span, figure, picture):has(> img) > button[aria-label*="Download"],
      [data-testid*="conversation-turn"] :is(div, span, figure, picture):has(> img) > button[aria-label*="Save"],
      [data-testid*="conversation-turn"] :is(div, span, figure, picture):has(img):not(.markdown):not(.prose):not([class*="markdown"]):not([class*="prose"]) > :is(div, span, figure, picture):not(:has(img)) button[aria-label*="Download"],
      [data-testid*="conversation-turn"] :is(div, span, figure, picture):has(img):not(.markdown):not(.prose):not([class*="markdown"]):not([class*="prose"]) > :is(div, span, figure, picture):not(:has(img)) button[aria-label*="Save"] {
        right: 0.75rem !important;
        left: auto !important;
        width: 2rem !important;
        padding: 0 !important;
      }

      [data-testid*="conversation-turn"] :is(div, span, figure, picture):has(img):not(.markdown):not(.prose):not([class*="markdown"]):not([class*="prose"]) > :is(div, span, figure, picture):not(:has(img)):has(button) {
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

      [data-testid*="conversation-turn"] :is(div, span, figure, picture):has(img):not(.markdown):not(.prose):not([class*="markdown"]):not([class*="prose"]) > :is(div, span, figure, picture):not(:has(img)):has(button) button {
        position: static !important;
        inset: auto !important;
        top: auto !important;
        right: auto !important;
        bottom: auto !important;
        left: auto !important;
        flex: 0 0 auto !important;
        max-width: none !important;
        overflow: visible !important;
        white-space: nowrap !important;
        pointer-events: auto !important;
      }

      [data-testid*="conversation-turn"] :is(div, span, figure, picture):has(img):not(.markdown):not(.prose):not([class*="markdown"]):not([class*="prose"]) > :is(div, span, figure, picture):not(:has(img)):has(button) button[aria-label*="Download"],
      [data-testid*="conversation-turn"] :is(div, span, figure, picture):has(img):not(.markdown):not(.prose):not([class*="markdown"]):not([class*="prose"]) > :is(div, span, figure, picture):not(:has(img)):has(button) button[aria-label*="Save"] {
        right: auto !important;
        left: auto !important;
        margin-left: auto !important;
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
      [data-testid="composer"],
      form:has([data-testid*="prompt-textarea"]),
      form:has(#prompt-textarea),
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

      form[data-type="unified"],
      [data-testid="composer"],
      form:has([data-testid*="prompt-textarea"]),
      form:has(#prompt-textarea) {
        overflow: visible !important;
        background-color: ${c.bg2} !important;
        border-color: ${c.border} !important;
        border-radius: ${r.input} !important;
        margin-left: auto !important;
        margin-right: auto !important;
      }

      main :is(section, div):not(:has([role="tablist"])):has(> h1):has(form[data-type="unified"]),
      main :is(section, div):not(:has([role="tablist"])):has(> h1):has([data-testid="composer"]) {
        display: flex !important;
        flex-direction: column !important;
        align-items: center !important;
        width: 100% !important;
      }

      main :is(section, div):not(:has([role="tablist"])):has(> h1):has(form[data-type="unified"]) > h1:not(.markdown h1):not(.prose h1),
      main :is(section, div):not(:has([role="tablist"])):has(> h1):has([data-testid="composer"]) > h1:not(.markdown h1):not(.prose h1) {
        align-self: center !important;
        width: min(100%, 48rem) !important;
        margin-left: auto !important;
        margin-right: auto !important;
      }

      main :is(section, div):not(:has([role="tablist"])):has(> h1):has(form[data-type="unified"]) > form[data-type="unified"],
      main :is(section, div):not(:has([role="tablist"])):has(> h1):has([data-testid="composer"]) > [data-testid="composer"],
      main :is(section, div):not(:has([role="tablist"])):has(> h1):has([data-testid*="prompt-textarea"]) > form:has([data-testid*="prompt-textarea"]) {
        align-self: center !important;
        left: auto !important;
        right: auto !important;
        transform: none !important;
      }

      form[data-type="unified"] > *,
      [data-testid="composer"] > *,
      form:has([data-testid*="prompt-textarea"]) > *,
      form:has(#prompt-textarea) > * {
        min-height: 0 !important;
      }

      form[data-type="unified"] > div,
      form[data-type="unified"] > div > div,
      [data-testid="composer"] > div,
      [data-testid="composer"] > div > div,
      form:has([data-testid*="prompt-textarea"]) > div,
      form:has([data-testid*="prompt-textarea"]) > div > div,
      form:has(#prompt-textarea) > div,
      form:has(#prompt-textarea) > div > div {
        overflow: visible !important;
        max-height: none !important;
        border-width: 0 !important;
        box-shadow: none !important;
      }

      form[data-type="unified"] > div > div,
      [data-testid="composer"] > div > div,
      form:has([data-testid*="prompt-textarea"]) > div > div,
      form:has(#prompt-textarea) > div > div {
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
      form[data-type="unified"] [data-testid*="prompt-textarea"],
      [data-testid="composer"] textarea,
      [data-testid="composer"] [contenteditable="true"],
      [data-testid="composer"] [data-testid*="prompt-textarea"],
      form:has([data-testid*="prompt-textarea"]) textarea,
      form:has([data-testid*="prompt-textarea"]) [contenteditable="true"],
      form:has([data-testid*="prompt-textarea"]) [data-testid*="prompt-textarea"],
      form:has(#prompt-textarea) textarea,
      form:has(#prompt-textarea) [contenteditable="true"],
      form:has(#prompt-textarea) [data-testid*="prompt-textarea"] {
        min-height: 24px !important;
        line-height: 1.5 !important;
      }

      form[data-type="unified"] button[aria-haspopup],
      form[data-type="unified"] [role="button"][aria-haspopup],
      form[data-type="unified"] button[data-state="active"],
      form[data-type="unified"] button[aria-pressed="true"],
      [data-testid="composer"] button[aria-haspopup],
      [data-testid="composer"] [role="button"][aria-haspopup],
      [data-testid="composer"] button[data-state="active"],
      [data-testid="composer"] button[aria-pressed="true"],
      form:has([data-testid*="prompt-textarea"]) button[aria-haspopup],
      form:has([data-testid*="prompt-textarea"]) [role="button"][aria-haspopup],
      form:has([data-testid*="prompt-textarea"]) button[data-state="active"],
      form:has([data-testid*="prompt-textarea"]) button[aria-pressed="true"],
      form:has(#prompt-textarea) button[aria-haspopup],
      form:has(#prompt-textarea) [role="button"][aria-haspopup],
      form:has(#prompt-textarea) button[data-state="active"],
      form:has(#prompt-textarea) button[aria-pressed="true"] {
        background-color: ${c.bg3} !important;
        color: ${c.text1} !important;
        border-color: ${c.border} !important;
        border-radius: ${r.chip} !important;
        box-shadow: none !important;
        font-weight: 400 !important;
      }

      form[data-type="unified"] button[aria-haspopup] svg,
      form[data-type="unified"] [role="button"][aria-haspopup] svg,
      form[data-type="unified"] button[data-state="active"] svg,
      form[data-type="unified"] button[aria-pressed="true"] svg,
      [data-testid="composer"] button[aria-haspopup] svg,
      [data-testid="composer"] [role="button"][aria-haspopup] svg,
      [data-testid="composer"] button[data-state="active"] svg,
      [data-testid="composer"] button[aria-pressed="true"] svg,
      form:has([data-testid*="prompt-textarea"]) button[aria-haspopup] svg,
      form:has([data-testid*="prompt-textarea"]) [role="button"][aria-haspopup] svg,
      form:has([data-testid*="prompt-textarea"]) button[data-state="active"] svg,
      form:has([data-testid*="prompt-textarea"]) button[aria-pressed="true"] svg,
      form:has(#prompt-textarea) button[aria-haspopup] svg,
      form:has(#prompt-textarea) [role="button"][aria-haspopup] svg,
      form:has(#prompt-textarea) button[data-state="active"] svg,
      form:has(#prompt-textarea) button[aria-pressed="true"] svg {
        color: currentColor !important;
        stroke: currentColor !important;
      }

      form[data-type="unified"] button[aria-haspopup] [class*="bg-blue"],
      form[data-type="unified"] button[data-state="active"] [class*="bg-blue"],
      form[data-type="unified"] button[aria-pressed="true"] [class*="bg-blue"],
      [data-testid="composer"] button[aria-haspopup] [class*="bg-blue"],
      [data-testid="composer"] button[data-state="active"] [class*="bg-blue"],
      [data-testid="composer"] button[aria-pressed="true"] [class*="bg-blue"],
      form:has([data-testid*="prompt-textarea"]) button[aria-haspopup] [class*="bg-blue"],
      form:has([data-testid*="prompt-textarea"]) button[data-state="active"] [class*="bg-blue"],
      form:has([data-testid*="prompt-textarea"]) button[aria-pressed="true"] [class*="bg-blue"],
      form:has(#prompt-textarea) button[aria-haspopup] [class*="bg-blue"],
      form:has(#prompt-textarea) button[data-state="active"] [class*="bg-blue"],
      form:has(#prompt-textarea) button[aria-pressed="true"] [class*="bg-blue"] {
        background-color: ${c.bg4} !important;
        color: ${c.text1} !important;
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
      [class*="bg-[#000000]"],
      [class*="bg-[#0d0d0d]"],
      [class*="bg-[#0e0e0e]"],
      [class*="bg-[#0f0f0f]"],
      [class*="bg-[#101010]"],
      [class*="bg-[#111111]"],
      [class*="bg-[#121212]"],
      [class*="bg-[#131313]"],
      [class*="bg-[#171717]"],
      [class*="bg-[#1a1a1a]"],
      [class*="bg-[#1f1f1f]"],
      [class*="bg-[#212121]"],
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

      [role="tooltip"],
      [data-testid*="tooltip"],
      [data-slot="tooltip-content"],
      [data-radix-tooltip-content],
      [data-radix-popper-content-wrapper] > [data-side][data-align]:has(kbd),
      [data-radix-popper-content-wrapper] > [data-side][data-align]:has(code),
      [data-radix-popper-content-wrapper] [data-side][data-align]:has(kbd),
      [data-radix-popper-content-wrapper] [data-side][data-align]:has(code) {
        background-color: ${c.bg3} !important;
        color: ${c.text1} !important;
        border: 1px solid ${c.border} !important;
        border-radius: ${r.chip} !important;
        box-shadow: 0 10px 30px rgba(0, 0, 0, ${isDark ? '0.28' : '0.12'}) !important;
        font-family: ${uiFont} !important;
        padding: 0.45rem 0.6rem !important;
      }

      [role="tooltip"] kbd,
      [role="tooltip"] code,
      [data-testid*="tooltip"] kbd,
      [data-testid*="tooltip"] code,
      [data-slot="tooltip-content"] kbd,
      [data-slot="tooltip-content"] code,
      [data-radix-tooltip-content] kbd,
      [data-radix-tooltip-content] code,
      [data-radix-popper-content-wrapper] > [data-side][data-align] kbd,
      [data-radix-popper-content-wrapper] > [data-side][data-align] code,
      [data-radix-popper-content-wrapper] [data-side][data-align] kbd,
      [data-radix-popper-content-wrapper] [data-side][data-align] code {
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
        border: 1px solid ${c.border} !important;
        border-radius: ${r.card} !important;
      }

      .markdown div:has(> pre),
      .prose div:has(> pre),
      [data-message-author-role] div:has(> pre) {
        background: transparent !important;
        border: 0 solid transparent !important;
        border-radius: ${r.card} !important;
        box-shadow: none !important;
        outline: 0 !important;
        overflow: visible !important;
        padding: 0 !important;
      }

      pre,
      .markdown pre,
      .prose pre {
        background-clip: padding-box !important;
        box-sizing: border-box !important;
        overflow-x: auto !important;
        overflow-y: hidden !important;
        padding: 1rem 1.15rem !important;
      }

      pre > code,
      .markdown pre code,
      .prose pre code {
        display: block !important;
        min-width: 100% !important;
        width: max-content !important;
        margin: 0 !important;
        padding: 0 !important;
        background: transparent !important;
        color: inherit !important;
        border: 0 !important;
        border-radius: 0 !important;
        box-shadow: none !important;
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
        color: ${inlineCodeColor} !important;
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

      main:has([role="tablist"]) h1:not(.markdown h1):not(.prose h1),
      main:has([role="tablist"]) h2:not(.markdown h2):not(.prose h2) {
        color: ${c.text1} !important;
        font-family: ${uiFont} !important;
        font-weight: ${strongWeight} !important;
        letter-spacing: 0 !important;
      }

      main:has([role="tablist"]) [role="tablist"] {
        border-color: ${c.border} !important;
        box-shadow: inset 0 -1px ${c.border} !important;
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

      form[data-type="unified"] button[aria-haspopup]:not([aria-expanded="true"]),
      form[data-type="unified"] [role="button"][aria-haspopup]:not([aria-expanded="true"]),
      form[data-type="unified"] button[data-state="active"]:not([aria-expanded="true"]),
      form[data-type="unified"] button[aria-pressed="true"]:not([aria-expanded="true"]),
      [data-testid="composer"] button[aria-haspopup]:not([aria-expanded="true"]),
      [data-testid="composer"] [role="button"][aria-haspopup]:not([aria-expanded="true"]),
      [data-testid="composer"] button[data-state="active"]:not([aria-expanded="true"]),
      [data-testid="composer"] button[aria-pressed="true"]:not([aria-expanded="true"]),
      form:has([data-testid*="prompt-textarea"]) button[aria-haspopup]:not([aria-expanded="true"]),
      form:has([data-testid*="prompt-textarea"]) [role="button"][aria-haspopup]:not([aria-expanded="true"]),
      form:has([data-testid*="prompt-textarea"]) button[data-state="active"]:not([aria-expanded="true"]),
      form:has([data-testid*="prompt-textarea"]) button[aria-pressed="true"]:not([aria-expanded="true"]),
      form:has(#prompt-textarea) button[aria-haspopup]:not([aria-expanded="true"]),
      form:has(#prompt-textarea) [role="button"][aria-haspopup]:not([aria-expanded="true"]),
      form:has(#prompt-textarea) button[data-state="active"]:not([aria-expanded="true"]),
      form:has(#prompt-textarea) button[aria-pressed="true"]:not([aria-expanded="true"]) {
        background-color: transparent !important;
        border-color: transparent !important;
        box-shadow: none !important;
      }

      form[data-type="unified"] button:hover,
      [data-testid="composer"] button:hover,
      form:has([data-testid*="prompt-textarea"]) button:hover,
      form:has(#prompt-textarea) button:hover,
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
      [data-testid="composer"] button svg,
      form:has([data-testid*="prompt-textarea"]) button svg,
      form:has(#prompt-textarea) button svg,
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
      button[aria-label*="Submit"]:hover,
      form[data-type="unified"] button[data-testid*="send"]:hover,
      form[data-type="unified"] button[aria-label*="Send"]:hover,
      form[data-type="unified"] button[aria-label*="Submit"]:hover,
      [data-testid="composer"] button[data-testid*="send"]:hover,
      [data-testid="composer"] button[aria-label*="Send"]:hover,
      [data-testid="composer"] button[aria-label*="Submit"]:hover,
      form:has([data-testid*="prompt-textarea"]) button[data-testid*="send"]:hover,
      form:has([data-testid*="prompt-textarea"]) button[aria-label*="Send"]:hover,
      form:has([data-testid*="prompt-textarea"]) button[aria-label*="Submit"]:hover,
      form:has(#prompt-textarea) button[data-testid*="send"]:hover,
      form:has(#prompt-textarea) button[aria-label*="Send"]:hover,
      form:has(#prompt-textarea) button[aria-label*="Submit"]:hover {
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

      input:not([type="range"]):not([type="checkbox"]):not([type="radio"]):not([type="file"]):not([type="hidden"]):not([type="color"]):not([type="button"]):not([type="submit"]):not([type="reset"]),
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

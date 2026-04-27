import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const CHATTHEMES = require('../src/themes.js');

const baseHtml = `<!doctype html><html><head></head><body>
  <main>
    <aside data-testid="sidebar">
      <a id="side-link" href="#"><svg width="10" height="10"></svg><span>Recent chat</span></a>
      <a id="side-active" data-state="active" href="#"><svg width="10" height="10"></svg><span>Active chat</span></a>
      <button id="side-heading" data-state="active">Recents</button>
      <button id="side-button"><svg width="10" height="10"></svg>New chat</button>
      <div class="text-token-text-tertiary uppercase" id="side-label">Projects</div>
    </aside>
    <section data-testid="conversation-turn" data-message-author-role="assistant">
      <div id="thought" data-testid="thought">Thought for 9s</div>
      <div class="markdown">
        <h1>Heading one</h1><h2>The big thing</h2><h3>Subhead</h3><h4>Small header</h4>
        <p>Paragraph with <a id="content-link" href="#">content link</a> and <strong>strong</strong>.</p>
        <ul><li>List item</li></ul>
        <blockquote><p>Quote text</p></blockquote>
        <table id="answer-table" class="min-w-full" style="min-width: 1000px"><thead><tr><th>One</th></tr></thead><tbody><tr><td>Two</td></tr></tbody></table>
        <div id="image-wrapper" style="overflow:hidden;max-height:24px"><img id="answer-image" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='80'%3E%3Crect width='120' height='80' fill='%23d97757'/%3E%3C/svg%3E" alt=""></div>
        <span id="image-span" class="overflow-hidden max-h-24" style="display:block;overflow:hidden;max-height:12px"><img id="nested-answer-image" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='60'%3E%3Crect width='100' height='60' fill='%2321808d'/%3E%3C/svg%3E" alt=""></span>
        <pre><code>const x = 1;</code></pre><code id="inline-code">inline</code>
        <details><summary>More</summary><p>Detail text</p></details>
      </div>
      <button id="message-action">Copy</button>
      <button id="source-chip" data-testid="sources"><svg></svg><span>Sources</span></button>
      <a id="action-link" role="button" href="#">Share</a>
    </section>
    <section data-message-author-role="user"><div class="bg-token-message-surface" id="user-bubble">User message</div></section>
    <button id="deep-research" data-testid="deep-research-button" aria-label="Deep research" class="text-blue-400 border-blue-400"><svg></svg>Deep research</button>
    <a href="/reports/example" id="report-card" data-testid="report-card">
      <h3>Deep Analysis of a Handwritten Page</h3>
      <p>The image shows a single page densely filled with handwritten digits arranged in rows.</p>
      <div id="report-fade" class="absolute bottom-0 bg-gradient-to-t from-black to-transparent"></div>
    </a>
    <form data-type="unified" id="composer">
      <div id="composer-nested" class="composer-nested-wrapper">
        <div data-testid="prompt-textarea" id="prompt-textarea" contenteditable="true">Ask anything</div>
        <button id="attach-button" aria-label="Attach files"><svg></svg></button>
        <button id="dictate-button" aria-label="Dictate"><svg></svg></button>
        <button id="send-button" data-testid="send-button" aria-label="Send"><svg></svg></button>
      </div>
    </form>
    <div role="tooltip" id="tooltip">Dictate <kbd>Ctrl+Shift+D</kbd></div>
    <button id="menu-trigger" aria-haspopup="menu" aria-expanded="true">Pro</button>
    <div role="menu" id="model-menu">
      <div role="menuitemradio" aria-checked="true" id="checked-menu-item">Standard <kbd>Ctrl</kbd></div>
      <div role="menuitemcheckbox" aria-checked="true" id="checked-checkbox-item"><svg></svg> Web search</div>
      <div role="separator" id="menu-separator"></div>
    </div>
    <div role="tablist" id="project-tabs"><button role="tab" aria-selected="true" id="active-tab">Chats</button><button role="tab" id="inactive-tab">Sources</button></div>
    <div data-testid="conversation-list" id="project-list"><a href="#" id="project-row">Aura AI Integration</a></div>
    <div role="table" id="role-project-table" aria-label="Chats"><div role="row" id="role-project-row"><div role="cell">Project chat</div></div></div>
    <div id="spinner" class="spinner bg-white" data-testid="spinner" aria-busy="true"><svg></svg></div>
    <div id="attachment" data-testid="attachment">file.pdf</div>
    <div id="dialog" role="dialog">
      <h2>Personalization</h2>
      <label>Reference memory</label>
      <button id="switch-off" role="switch" aria-checked="false"><span></span></button>
      <button id="switch-on" role="switch" aria-checked="true"><span></span></button>
    </div>
    <div id="combo" role="combobox">Model</div>
    <button id="scroll-bottom" aria-label="Scroll to bottom"><svg></svg></button>
    <div id="fade" class="sticky bottom-0 bg-gradient-to-t from-token-main-surface-primary to-transparent" style="background-image:linear-gradient(to top,var(--tw-gradient-stops));height:20px"></div>
  </main>
  <main id="library-main">
    <input id="library-search" placeholder="Search library">
    <div role="table" id="library-table" aria-label="Library">
      <div role="columnheader" id="library-header">Name</div>
      <div role="row" id="library-row"><div role="cell">sample.png</div></div>
    </div>
  </main>
</body></html>`;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1100, height: 800 } });
const checked = [];

for (const theme of CHATTHEMES.themes.filter(theme => theme.id !== 'default')) {
  for (const mode of ['light', 'dark']) {
    await page.setContent(baseHtml);
    await page.addStyleTag({ content: CHATTHEMES.buildCSS(theme, mode) });

    const values = await page.evaluate(() => {
      const styleById = id => getComputedStyle(document.getElementById(id));
      const styleBySelector = selector => getComputedStyle(document.querySelector(selector));
      return {
        bodyBg: getComputedStyle(document.body).backgroundColor,
        sideLinkColor: styleById('side-link').color,
        sideActiveBg: styleById('side-active').backgroundColor,
        sideActiveColor: styleById('side-active').color,
        sideHeadingBg: styleById('side-heading').backgroundColor,
        sideLabelColor: styleById('side-label').color,
        contentLinkColor: styleById('content-link').color,
        actionLinkColor: styleById('action-link').color,
        h2Font: styleBySelector('.markdown h2').fontFamily,
        h2Color: styleBySelector('.markdown h2').color,
        h4Color: styleBySelector('.markdown h4').color,
        markdownPWeight: styleBySelector('.markdown p').fontWeight,
        markdownStrongWeight: styleBySelector('.markdown strong').fontWeight,
        markdownTdWeight: styleBySelector('.markdown td').fontWeight,
        blockquoteBorder: styleBySelector('.markdown blockquote').borderLeftColor,
        tableBg: styleBySelector('.markdown table').backgroundColor,
        tableDisplay: styleById('answer-table').display,
        tableMinWidth: styleById('answer-table').minWidth,
        imageHeight: styleById('answer-image').height,
        imageWrapperOverflow: styleById('image-wrapper').overflow,
        imageWrapperMaxHeight: styleById('image-wrapper').maxHeight,
        imageSpanOverflow: styleById('image-span').overflow,
        imageSpanMaxHeight: styleById('image-span').maxHeight,
        nestedImageHeight: styleById('nested-answer-image').height,
        inlineCodeBg: styleById('inline-code').backgroundColor,
        sourceBg: styleById('source-chip').backgroundColor,
        sourceRadius: styleById('source-chip').borderRadius,
        actionBg: styleById('message-action').backgroundColor,
        bubbleBg: styleById('user-bubble').backgroundColor,
        deepResearchColor: styleById('deep-research').color,
        deepResearchBorder: styleById('deep-research').borderTopColor,
        reportBg: styleById('report-card').backgroundColor,
        reportBodyColor: styleBySelector('#report-card p').color,
        reportFadeDisplay: styleById('report-fade').display,
        composerOverflow: styleById('composer').overflow,
        composerBg: styleById('composer').backgroundColor,
        nestedShadow: styleById('composer-nested').boxShadow,
        nestedBorderTop: styleById('composer-nested').borderTopWidth,
        promptBg: styleById('prompt-textarea').backgroundColor,
        dictateColor: styleById('dictate-button').color,
        sendBg: styleById('send-button').backgroundColor,
        sendColor: styleById('send-button').color,
        tooltipBg: styleById('tooltip').backgroundColor,
        tooltipKbdBg: styleBySelector('#tooltip kbd').backgroundColor,
        menuTriggerBg: styleById('menu-trigger').backgroundColor,
        menuBg: styleById('model-menu').backgroundColor,
        menuCheckedBg: styleById('checked-menu-item').backgroundColor,
        menuCheckboxBg: styleById('checked-checkbox-item').backgroundColor,
        menuSeparatorBg: styleById('menu-separator').backgroundColor,
        menuKbdBg: styleBySelector('#checked-menu-item kbd').backgroundColor,
        activeTabBg: styleById('active-tab').backgroundColor,
        inactiveTabBg: styleById('inactive-tab').backgroundColor,
        projectListBg: styleById('project-list').backgroundColor,
        projectRowBg: styleById('project-row').backgroundColor,
        roleProjectTableBg: styleById('role-project-table').backgroundColor,
        roleProjectRowBg: styleById('role-project-row').backgroundColor,
        spinnerBg: styleById('spinner').backgroundColor,
        spinnerColor: styleById('spinner').color,
        thoughtColor: styleById('thought').color,
        attachmentBg: styleById('attachment').backgroundColor,
        dialogBg: styleById('dialog').backgroundColor,
        dialogHeadingColor: styleBySelector('#dialog h2').color,
        switchOffBg: styleById('switch-off').backgroundColor,
        switchOnBg: styleById('switch-on').backgroundColor,
        switchThumbBg: styleBySelector('#switch-on span').backgroundColor,
        comboBg: styleById('combo').backgroundColor,
        scrollBg: styleById('scroll-bottom').backgroundColor,
        scrollColor: styleById('scroll-bottom').color,
        libraryTableBg: styleById('library-table').backgroundColor,
        libraryRowBg: styleById('library-row').backgroundColor,
        libraryHeaderColor: styleById('library-header').color,
        fadeImage: styleById('fade').backgroundImage
      };
    });

    assert(values.bodyBg !== 'rgba(0, 0, 0, 0)', `${theme.id}/${mode}: body background is transparent`);
    assert(values.sideLinkColor !== values.contentLinkColor, `${theme.id}/${mode}: sidebar link matches content accent`);
    assert(values.sideActiveBg !== 'rgba(0, 0, 0, 0)', `${theme.id}/${mode}: active sidebar row background is transparent`);
    assert(values.sideActiveColor !== values.sideLinkColor, `${theme.id}/${mode}: active sidebar row did not get selected text color`);
    assert(values.sideHeadingBg === 'rgba(0, 0, 0, 0)', `${theme.id}/${mode}: sidebar section heading should not receive selected background`);
    assert(values.actionLinkColor !== values.contentLinkColor, `${theme.id}/${mode}: action link matches content accent`);
    assert(values.sideLabelColor !== values.contentLinkColor, `${theme.id}/${mode}: sidebar label matches content accent`);
    assert(values.h4Color === values.h2Color, `${theme.id}/${mode}: nested headers do not share heading color`);
    assert(Number.parseFloat(values.markdownPWeight) <= 450, `${theme.id}/${mode}: markdown paragraph weight is too heavy (${values.markdownPWeight})`);
    assert(Number.parseFloat(values.markdownTdWeight) <= 450, `${theme.id}/${mode}: markdown table cell weight is too heavy (${values.markdownTdWeight})`);
    assert(Number.parseFloat(values.markdownStrongWeight) <= 650, `${theme.id}/${mode}: markdown strong weight is too heavy (${values.markdownStrongWeight})`);
    assert(values.tableDisplay === 'table', `${theme.id}/${mode}: markdown table display is ${values.tableDisplay}`);
    assert(values.tableMinWidth === '0px', `${theme.id}/${mode}: markdown table min-width is ${values.tableMinWidth}`);
    assert(values.imageWrapperOverflow === 'visible', `${theme.id}/${mode}: image wrapper overflow is ${values.imageWrapperOverflow}`);
    assert(values.imageWrapperMaxHeight === 'none', `${theme.id}/${mode}: image wrapper max-height is ${values.imageWrapperMaxHeight}`);
    assert(Number.parseFloat(values.imageHeight) > 24, `${theme.id}/${mode}: answer image height appears clipped`);
    assert(values.imageSpanOverflow === 'visible', `${theme.id}/${mode}: nested image span overflow is ${values.imageSpanOverflow}`);
    assert(values.imageSpanMaxHeight === 'none', `${theme.id}/${mode}: nested image span max-height is ${values.imageSpanMaxHeight}`);
    assert(Number.parseFloat(values.nestedImageHeight) > 12, `${theme.id}/${mode}: nested answer image height appears clipped`);
    assert(values.sourceBg !== 'rgba(0, 0, 0, 0)', `${theme.id}/${mode}: source chip background is transparent`);
    assert(values.bubbleBg !== 'rgba(0, 0, 0, 0)', `${theme.id}/${mode}: user bubble background is transparent`);
    assert(values.deepResearchColor !== 'rgb(96, 165, 250)', `${theme.id}/${mode}: deep research mode kept Tailwind blue`);
    assert(values.deepResearchBorder !== 'rgb(96, 165, 250)', `${theme.id}/${mode}: deep research border kept Tailwind blue`);
    assert(values.reportBg !== 'rgba(0, 0, 0, 0)', `${theme.id}/${mode}: report card background is transparent`);
    assert(values.reportBodyColor !== 'rgba(0, 0, 0, 0)', `${theme.id}/${mode}: report card body is transparent`);
    assert(values.reportFadeDisplay === 'none', `${theme.id}/${mode}: report card fade still covers text`);
    assert(values.composerOverflow === 'visible', `${theme.id}/${mode}: composer overflow is ${values.composerOverflow}`);
    assert(values.composerBg !== 'rgba(0, 0, 0, 0)', `${theme.id}/${mode}: composer background is transparent`);
    assert(values.nestedShadow === 'none', `${theme.id}/${mode}: nested composer wrapper has unwanted shadow`);
    assert(values.nestedBorderTop === '0px', `${theme.id}/${mode}: nested composer wrapper has unwanted border`);
    assert(values.promptBg === 'rgba(0, 0, 0, 0)', `${theme.id}/${mode}: prompt textarea should stay transparent inside composer`);
    assert(values.dictateColor !== 'rgb(0, 0, 0)', `${theme.id}/${mode}: dictate button is black`);
    assert(values.sendBg !== 'rgba(0, 0, 0, 0)', `${theme.id}/${mode}: send button background is transparent`);
    assert(values.sendColor !== values.sendBg, `${theme.id}/${mode}: send button text matches background`);
    assert(values.tooltipBg !== 'rgba(0, 0, 0, 0)', `${theme.id}/${mode}: tooltip background is transparent`);
    assert(values.tooltipKbdBg !== 'rgba(0, 0, 0, 0)', `${theme.id}/${mode}: tooltip keyboard shortcut background is transparent`);
    assert(values.menuTriggerBg !== 'rgba(0, 0, 0, 0)', `${theme.id}/${mode}: open model trigger background is transparent`);
    assert(values.menuBg !== 'rgba(0, 0, 0, 0)', `${theme.id}/${mode}: model menu background is transparent`);
    assert(values.menuCheckedBg !== 'rgba(0, 0, 0, 0)', `${theme.id}/${mode}: checked menu item background is transparent`);
    assert(values.menuCheckboxBg !== 'rgba(0, 0, 0, 0)', `${theme.id}/${mode}: checked menu checkbox item background is transparent`);
    assert(values.menuSeparatorBg !== 'rgba(0, 0, 0, 0)', `${theme.id}/${mode}: menu separator background is transparent`);
    assert(values.menuKbdBg !== 'rgba(0, 0, 0, 0)', `${theme.id}/${mode}: menu keyboard shortcut background is transparent`);
    assert(values.activeTabBg !== 'rgba(0, 0, 0, 0)', `${theme.id}/${mode}: active project tab background is transparent`);
    assert(values.inactiveTabBg === 'rgba(0, 0, 0, 0)', `${theme.id}/${mode}: inactive project tab should stay transparent`);
    assert(values.projectListBg !== 'rgba(0, 0, 0, 0)', `${theme.id}/${mode}: project list background is transparent`);
    assert(values.projectRowBg === 'rgba(0, 0, 0, 0)', `${theme.id}/${mode}: project row should not be a solid block by default`);
    assert(values.roleProjectTableBg !== 'rgba(0, 0, 0, 0)', `${theme.id}/${mode}: role-based project table background is transparent`);
    assert(values.roleProjectRowBg === 'rgba(0, 0, 0, 0)', `${theme.id}/${mode}: role-based project row should not be a solid block by default`);
    assert(values.spinnerBg !== 'rgb(255, 255, 255)', `${theme.id}/${mode}: spinner still has white background`);
    assert(values.spinnerColor !== 'rgb(0, 0, 0)', `${theme.id}/${mode}: spinner is black`);
    assert(values.thoughtColor !== values.contentLinkColor, `${theme.id}/${mode}: thought/status text matches accent link color`);
    assert(values.dialogHeadingColor !== values.contentLinkColor, `${theme.id}/${mode}: dialog heading matches accent link color`);
    assert(values.switchOffBg !== 'rgba(0, 0, 0, 0)', `${theme.id}/${mode}: off switch background is transparent`);
    assert(values.switchOnBg !== values.switchOffBg, `${theme.id}/${mode}: checked switch does not differ from unchecked`);
    assert(values.switchThumbBg !== 'rgba(0, 0, 0, 0)', `${theme.id}/${mode}: switch thumb background is transparent`);
    assert(values.scrollBg !== 'rgba(0, 0, 0, 0)', `${theme.id}/${mode}: scroll-to-bottom button background is transparent`);
    assert(values.scrollColor !== 'rgb(128, 128, 128)', `${theme.id}/${mode}: scroll-to-bottom button stayed generic gray`);
    assert(values.libraryTableBg === 'rgba(0, 0, 0, 0)', `${theme.id}/${mode}: library table should not be a solid slab`);
    assert(values.libraryRowBg === 'rgba(0, 0, 0, 0)', `${theme.id}/${mode}: library row should stay transparent by default`);
    assert(values.libraryHeaderColor !== values.contentLinkColor, `${theme.id}/${mode}: library header matches accent link color`);
    assert(!values.fadeImage.includes('rgba(0, 0, 0, 0)'), `${theme.id}/${mode}: fade gradient still contains transparency`);
    checked.push(`${theme.id}/${mode}`);
  }
}

await browser.close();
console.log(`Render audit passed: ${checked.join(', ')}`);

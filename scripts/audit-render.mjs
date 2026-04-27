import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const CHATTHEMES = require('../src/themes.js');

const baseHtml = `<!doctype html><html><head></head><body>
  <main>
    <div id="hardcoded-dark-surface" class="bg-[#0d0d0d]" style="background-color:#0d0d0d">Hardcoded dark surface</div>
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
        <div id="code-shell" style="background:red;border:1px solid red;border-radius:24px;overflow:hidden">
          <pre id="answer-pre" style="margin:0;border-radius:0;background:#000;overflow:hidden"><code id="answer-pre-code" style="display:block;background:#fff;color:#000;border-radius:24px;border:1px solid blue;padding:20px">const x = 1;</code></pre>
        </div><code id="inline-code">inline</code>
        <details><summary>More</summary><p>Detail text</p></details>
      </div>
      <button id="message-action">Copy</button>
      <button id="source-chip" data-testid="sources"><svg></svg><span>Sources</span></button>
      <a id="action-link" role="button" href="#">Share</a>
    </section>
    <section data-testid="conversation-turn" id="image-turn">
      <div id="generated-image-card" class="group/imagegen-image overflow-hidden max-h-80" style="overflow:hidden;max-height:220px;width:500px">
        <img id="generated-image" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='500' height='420'%3E%3Crect width='500' height='420' fill='%23b56f09'/%3E%3Ctext x='100' y='235' font-size='120' fill='%23fff4df'%3Ecato%3C/text%3E%3C/svg%3E" alt="">
        <button id="generated-image-action">Edit</button>
      </div>
      <div id="generated-image-crop-frame" class="group/imagegen-image aspect-square overflow-hidden" style="position:relative;overflow:hidden;width:500px;height:360px;max-height:360px;aspect-ratio:1 / 1;border-radius:24px">
        <img id="generated-image-cover" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border-radius:24px;border:1px solid red" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='500' height='420'%3E%3Crect width='500' height='420' fill='%23b56f09'/%3E%3Ctext x='100' y='235' font-size='120' fill='%23fff4df'%3Ecato%3C/text%3E%3C/svg%3E" alt="">
      </div>
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
        <button id="active-model-chip" aria-haspopup="menu" data-state="active" class="bg-blue-500 text-white"><span class="bg-blue-600">x</span>Pro</button>
        <button id="dictate-button" aria-label="Dictate"><svg></svg></button>
        <button id="send-button" data-testid="send-button" aria-label="Send"><svg></svg></button>
      </div>
    </form>
    <form data-testid="composer" id="composer-alt">
      <div id="composer-alt-nested" style="overflow:hidden;max-height:18px;box-shadow:0 0 0 2px red;border-top:1px solid red">
        <div data-testid="prompt-textarea" id="prompt-alt" contenteditable="true">Ask anything</div>
        <button id="active-model-chip-alt" aria-haspopup="menu" data-state="active" class="bg-blue-500 text-white"><span class="bg-blue-600">x</span>Pro</button>
        <button id="dictate-button-alt" aria-label="Dictate"><svg></svg></button>
        <button id="send-button-alt" aria-label="Send"><svg></svg></button>
      </div>
    </form>
    <div role="tooltip" id="tooltip">Dictate <kbd>Ctrl+Shift+D</kbd></div>
    <div data-radix-popper-content-wrapper>
      <div id="shortcut-tooltip" data-side="bottom" data-align="center" style="background:#000;color:#fff;border:0">
        <span>Use Voice</span><kbd style="background:#222;color:#bbb;border:0">Ctrl+Alt+V</kbd>
      </div>
    </div>
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
  <main id="analytics-main">
    <h1 id="analytics-heading">Codex Analytics</h1>
    <div role="tablist" id="analytics-tabs"><button role="tab" aria-selected="true" id="analytics-active-tab">Usage</button><button role="tab" id="analytics-inactive-tab">Code review</button></div>
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
        hardcodedDarkSurfaceBg: styleById('hardcoded-dark-surface').backgroundColor,
        sideLinkColor: styleById('side-link').color,
        sideActiveBg: styleById('side-active').backgroundColor,
        sideActiveColor: styleById('side-active').color,
        sideHeadingBg: styleById('side-heading').backgroundColor,
        sideLabelColor: styleById('side-label').color,
        contentLinkColor: styleById('content-link').color,
        actionLinkColor: styleById('action-link').color,
        h2Font: styleBySelector('.markdown h2').fontFamily,
        h2Color: styleBySelector('.markdown h2').color,
        h2Weight: styleBySelector('.markdown h2').fontWeight,
        h4Color: styleBySelector('.markdown h4').color,
        markdownPWeight: styleBySelector('.markdown p').fontWeight,
        markdownStrongWeight: styleBySelector('.markdown strong').fontWeight,
        tableThWeight: styleBySelector('.markdown th').fontWeight,
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
        generatedImageCardOverflow: styleById('generated-image-card').overflow,
        generatedImageCardMaxHeight: styleById('generated-image-card').maxHeight,
        generatedImageHeight: styleById('generated-image').height,
        generatedImageRadius: styleById('generated-image').borderRadius,
        generatedImageBorderWidth: styleById('generated-image').borderTopWidth,
        generatedCropFrameHeight: styleById('generated-image-crop-frame').height,
        generatedCropFrameMaxHeight: styleById('generated-image-crop-frame').maxHeight,
        generatedCropFrameOverflow: styleById('generated-image-crop-frame').overflow,
        generatedCropFrameAspectRatio: styleById('generated-image-crop-frame').aspectRatio,
        generatedCoverPosition: styleById('generated-image-cover').position,
        generatedCoverObjectFit: styleById('generated-image-cover').objectFit,
        generatedCoverHeight: styleById('generated-image-cover').height,
        generatedCoverRadius: styleById('generated-image-cover').borderRadius,
        generatedCoverBorderWidth: styleById('generated-image-cover').borderTopWidth,
        generatedImageActionBg: styleById('generated-image-action').backgroundColor,
        inlineCodeBg: styleById('inline-code').backgroundColor,
        codeShellBg: styleById('code-shell').backgroundColor,
        codeShellBorderColor: styleById('code-shell').borderTopColor,
        codeShellOverflow: styleById('code-shell').overflow,
        preBg: styleById('answer-pre').backgroundColor,
        preRadius: styleById('answer-pre').borderRadius,
        preOverflowX: styleById('answer-pre').overflowX,
        preOverflowY: styleById('answer-pre').overflowY,
        prePaddingTop: styleById('answer-pre').paddingTop,
        preCodeBg: styleById('answer-pre-code').backgroundColor,
        preCodeRadius: styleById('answer-pre-code').borderRadius,
        preCodeBorderWidth: styleById('answer-pre-code').borderTopWidth,
        preCodePaddingTop: styleById('answer-pre-code').paddingTop,
        sourceBg: styleById('source-chip').backgroundColor,
        sourceRadius: styleById('source-chip').borderRadius,
        actionBg: styleById('message-action').backgroundColor,
        bubbleBg: styleById('user-bubble').backgroundColor,
        bubbleFont: styleById('user-bubble').fontFamily,
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
        promptFont: styleById('prompt-textarea').fontFamily,
        promptWeight: styleById('prompt-textarea').fontWeight,
        attachBg: styleById('attach-button').backgroundColor,
        activeModelChipBg: styleById('active-model-chip').backgroundColor,
        activeModelChipColor: styleById('active-model-chip').color,
        activeModelChipWeight: styleById('active-model-chip').fontWeight,
        activeModelChipInnerBg: styleBySelector('#active-model-chip span').backgroundColor,
        dictateColor: styleById('dictate-button').color,
        sendBg: styleById('send-button').backgroundColor,
        sendColor: styleById('send-button').color,
        composerAltOverflow: styleById('composer-alt').overflow,
        composerAltBg: styleById('composer-alt').backgroundColor,
        nestedAltOverflow: styleById('composer-alt-nested').overflow,
        nestedAltMaxHeight: styleById('composer-alt-nested').maxHeight,
        nestedAltShadow: styleById('composer-alt-nested').boxShadow,
        nestedAltBorderTop: styleById('composer-alt-nested').borderTopWidth,
        promptAltBg: styleById('prompt-alt').backgroundColor,
        activeModelChipAltBg: styleById('active-model-chip-alt').backgroundColor,
        activeModelChipAltColor: styleById('active-model-chip-alt').color,
        activeModelChipAltWeight: styleById('active-model-chip-alt').fontWeight,
        activeModelChipAltInnerBg: styleBySelector('#active-model-chip-alt span').backgroundColor,
        dictateAltColor: styleById('dictate-button-alt').color,
        sendAltBg: styleById('send-button-alt').backgroundColor,
        sendAltColor: styleById('send-button-alt').color,
        tooltipBg: styleById('tooltip').backgroundColor,
        tooltipBorderWidth: styleById('tooltip').borderTopWidth,
        tooltipKbdBg: styleBySelector('#tooltip kbd').backgroundColor,
        shortcutTooltipBg: styleById('shortcut-tooltip').backgroundColor,
        shortcutTooltipColor: styleById('shortcut-tooltip').color,
        shortcutTooltipBorderWidth: styleById('shortcut-tooltip').borderTopWidth,
        shortcutTooltipKbdBg: styleBySelector('#shortcut-tooltip kbd').backgroundColor,
        shortcutTooltipKbdColor: styleBySelector('#shortcut-tooltip kbd').color,
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
        analyticsHeadingFont: styleById('analytics-heading').fontFamily,
        analyticsHeadingColor: styleById('analytics-heading').color,
        analyticsTabsShadow: styleById('analytics-tabs').boxShadow,
        fadeImage: styleById('fade').backgroundImage
      };
    });

    assert(values.bodyBg !== 'rgba(0, 0, 0, 0)', `${theme.id}/${mode}: body background is transparent`);
    assert(values.hardcodedDarkSurfaceBg === values.bodyBg, `${theme.id}/${mode}: hardcoded ChatGPT dark surface kept ${values.hardcodedDarkSurfaceBg} instead of ${values.bodyBg}`);
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
    if (theme.id === 'claude') {
      assert(Number.parseFloat(values.h2Weight) <= 500, `${theme.id}/${mode}: Claude markdown heading weight is too heavy (${values.h2Weight})`);
      assert(Number.parseFloat(values.markdownStrongWeight) <= 500, `${theme.id}/${mode}: Claude markdown strong weight is too heavy (${values.markdownStrongWeight})`);
      assert(Number.parseFloat(values.tableThWeight) <= 500, `${theme.id}/${mode}: Claude markdown table header weight is too heavy (${values.tableThWeight})`);
      assert(values.bubbleFont !== values.h2Font, `${theme.id}/${mode}: user bubble inherited Claude article font`);
      assert(values.promptFont !== values.h2Font, `${theme.id}/${mode}: composer prompt inherited Claude article font`);
    }
    assert(values.tableDisplay === 'table', `${theme.id}/${mode}: markdown table display is ${values.tableDisplay}`);
    assert(values.tableMinWidth === '0px', `${theme.id}/${mode}: markdown table min-width is ${values.tableMinWidth}`);
    assert(values.imageWrapperOverflow === 'visible', `${theme.id}/${mode}: image wrapper overflow is ${values.imageWrapperOverflow}`);
    assert(values.imageWrapperMaxHeight === 'none', `${theme.id}/${mode}: image wrapper max-height is ${values.imageWrapperMaxHeight}`);
    assert(Number.parseFloat(values.imageHeight) > 24, `${theme.id}/${mode}: answer image height appears clipped`);
    assert(values.imageSpanOverflow === 'visible', `${theme.id}/${mode}: nested image span overflow is ${values.imageSpanOverflow}`);
    assert(values.imageSpanMaxHeight === 'none', `${theme.id}/${mode}: nested image span max-height is ${values.imageSpanMaxHeight}`);
    assert(Number.parseFloat(values.nestedImageHeight) > 12, `${theme.id}/${mode}: nested answer image height appears clipped`);
    assert(values.generatedImageCardOverflow === 'visible', `${theme.id}/${mode}: generated image card overflow is ${values.generatedImageCardOverflow}`);
    assert(values.generatedImageCardMaxHeight === 'none', `${theme.id}/${mode}: generated image card max-height is ${values.generatedImageCardMaxHeight}`);
    assert(Number.parseFloat(values.generatedImageHeight) > 220, `${theme.id}/${mode}: generated image appears clipped`);
    assert(values.generatedImageRadius === '0px', `${theme.id}/${mode}: generated image kept rounded corners`);
    assert(values.generatedImageBorderWidth === '0px', `${theme.id}/${mode}: generated image kept themed border`);
    assert(values.generatedCropFrameOverflow === 'visible', `${theme.id}/${mode}: aspect image frame overflow is ${values.generatedCropFrameOverflow}`);
    assert(values.generatedCropFrameMaxHeight === 'none', `${theme.id}/${mode}: aspect image frame max-height is ${values.generatedCropFrameMaxHeight}`);
    assert(values.generatedCropFrameAspectRatio === 'auto', `${theme.id}/${mode}: aspect image frame aspect-ratio is ${values.generatedCropFrameAspectRatio}`);
    assert(Number.parseFloat(values.generatedCropFrameHeight) > 360, `${theme.id}/${mode}: aspect image frame still crops height ${values.generatedCropFrameHeight}`);
    assert(values.generatedCoverPosition === 'static', `${theme.id}/${mode}: generated cover image position is ${values.generatedCoverPosition}`);
    assert(values.generatedCoverObjectFit === 'contain', `${theme.id}/${mode}: generated cover image object-fit is ${values.generatedCoverObjectFit}`);
    assert(Number.parseFloat(values.generatedCoverHeight) > 360, `${theme.id}/${mode}: generated cover image still appears cropped`);
    assert(values.generatedCoverRadius === '0px', `${theme.id}/${mode}: generated cover image kept rounded corners`);
    assert(values.generatedCoverBorderWidth === '0px', `${theme.id}/${mode}: generated cover image kept themed border`);
    assert(values.generatedImageActionBg === 'rgba(0, 0, 0, 0)', `${theme.id}/${mode}: generated image action should not be a solid block by default`);
    assert(values.inlineCodeBg !== 'rgba(0, 0, 0, 0)', `${theme.id}/${mode}: inline code lost its chip background`);
    assert(values.codeShellBg === 'rgba(0, 0, 0, 0)', `${theme.id}/${mode}: code wrapper kept its own background`);
    assert(values.codeShellBorderColor === 'rgba(0, 0, 0, 0)', `${theme.id}/${mode}: code wrapper kept its own border`);
    assert(values.codeShellOverflow === 'visible', `${theme.id}/${mode}: code wrapper clips rounded corners`);
    assert(values.preBg !== 'rgb(0, 0, 0)', `${theme.id}/${mode}: pre kept original black background`);
    assert(values.preRadius !== '0px', `${theme.id}/${mode}: pre has no rounded corners`);
    assert(values.preOverflowX === 'auto', `${theme.id}/${mode}: pre horizontal overflow is ${values.preOverflowX}`);
    assert(values.preOverflowY === 'hidden', `${theme.id}/${mode}: pre vertical overflow is ${values.preOverflowY}`);
    assert(values.prePaddingTop !== '0px', `${theme.id}/${mode}: pre lost code padding`);
    assert(values.preCodeBg === 'rgba(0, 0, 0, 0)', `${theme.id}/${mode}: inner pre code kept its own background`);
    assert(values.preCodeRadius === '0px', `${theme.id}/${mode}: inner pre code kept rounded corners`);
    assert(values.preCodeBorderWidth === '0px', `${theme.id}/${mode}: inner pre code kept border`);
    assert(values.preCodePaddingTop === '0px', `${theme.id}/${mode}: inner pre code kept padding`);
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
    assert(values.attachBg === 'rgba(0, 0, 0, 0)', `${theme.id}/${mode}: composer attach button background is ${values.attachBg}`);
    assert(Number.parseFloat(values.promptWeight) <= 450, `${theme.id}/${mode}: composer prompt weight is too heavy (${values.promptWeight})`);
    assert(values.activeModelChipBg !== 'rgb(59, 130, 246)', `${theme.id}/${mode}: composer active model chip kept Tailwind blue`);
    assert(values.activeModelChipColor !== values.activeModelChipBg, `${theme.id}/${mode}: composer active model chip text matches background`);
    assert(Number.parseFloat(values.activeModelChipWeight) <= 500, `${theme.id}/${mode}: composer model chip weight is too heavy (${values.activeModelChipWeight})`);
    assert(values.activeModelChipInnerBg !== 'rgb(37, 99, 235)', `${theme.id}/${mode}: composer active model chip inner icon kept Tailwind blue`);
    assert(values.dictateColor !== 'rgb(0, 0, 0)', `${theme.id}/${mode}: dictate button is black`);
    assert(values.sendBg !== 'rgba(0, 0, 0, 0)', `${theme.id}/${mode}: send button background is transparent`);
    assert(values.sendColor !== values.sendBg, `${theme.id}/${mode}: send button text matches background`);
    assert(values.composerAltOverflow === 'visible', `${theme.id}/${mode}: data-testid composer overflow is ${values.composerAltOverflow}`);
    assert(values.composerAltBg !== 'rgba(0, 0, 0, 0)', `${theme.id}/${mode}: data-testid composer background is transparent`);
    assert(values.nestedAltOverflow === 'visible', `${theme.id}/${mode}: data-testid composer nested overflow is ${values.nestedAltOverflow}`);
    assert(values.nestedAltMaxHeight === 'none', `${theme.id}/${mode}: data-testid composer nested max-height is ${values.nestedAltMaxHeight}`);
    assert(values.nestedAltShadow === 'none', `${theme.id}/${mode}: data-testid composer nested wrapper has unwanted shadow`);
    assert(values.nestedAltBorderTop === '0px', `${theme.id}/${mode}: data-testid composer nested wrapper has unwanted border`);
    assert(values.promptAltBg === 'rgba(0, 0, 0, 0)', `${theme.id}/${mode}: data-testid composer prompt should stay transparent`);
    assert(values.activeModelChipAltBg !== 'rgb(59, 130, 246)', `${theme.id}/${mode}: data-testid composer model chip kept Tailwind blue`);
    assert(values.activeModelChipAltColor !== values.activeModelChipAltBg, `${theme.id}/${mode}: data-testid composer model chip text matches background`);
    assert(Number.parseFloat(values.activeModelChipAltWeight) <= 500, `${theme.id}/${mode}: data-testid composer model chip weight is too heavy (${values.activeModelChipAltWeight})`);
    assert(values.activeModelChipAltInnerBg !== 'rgb(37, 99, 235)', `${theme.id}/${mode}: data-testid composer model chip inner icon kept Tailwind blue`);
    assert(values.dictateAltColor !== 'rgb(0, 0, 0)', `${theme.id}/${mode}: data-testid composer dictate button is black`);
    assert(values.sendAltBg !== 'rgba(0, 0, 0, 0)', `${theme.id}/${mode}: data-testid composer send button background is transparent`);
    assert(values.sendAltColor !== values.sendAltBg, `${theme.id}/${mode}: data-testid composer send button text matches background`);
    assert(values.tooltipBg !== 'rgba(0, 0, 0, 0)', `${theme.id}/${mode}: tooltip background is transparent`);
    assert(values.tooltipBg !== 'rgb(0, 0, 0)', `${theme.id}/${mode}: tooltip kept black background`);
    assert(values.tooltipBorderWidth !== '0px', `${theme.id}/${mode}: tooltip has no visible border`);
    assert(values.tooltipKbdBg !== 'rgba(0, 0, 0, 0)', `${theme.id}/${mode}: tooltip keyboard shortcut background is transparent`);
    assert(values.shortcutTooltipBg !== 'rgb(0, 0, 0)', `${theme.id}/${mode}: Radix shortcut tooltip kept black background`);
    assert(values.shortcutTooltipColor !== values.shortcutTooltipBg, `${theme.id}/${mode}: Radix shortcut tooltip text matches background`);
    assert(values.shortcutTooltipBorderWidth !== '0px', `${theme.id}/${mode}: Radix shortcut tooltip has no visible border`);
    assert(values.shortcutTooltipKbdBg !== 'rgb(34, 34, 34)', `${theme.id}/${mode}: Radix shortcut tooltip kbd kept default dark chip`);
    assert(values.shortcutTooltipKbdColor !== values.shortcutTooltipKbdBg, `${theme.id}/${mode}: Radix shortcut tooltip kbd text matches background`);
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
    if (theme.id === 'claude') {
      assert(values.analyticsHeadingFont !== values.h2Font, `${theme.id}/${mode}: utility page heading inherited Claude article heading font`);
    }
    assert(values.analyticsHeadingColor !== values.contentLinkColor, `${theme.id}/${mode}: utility page heading matches accent link color`);
    assert(values.analyticsTabsShadow !== 'none', `${theme.id}/${mode}: utility tablist lacks divider shadow`);
    assert(!values.fadeImage.includes('rgba(0, 0, 0, 0)'), `${theme.id}/${mode}: fade gradient still contains transparency`);
    checked.push(`${theme.id}/${mode}`);
  }
}

await browser.close();
console.log(`Render audit passed: ${checked.join(', ')}`);

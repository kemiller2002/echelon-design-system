#!/usr/bin/env node
/*
 * Render and accessibility tests for the Echelon application layer (1.1.0).
 *
 *   node tests/visual/run.cjs --forma-css PATH/forma-all.css [--out DIR]
 *
 * Serves tests/visual/fixture.html with Forma's released forma-all.css (1.0.1)
 * and this package's dist/echelon.css, dist/echelon-fonts.css and
 * dist/echelon-app.css over HTTP, then uses Playwright Chromium to check:
 *
 *   coverage   the fixture renders every echelon- class and data-echelon-* value
 *              in the CSS, every chip tone on the app bar, and a button or link
 *              on each surface (canvas, raised, sunken, accent, chrome)
 *   contrast   WCAG AA (4.5:1, 3:1 for large text) for EVERY visible text node
 *              and every pseudo-element with text content, measured against
 *              the composited background; at 1280px in light, dark, explicit
 *              light and explicit dark, and at 390px with 200% text in light and
 *              dark (where Forma's data-grid shows its ::before labels)
 *   focus      for every link and button, in light and dark: reaching it with
 *              Tab makes it :focus-visible, and a screenshot of it and its
 *              surroundings changes, with at least one CSS-pixel perimeter's
 *              worth of pixels whose focused colour has >= 3:1 contrast with
 *              their unfocused colour (WCAG 2.4.7, 1.4.11; 2.4.13's area test)
 *   reflow     no horizontal overflow at 390px with 200% text (light and dark)
 *   motion     no infinite animation and no shimmer under reduced motion (the
 *              skeleton's own computed style, since Forma's global reduced-motion
 *              rule would hide a missing Echelon rule); the shimmer does run
 *              without reduced motion, so the check is live
 *   chips      each tone has a non-empty label and a marker shape distinct from
 *              the other tones in its family, without using hue
 *   fonts      every @font-face loads from dist/fonts/ (document.fonts), and no
 *              text asks for an IBM Plex Mono weight that is not shipped
 *              (400, 500), which the browser would synthesize
 *   forced     under forced colours: borders and focus outlines stay visible,
 *              markers keep their shapes, and no brand colour is painted
 *
 * Writes screenshots and results.json to --out (default tests/visual/out) and
 * exits 1 when any check fails.
 */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..', '..');
const FIXTURE = '/tests/visual/fixture.html';
const SERVED = ['dist/', 'logos/', 'tests/visual/'];
const TYPES = { '.html': 'text/html', '.css': 'text/css', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
const FONT_FACES = [
  ['Manrope', 'normal', '400'], ['Manrope', 'normal', '650'],
  ['Newsreader', 'normal', '500'], ['Newsreader', 'italic', '400'],
  ['IBM Plex Mono', 'normal', '400'], ['IBM Plex Mono', 'normal', '500'],
];
const SHIPPED_WEIGHTS = { 'IBM Plex Mono': [400, 500], Manrope: [200, 800], Newsreader: [200, 800] };
const SCHEMES = [
  { name: 'light', colorScheme: 'light', theme: null },
  { name: 'dark', colorScheme: 'dark', theme: null },
  { name: 'explicit-dark', colorScheme: 'light', theme: 'dark' },
  { name: 'explicit-light', colorScheme: 'dark', theme: 'light' },
];
const SURFACES = ['canvas', 'raised', 'sunken', 'accent', 'chrome'];
const TONES = ['draft', 'review', 'published', 'ready', 'progress', 'complete', 'sealed', 'closed'];

const args = (argv) => Object.fromEntries(
  argv.flatMap((a, i) => (a.startsWith('--') ? [[a.slice(2), argv[i + 1]]] : [])));

const serve = (formaCss) => new Promise((resolve) => {
  const server = http.createServer((req, res) => {
    const url = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    const rel = url.replace(/^\/+/, '');
    const file = url === '/forma/forma-all.css' ? formaCss
      : SERVED.some((p) => rel.startsWith(p)) && !rel.includes('..') ? path.join(ROOT, rel) : null;
    if (!file || !fs.existsSync(file) || !fs.statSync(file).isFile()) { res.writeHead(404).end(); return; }
    res.writeHead(200, { 'content-type': TYPES[path.extname(file)] || 'application/octet-stream' });
    res.end(fs.readFileSync(file));
  });
  server.listen(0, '127.0.0.1', () => resolve(server));
});

// ---- In-page probes (run inside Chromium; read-only over the DOM) -----------

// Every visible text node and every pseudo-element with text content, with its
// colour composited over the backgrounds and opacities beneath it.
const probeContrast = () => {
  const parse = (c) => {
    const m = /rgba?\(([^)]+)\)/.exec(c || '');
    if (!m) return null;
    const p = m[1].split(/[\s,/]+/).filter(Boolean).map(Number);
    return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
  };
  const over = (top, alpha, under) => ({
    r: top.r * alpha + under.r * (1 - alpha), g: top.g * alpha + under.g * (1 - alpha),
    b: top.b * alpha + under.b * (1 - alpha), a: 1,
  });
  const lum = ({ r, g, b }) => {
    const f = (v) => { const s = v / 255; return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const hex = ({ r, g, b }) => '#' + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
  const chain = (el) => (el ? [...chain(el.parentElement), el] : []);
  const describe = (el) => el.tagName.toLowerCase() + [...el.classList].map((c) => '.' + c).join('');
  const visible = (el) => el.getClientRects().length > 0 && getComputedStyle(el).visibility === 'visible';
  const backdrop = (el) => chain(el).reduce((acc, node) => {
    const s = getComputedStyle(node);
    const alpha = acc.alpha * Number(s.opacity);
    const color = parse(s.backgroundColor);
    return {
      alpha,
      image: acc.image || (s.backgroundImage !== 'none' ? s.backgroundImage : null),
      bg: color && color.a > 0 ? over(color, color.a * alpha, acc.bg) : acc.bg,
    };
  }, { bg: { r: 255, g: 255, b: 255, a: 1 }, alpha: 1, image: null });
  const measure = (el, style, text, pseudo, under) => {
    const pseudoBg = parse(style.backgroundColor);
    const bg = pseudo && pseudoBg && pseudoBg.a > 0 ? over(pseudoBg, pseudoBg.a * under.alpha, under.bg) : under.bg;
    const color = parse(style.color);
    const fg = over(color, color.a * under.alpha * (pseudo ? Number(style.opacity) : 1), bg);
    const [hi, lo] = [lum(fg), lum(bg)].sort((x, y) => y - x);
    const ratio = (hi + 0.05) / (lo + 0.05);
    const size = parseFloat(style.fontSize);
    const large = size >= 24 || (size >= 18.66 && Number(style.fontWeight) >= 700);
    return { element: describe(el) + (pseudo || ''), text: text.slice(0, 40), fg: hex(fg), bg: hex(bg),
             ratio: Math.floor(ratio * 100) / 100, exact: ratio, need: large ? 3 : 4.5, image: under.image,
             family: style.fontFamily.split(',')[0].replace(/["']/g, '').trim(), weight: Number(style.fontWeight) };
  };
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const textNodes = [];
  for (let n = walker.nextNode(); n; n = walker.nextNode()) if (n.textContent.trim()) textNodes.push(n);
  const rendered = textNodes.filter((n) => visible(n.parentElement));
  const hidden = textNodes.filter((n) => !visible(n.parentElement)).map((n) => n.textContent.trim().slice(0, 40));
  const fromText = rendered.map((n) =>
    measure(n.parentElement, getComputedStyle(n.parentElement), n.textContent.trim(), null, backdrop(n.parentElement)));
  const fromPseudo = [...document.querySelectorAll('body *')].filter(visible).flatMap((el) =>
    ['::before', '::after'].flatMap((pseudo) => {
      const s = getComputedStyle(el, pseudo);
      const text = /^["']/.test(s.content) ? s.content.slice(1, -1).trim() : '';
      return text && s.display !== 'none' ? [measure(el, s, text, pseudo, backdrop(el))] : [];
    }));
  return { textNodes: textNodes.length, hidden, measuredText: fromText.length, measuredPseudo: fromPseudo.length,
           measured: [...fromText, ...fromPseudo] };
};

const probeChips = () => {
  const alpha = (c) => { const m = /rgba\([^)]*,\s*([\d.]+)\)/.exec(c); return m ? Number(m[1]) : (c === 'transparent' ? 0 : 1); };
  return [...document.querySelectorAll('.fx-chips[data-fx-family]')].map((list) => ({
    family: list.dataset.fxFamily,
    chips: [...list.querySelectorAll('.echelon-chip')].map((chip) => {
      const c = getComputedStyle(chip);
      const m = getComputedStyle(chip, '::before');
      const shape = {
        chipBorder: c.borderTopStyle,
        size: `${parseFloat(m.width).toFixed(1)}x${parseFloat(m.height).toFixed(1)}`,
        radius: m.borderTopLeftRadius,
        transform: m.transform,
        filled: alpha(m.backgroundColor) > 0,
        image: m.backgroundImage !== 'none',
        outlined: parseFloat(m.borderTopWidth) > 0 && m.borderTopStyle !== 'none',
      };
      return { tone: chip.dataset.echelonTone, label: chip.textContent.trim(), shape: JSON.stringify(shape),
               markerVisible: shape.filled || shape.image || shape.outlined };
    }),
  }));
};

const probeCoverage = ({ classes, attributes, tones }) => {
  const surfaceOf = (el) => (el.closest('.echelon-app-bar') ? 'chrome'
    : el.closest('.echelon-panel[data-echelon-surface="sunken"]') ? 'sunken'
      : el.closest('.echelon-panel[data-echelon-surface="accent"]') ? 'accent'
        : el.closest('.echelon-panel') ? 'raised' : 'canvas');
  const interactive = [...document.querySelectorAll('a[href], button')];
  // A busy panel must say so in text: a visible .echelon-loading with role="status".
  const busyWithoutStatus = [...document.querySelectorAll('.echelon-panel[aria-busy="true"]')]
    .filter((panel) => ![...panel.querySelectorAll('.echelon-loading[role="status"]')]
      .some((el) => el.getClientRects().length > 0 && getComputedStyle(el).visibility === 'visible' && el.textContent.trim()))
    .map((panel) => panel.id || panel.getAttribute('aria-labelledby') || 'panel');
  const linksOutsideGrids = (selector) => [...document.querySelectorAll(selector)]
    .some((a) => !a.closest('.forma-data-grid'));
  return {
    busyPanels: document.querySelectorAll('.echelon-panel[aria-busy="true"]').length,
    busyWithoutStatus,
    panelLinks: {
      raised: linksOutsideGrids('.echelon-panel:not([data-echelon-surface]) a[href]:not(.forma-button)'),
      sunken: linksOutsideGrids('.echelon-panel[data-echelon-surface="sunken"] a[href]:not(.forma-button)'),
      accent: linksOutsideGrids('.echelon-panel[data-echelon-surface="accent"] a[href]:not(.forma-button)'),
    },
    barDanger: Boolean(document.querySelector('.echelon-app-bar .forma-button[data-echelon-emphasis="danger"]')),
    // Link-bearing components inside raised, sunken and accent panels.
    missingComponents: ['raised', 'sunken', 'accent'].flatMap((surface) => {
      const panel = surface === 'raised' ? '.echelon-panel:not([data-echelon-surface])' : `.echelon-panel[data-echelon-surface="${surface}"]`;
      return ['.forma-pagination a[aria-current="page"]', '.forma-validation-summary a', '.echelon-nav-tabs a[aria-current="page"]',
              '.forma-menu__list a', '.forma-master-detail__master a', '.forma-surface a', '.forma-data-grid th a',
              '.forma-fault--inline a', '.forma-segmented a', 'a.forma-card__link']
        .filter((c) => !document.querySelector(`${panel} ${c}`)).map((c) => `${surface}: ${c}`);
    }),
    missingClasses: classes.filter((c) => !document.querySelector('.' + c)),
    missingAttributes: attributes.filter(([a, v]) => !document.querySelector(`[${a}="${v}"]`)).map(([a, v]) => `${a}="${v}"`),
    missingBarTones: tones.filter((t) => !document.querySelector(`.echelon-app-bar .echelon-chip[data-echelon-tone="${t}"]`)),
    surfaces: [...new Set(interactive.map(surfaceOf))].sort(),
  };
};

// Current and inactive tabs must differ by colour (>= 1.5:1 between the two
// text colours) or weight (>= 100), not only by the underline.
const probeTabs = () => {
  const rgb = (c) => (/rgba?\(([^)]+)\)/.exec(c) || [0, '0,0,0'])[1].split(/[\s,/]+/).slice(0, 3).map(Number);
  const lum = ([r, g, b]) => {
    const f = (v) => { const s = v / 255; return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  return [...document.querySelectorAll('.echelon-nav-tabs')].flatMap((nav) => {
    const current = nav.querySelector('a[aria-current="page"]');
    const where = nav.closest('.echelon-panel') ? (nav.closest('.echelon-panel').dataset.echelonSurface || 'raised') : 'canvas';
    return [...nav.querySelectorAll('a:not([aria-current="page"])')].map((other) => {
      const a = getComputedStyle(current);
      const b = getComputedStyle(other);
      const [hi, lo] = [lum(rgb(a.color)), lum(rgb(b.color))].sort((x, y) => y - x);
      const colourRatio = Math.floor(((hi + 0.05) / (lo + 0.05)) * 100) / 100;
      const weightDiff = Number(a.fontWeight) - Number(b.fontWeight);
      return { where, tab: other.textContent.trim(), colourRatio, weightDiff, pass: colourRatio >= 1.5 || weightDiff >= 100 };
    });
  });
};

const probeFonts = async (faces) => {
  const within = (promise, fallback) => Promise.race([promise.catch(() => fallback),
    new Promise((resolve) => setTimeout(() => resolve(fallback), 10000))]);
  await within(document.fonts.ready, null);
  const loaded = await Promise.all(faces.map(async ([family, style, weight]) => {
    const found = await within(document.fonts.load(`${style} ${weight} 16px "${family}"`, 'Echelon'), []);
    return { family, style, weight,
             loaded: found.filter((f) => f.family.replace(/["']/g, '') === family && f.status === 'loaded').length };
  }));
  const requests = performance.getEntriesByType('resource').filter((e) => e.name.endsWith('.woff2'))
    .map((e) => ({ url: new URL(e.name).pathname, status: e.responseStatus }));
  return { loaded, requests };
};

const probeForced = (brandColours) => {
  const alpha = (c) => { const m = /rgba\([^)]*,\s*([\d.]+)\)/.exec(c); return m ? Number(m[1]) : (c === 'transparent' ? 0 : 1); };
  const hex = (c) => { const m = /rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(c); return m ? '#' + m.slice(1, 4).map((v) => Number(v).toString(16).padStart(2, '0')).join('') : c; };
  const sides = ['Top', 'Right', 'Bottom', 'Left'];
  const bordered = (s) => sides.some((d) => parseFloat(s[`border${d}Width`]) > 0 && s[`border${d}Style`] !== 'none' && alpha(s[`border${d}Color`]) > 0);
  const describe = (el) => el.tagName.toLowerCase() + [...el.classList].map((c) => '.' + c).join('');
  const borders = [...document.querySelectorAll('.echelon-app-bar, .echelon-panel, .echelon-chip, .echelon-nav-tabs')]
    .filter((el) => !bordered(getComputedStyle(el))).map(describe);
  const props = ['color', 'backgroundColor', 'borderTopColor', 'borderBottomColor', 'borderLeftColor', 'outlineColor'];
  const painted = [...document.querySelectorAll('[class*="echelon-"], [data-echelon-emphasis]')].flatMap((el) =>
    [null, '::before'].flatMap((pseudo) => {
      const s = getComputedStyle(el, pseudo);
      return props.filter((p) => brandColours.includes(hex(s[p]))).map((p) => `${describe(el)}${pseudo || ''} ${p} ${hex(s[p])}`);
    }));
  return { forced: matchMedia('(forced-colors: active)').matches, borders, painted };
};

// Decodes two PNG screenshots (base64) in a blank page and compares them pixel
// by pixel: how many pixels changed at all, and how many changed with >= 3:1
// contrast between their unfocused and focused colours.
const probeDiff = async ([before, after]) => {
  const pixels = async (b64) => {
    const bitmap = await createImageBitmap(await (await fetch('data:image/png;base64,' + b64)).blob());
    const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
    const context = canvas.getContext('2d');
    context.drawImage(bitmap, 0, 0);
    return context.getImageData(0, 0, bitmap.width, bitmap.height).data;
  };
  const [a, b] = await Promise.all([pixels(before), pixels(after)]);
  const lum = (d, i) => {
    const f = (v) => { const s = v / 255; return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; };
    return 0.2126 * f(d[i]) + 0.7152 * f(d[i + 1]) + 0.0722 * f(d[i + 2]);
  };
  const counts = { changed: 0, strong: 0, maxRatio: 1 };
  for (let i = 0; i < a.length; i += 4) {
    if (a[i] !== b[i] || a[i + 1] !== b[i + 1] || a[i + 2] !== b[i + 2]) {
      const [hi, lo] = [lum(a, i), lum(b, i)].sort((x, y) => y - x);
      const ratio = (hi + 0.05) / (lo + 0.05);
      counts.changed += 1;
      counts.strong += ratio >= 3 ? 1 : 0;
      counts.maxRatio = Math.max(counts.maxRatio, ratio);
    }
  }
  return { ...counts, maxRatio: Math.floor(counts.maxRatio * 100) / 100 };
};

// ---- Checks (Node side) ------------------------------------------------------

const vocabulary = (css) => ({
  classes: [...new Set([...css.matchAll(/\.(echelon-[\w-]+)/g)].map((m) => m[1]))].filter((c) => !c.startsWith('echelon-shimmer')),
  attributes: [...new Set([...css.matchAll(/\[(data-echelon-[\w-]+)="([\w-]+)"\]/g)].map((m) => `${m[1]}=${m[2]}`))]
    .map((p) => p.split('=')),
  tones: TONES,
});

const brandColours = (...sheets) => [...new Set(sheets.flatMap((css) =>
  [...css.matchAll(/#([0-9a-f]{6})\b/gi)].map((m) => '#' + m[1].toLowerCase())))];

const openPage = async (browser, options, theme, url) => {
  const context = await browser.newContext(options);
  const page = await context.newPage();
  page.setDefaultTimeout(30000);
  await page.goto(url);
  if (theme) await page.evaluate((t) => document.documentElement.setAttribute('data-forma-theme', t), theme);
  await page.evaluate(() => Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 10000))]));
  return { context, page };
};

const tabThrough = async (page, limit) => {
  const step = async (n, acc) => {
    if (n >= limit) return acc;
    await page.keyboard.press('Tab');
    const stop = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el || el === document.body) return null;
      // Forma's stretched card link puts its focus outline on the card.
      const s = getComputedStyle(el.matches('.forma-card__link') && el.closest('.forma-card') || el);
      const alpha = (c) => { const m = /rgba\([^)]*,\s*([\d.]+)\)/.exec(c); return m ? Number(m[1]) : (c === 'transparent' ? 0 : 1); };
      return { id: el.dataset.fxId, element: el.tagName.toLowerCase() + ' "' + (el.textContent || '').trim().slice(0, 24) + '"',
               outline: s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) > 0 && alpha(s.outlineColor) > 0 };
    });
    return stop === null || acc.some((s) => s.id === stop.id) ? acc : step(n + 1, [...acc, stop]);
  };
  return step(0, []);
};

const tagInteractive = (page) => page.evaluate(() => [...document.querySelectorAll('a[href], button')].map((el, i) => {
  el.dataset.fxId = String(i);
  const surface = el.closest('.echelon-app-bar') ? 'chrome'
    : el.closest('.echelon-panel[data-echelon-surface="sunken"]') ? 'sunken'
      : el.closest('.echelon-panel[data-echelon-surface="accent"]') ? 'accent'
        : el.closest('.echelon-panel') ? 'raised' : 'canvas';
  return { id: String(i), surface, label: `${el.tagName.toLowerCase()}${el.dataset.echelonEmphasis ? '[' + el.dataset.echelonEmphasis + ']' : ''} "${el.textContent.trim().slice(0, 24)}"` };
}));

// Forced colours drop box-shadows, so there the outline itself must show.
const forcedFocus = async (page) => {
  const targets = await tagInteractive(page);
  const stops = await tabThrough(page, targets.length + 2);
  const bad = stops.filter((s) => !s.outline).map((s) => s.element);
  return { total: targets.length, reached: stops.length, bad, pass: stops.length === targets.length && bad.length === 0 };
};

// Screenshot each element and its surroundings unfocused and keyboard-focused,
// and require a visible change with >= 3:1 contrast over at least one
// CSS-pixel perimeter of the element.
const focusVisual = async (browser, colorScheme, url, out) => {
  const { context, page } = await openPage(browser, { viewport: { width: 1280, height: 900 }, colorScheme }, null, url);
  const differ = await context.newPage();
  const targets = await tagInteractive(page);
  const one = async (target, index) => {
    await page.mouse.move(0, 0);
    // Reach the element with the keyboard: focus its neighbour, then Tab (or
    // Shift+Tab for the first element) so the focus is keyboard focus.
    const neighbour = index > 0 ? targets[index - 1].id : targets[1].id;
    await page.evaluate(({ id, from }) => {
      if (document.activeElement) document.activeElement.blur();
      document.querySelector(`[data-fx-id="${id}"]`).scrollIntoView({ block: 'center' });
      document.querySelector(`[data-fx-id="${from}"]`).focus({ preventScroll: true });
    }, { id: target.id, from: neighbour });
    await page.keyboard.press(index > 0 ? 'Tab' : 'Shift+Tab');
    await page.waitForTimeout(150);
    const state = await page.evaluate((id) => {
      const el = document.activeElement;
      const target = document.querySelector(`[data-fx-id="${id}"]`);
      // Forma's stretched card link draws its focus ring on the card (inset),
      // not on the link: measure the card, against the card's own perimeter.
      const indicator = target.matches('.forma-card__link') && target.closest('.forma-card') || target;
      const r = indicator.getBoundingClientRect();
      return { focused: el && el.dataset.fxId === id, visible: el ? el.matches(':focus-visible') : false,
               box: { x: r.x, y: r.y, width: r.width, height: r.height }, vw: innerWidth, vh: innerHeight };
    }, target.id);
    const pad = 12;
    const x = Math.max(0, Math.floor(state.box.x - pad));
    const y = Math.max(0, Math.floor(state.box.y - pad));
    const clip = { x, y, width: Math.min(state.vw - x, Math.ceil(state.box.width + 2 * pad)),
                   height: Math.min(state.vh - y, Math.ceil(state.box.height + 2 * pad)) };
    const after = await page.screenshot({ clip });
    await page.evaluate(() => document.activeElement && document.activeElement.blur());
    await page.waitForTimeout(150);
    const before = await page.screenshot({ clip });
    const diff = await differ.evaluate(probeDiff, [before.toString('base64'), after.toString('base64')]);
    const perimeter = Math.round(2 * (state.box.width + state.box.height));
    const pass = state.focused && state.visible && diff.strong >= perimeter;
    if (!pass) fs.writeFileSync(path.join(out, `focus-fail-${colorScheme}-${target.id}.png`), after);
    return { ...target, colorScheme, focused: state.focused, focusVisible: state.visible, perimeter, ...diff, pass };
  };
  const results = await targets.reduce(async (acc, target, i) => [...await acc, await one(target, i)], Promise.resolve([]));
  await context.close();
  return results;
};

const contrastVerdict = (name, probe) => {
  const unique = [...new Map(probe.measured.map((p) => [`${p.fg}|${p.bg}|${p.need}`, p])).values()];
  const fails = probe.measured.filter((p) => p.exact < p.need || p.image);
  // Every rendered text node is measured; text that is not rendered (e.g.
  // Forma hiding pagination pages at narrow widths) is listed, not measured.
  return { name: `contrast (${name})`,
           pass: fails.length === 0 && probe.measuredText + probe.hidden.length === probe.textNodes && probe.measuredText > 0,
           detail: { textNodes: probe.textNodes, hidden: probe.hidden, measuredText: probe.measuredText,
                     measuredPseudo: probe.measuredPseudo, uniquePairs: unique.length,
                     minRatio: Math.min(...probe.measured.map((p) => p.ratio)),
                     fails: fails.map(({ exact, ...p }) => p) },
           pairs: unique.map(({ exact, ...p }) => p) };
};

const weightVerdict = (name, probe) => {
  const bad = probe.measured.filter((p) => SHIPPED_WEIGHTS[p.family] && (
    p.family === 'IBM Plex Mono' ? !SHIPPED_WEIGHTS[p.family].includes(p.weight)
      : p.weight < SHIPPED_WEIGHTS[p.family][0] || p.weight > SHIPPED_WEIGHTS[p.family][1]));
  return { name: `fonts: no synthesized weights (${name})`, pass: bad.length === 0,
           detail: [...new Set(bad.map((p) => `${p.element} ${p.family} ${p.weight}`))] };
};

async function main() {
  const opts = args(process.argv.slice(2));
  if (!opts['forma-css']) throw new Error('--forma-css PATH is required (Forma 1.0.1 forma-all.css)');
  const out = path.resolve(opts.out || path.join(__dirname, 'out'));
  fs.mkdirSync(out, { recursive: true });
  const appCss = fs.readFileSync(path.join(ROOT, 'dist/echelon-app.css'), 'utf8');
  const brandCss = fs.readFileSync(path.join(ROOT, 'dist/echelon.css'), 'utf8');
  const server = await serve(path.resolve(opts['forma-css']));
  const url = `http://127.0.0.1:${server.address().port}${FIXTURE}`;
  const browser = await chromium.launch();
  const shot = (page, name) => page.screenshot({ path: path.join(out, `${name}.png`), fullPage: true });

  const perScheme = async (scheme) => {
    const { context, page } = await openPage(browser, { viewport: { width: 1280, height: 900 }, colorScheme: scheme.colorScheme }, scheme.theme, url);
    await shot(page, `fixture-${scheme.name}`);
    const contrast = await page.evaluate(probeContrast);
    const coverage = await page.evaluate(probeCoverage, vocabulary(appCss));
    const chips = await page.evaluate(probeChips);
    const fonts = await page.evaluate(probeFonts, FONT_FACES);
    const tabs = await page.evaluate(probeTabs);
    await context.close();
    return { scheme: scheme.name, contrast, coverage, chips, fonts, tabs };
  };
  const schemes = await Promise.all(SCHEMES.map(perScheme));

  const reflow = await Promise.all(['light', 'dark'].map(async (colorScheme) => {
    const { context, page } = await openPage(browser, { viewport: { width: 390, height: 844 }, colorScheme }, null, url);
    await page.addStyleTag({ content: 'html { font-size: 200% !important; }' });
    await page.waitForTimeout(150);
    const r = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth, innerWidth,
      offenders: [...document.querySelectorAll('body *')].filter((e) => e.getBoundingClientRect().right > innerWidth + 1
        && !e.closest('.forma-data-grid')).slice(0, 8).map((e) => e.tagName.toLowerCase() + '.' + [...e.classList].join('.')),
    }));
    const contrast = await page.evaluate(probeContrast);
    await shot(page, `reflow-390-text200-${colorScheme}`);
    await context.close();
    return { colorScheme, ...r, contrast, pass: r.scrollWidth <= r.innerWidth };
  }));

  const focus = [...await focusVisual(browser, 'light', url, out), ...await focusVisual(browser, 'dark', url, out)];

  const motion = await Promise.all(['reduce', 'no-preference'].map(async (reducedMotion) => {
    const { context, page } = await openPage(browser, { reducedMotion }, null, url);
    await page.waitForTimeout(150);
    const running = await page.evaluate(() => document.getAnimations()
      .filter((a) => a.playState === 'running' && a.effect && a.effect.getComputedTiming().iterations === Infinity)
      .map((a) => a.animationName || 'animation'));
    const shimmer = await page.evaluate(() => [...document.querySelectorAll('.echelon-skeleton-line')]
      .filter((el) => { const s = getComputedStyle(el); return s.animationName !== 'none' || s.backgroundImage !== 'none'; }).length);
    await context.close();
    return { reducedMotion, running, shimmer };
  }));

  const forced = await (async () => {
    const { context, page } = await openPage(browser, { viewport: { width: 1280, height: 900 }, forcedColors: 'active' }, null, url);
    await shot(page, 'fixture-forced-colors');
    const result = await page.evaluate(probeForced, brandColours(appCss, brandCss));
    const chips = await page.evaluate(probeChips);
    const focusResult = await forcedFocus(page);
    await context.close();
    return { ...result, chips, focus: focusResult };
  })();

  await browser.close();
  server.close();

  // ---- Verdicts --------------------------------------------------------------
  const chipVerdict = (families) => families.flatMap(({ family, chips }) => [
    ...chips.filter((c) => !c.label).map((c) => `${family}/${c.tone}: no text label`),
    ...chips.filter((c) => !c.markerVisible).map((c) => `${family}/${c.tone}: marker not visible`),
    ...chips.filter((c, i) => chips.some((d, j) => j !== i && d.shape === c.shape)).map((c) => `${family}/${c.tone}: marker shape not distinct`),
  ]);
  const contrastChecks = [
    ...schemes.map((s) => contrastVerdict(s.scheme, s.contrast)),
    ...reflow.map((r) => contrastVerdict(`390px 200% ${r.colorScheme}`, r.contrast)),
  ];
  const focusSurfaces = (scheme) => [...new Set(focus.filter((f) => f.colorScheme === scheme).map((f) => f.surface))].sort();
  const checks = [
    ...schemes.map((s) => ({ name: `coverage (${s.scheme})`,
      pass: !s.coverage.missingClasses.length && !s.coverage.missingAttributes.length && !s.coverage.missingBarTones.length
        && SURFACES.every((x) => s.coverage.surfaces.includes(x))
        && Object.values(s.coverage.panelLinks).every(Boolean) && s.coverage.barDanger
        && s.coverage.missingComponents.length === 0, detail: s.coverage })),
    ...schemes.map((s) => ({ name: `nav tabs: current differs from inactive by more than the rule (${s.scheme})`,
      pass: s.tabs.length >= 4 && s.tabs.every((x) => x.pass), detail: s.tabs.filter((x) => !x.pass) })),
    ...schemes.map((s) => ({ name: `busy panels show a loading status (${s.scheme})`,
      pass: s.coverage.busyPanels > 0 && s.coverage.busyWithoutStatus.length === 0,
      detail: { busyPanels: s.coverage.busyPanels, withoutStatus: s.coverage.busyWithoutStatus } })),
    ...contrastChecks.map(({ pairs, ...c }) => c),
    ...['light', 'dark'].map((scheme) => {
      const rows = focus.filter((f) => f.colorScheme === scheme);
      const bad = rows.filter((f) => !f.pass);
      return { name: `focus indicator visible, >= 3:1 change (${scheme})`,
               pass: bad.length === 0 && rows.length > 0 && SURFACES.every((x) => focusSurfaces(scheme).includes(x)),
               detail: { elements: rows.length, surfaces: focusSurfaces(scheme),
                         minStrongOverPerimeter: Math.min(...rows.map((f) => Math.floor((f.strong / f.perimeter) * 100) / 100)),
                         fails: bad.map((f) => `${f.surface} ${f.label}: focused=${f.focused} focusVisible=${f.focusVisible} strong=${f.strong}/${f.perimeter} changed=${f.changed} max=${f.maxRatio}`) } };
    }),
    ...schemes.map((s) => ({ name: `chips (${s.scheme})`, pass: chipVerdict(s.chips).length === 0 && s.chips.length === 2, detail: chipVerdict(s.chips) })),
    ...schemes.map((s) => ({
      name: `fonts load (${s.scheme})`,
      pass: s.fonts.loaded.every((f) => f.loaded > 0) && s.fonts.requests.length === 5
        && s.fonts.requests.every((r) => r.url.startsWith('/dist/fonts/') && r.status === 200),
      detail: s.fonts,
    })),
    ...schemes.map((s) => weightVerdict(s.scheme, s.contrast)),
    ...reflow.map((r) => ({ name: `reflow 390px, 200% text (${r.colorScheme})`, pass: r.pass, detail: (({ contrast, ...x }) => x)(r) })),
    { name: 'motion: no infinite animation under reduced motion', pass: motion[0].running.length === 0, detail: motion[0] },
    { name: 'motion: no shimmer declared under reduced motion', pass: motion[0].shimmer === 0, detail: motion[0] },
    { name: 'motion: shimmer runs without reduced motion (check is live)',
      pass: motion[1].running.includes('echelon-shimmer') && motion[1].shimmer > 0, detail: motion[1] },
    { name: 'forced colours: media active', pass: forced.forced, detail: forced.forced },
    { name: 'forced colours: borders kept', pass: forced.borders.length === 0, detail: forced.borders },
    { name: 'forced colours: no brand colour painted', pass: forced.painted.length === 0, detail: forced.painted },
    { name: 'forced colours: chip markers keep distinct shapes', pass: chipVerdict(forced.chips).length === 0, detail: chipVerdict(forced.chips) },
    { name: 'forced colours: focus outline visible', pass: forced.focus.pass, detail: forced.focus },
  ];
  const contrast = contrastChecks.map((c) => ({ check: c.name, pairs: c.pairs }));
  fs.writeFileSync(path.join(out, 'results.json'), JSON.stringify({ checks, contrast, focus }, null, 2) + '\n');
  checks.forEach((c) => console.log(`${c.pass ? 'PASS' : 'FAIL'}: ${c.name}${c.pass ? '' : '\n      ' + JSON.stringify(c.detail)}`));
  contrastChecks.forEach((c) => console.log(`${c.name}: ${c.detail.textNodes} text nodes (${c.detail.measuredText} rendered and measured, ${c.detail.hidden.length} not rendered), ${c.detail.measuredPseudo} text pseudo-elements, ${c.detail.uniquePairs} unique pairs, min ${c.detail.minRatio}:1`));
  ['light', 'dark'].forEach((scheme) => {
    const rows = focus.filter((f) => f.colorScheme === scheme);
    console.log(`focus ${scheme}: ${rows.length} elements on ${focusSurfaces(scheme).join(', ')}; weakest has ${Math.min(...rows.map((f) => f.strong))} px at >= 3:1 (needs one perimeter)`);
  });
  const failed = checks.filter((c) => !c.pass).length;
  console.log(`${checks.length - failed} passed, ${failed} failed`);
  process.exitCode = failed ? 1 : 0;
}

main().catch((error) => { console.error(error); process.exitCode = 1; });

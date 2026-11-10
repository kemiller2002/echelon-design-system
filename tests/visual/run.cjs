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
 *   coverage      the fixture renders every echelon- class and data-echelon-* value in the CSS
 *   contrast      WCAG AA for every text pair (light, dark, explicit light, explicit dark)
 *   focus         every interactive element shows a visible keyboard focus indicator
 *   reflow        no horizontal overflow at 390px wide with 200% text (light and dark)
 *   motion        no infinite animation runs under prefers-reduced-motion: reduce
 *                 (and the shimmer does run without it, so the check is live)
 *   chips         each tone has a non-empty label and a marker shape distinct from
 *                 the other tones in its family, without using hue
 *   fonts         every @font-face loads from dist/fonts/ (document.fonts)
 *   forced        under forced colours: borders and focus stay visible, markers keep
 *                 their shape, and no brand colour is painted
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
const SCHEMES = [
  { name: 'light', colorScheme: 'light', theme: null },
  { name: 'dark', colorScheme: 'dark', theme: null },
  { name: 'explicit-dark', colorScheme: 'light', theme: 'dark' },
  { name: 'explicit-light', colorScheme: 'dark', theme: 'light' },
];

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

// ---- In-page probes (run inside Chromium; pure over the DOM) ---------------

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
  const ownText = (el) => [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
  const visible = (el) => el.getClientRects().length > 0 && getComputedStyle(el).visibility === 'visible';
  return [...document.querySelectorAll('body *')].filter((el) => ownText(el) && visible(el)).map((el) => {
    const { bg, alpha, image } = chain(el).reduce((acc, node) => {
      const s = getComputedStyle(node);
      const alphaNow = acc.alpha * Number(s.opacity);
      const color = parse(s.backgroundColor);
      return {
        alpha: alphaNow,
        image: acc.image || (s.backgroundImage !== 'none' && node !== el ? s.backgroundImage : null),
        bg: color && color.a > 0 ? over(color, color.a * alphaNow, acc.bg) : acc.bg,
      };
    }, { bg: { r: 255, g: 255, b: 255, a: 1 }, alpha: 1, image: null });
    const s = getComputedStyle(el);
    const text = parse(s.color);
    const fg = over(text, text.a * alpha, bg);
    const [hi, lo] = [lum(fg), lum(bg)].sort((x, y) => y - x);
    const ratio = (hi + 0.05) / (lo + 0.05);
    const size = parseFloat(s.fontSize);
    const large = size >= 24 || (size >= 18.66 && Number(s.fontWeight) >= 700);
    return { element: describe(el), text: el.textContent.trim().slice(0, 40), fg: hex(fg), bg: hex(bg),
             ratio: Math.floor(ratio * 100) / 100, exact: ratio, need: large ? 3 : 4.5, image };
  });
};

const probeFocus = () => {
  const el = document.activeElement;
  if (!el || el === document.body) return null;
  const s = getComputedStyle(el);
  const alpha = (c) => { const m = /rgba\([^)]*,\s*([\d.]+)\)/.exec(c); return m ? Number(m[1]) : (c === 'transparent' ? 0 : 1); };
  const outline = s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) > 0 && alpha(s.outlineColor) > 0;
  const rect = el.getBoundingClientRect();
  return { element: el.tagName.toLowerCase() + ' "' + (el.textContent || '').trim().slice(0, 24) + '"',
           id: el.dataset.fxId, outline, shadow: s.boxShadow !== 'none', inView: rect.width > 0 && rect.height > 0 };
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

const probeCoverage = ({ classes, attributes }) => ({
  missingClasses: classes.filter((c) => !document.querySelector('.' + c)),
  missingAttributes: attributes.filter(([a, v]) => !document.querySelector(`[${a}="${v}"]`)).map(([a, v]) => `${a}="${v}"`),
});

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
  const forced = matchMedia('(forced-colors: active)').matches;
  return { forced, borders, painted };
};

// ---- Checks (Node side) ------------------------------------------------------

const vocabulary = (css) => ({
  classes: [...new Set([...css.matchAll(/\.(echelon-[\w-]+)/g)].map((m) => m[1]))].filter((c) => !c.startsWith('echelon-shimmer')),
  attributes: [...new Set([...css.matchAll(/\[(data-echelon-[\w-]+)="([\w-]+)"\]/g)].map((m) => `${m[1]}=${m[2]}`))]
    .map((p) => p.split('=')),
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
    const stop = await page.evaluate(probeFocus);
    return stop === null || acc.some((s) => s.id === stop.id) ? acc : step(n + 1, [...acc, stop]);
  };
  return step(0, []);
};

const focusCheck = async (page, requireOutline) => {
  const total = await page.evaluate(() => [...document.querySelectorAll('a[href], button')]
    .map((el, i) => { el.dataset.fxId = String(i); return i; }).length);
  const stops = await tabThrough(page, total + 2);
  const bad = stops.filter((s) => !s.inView || !(s.outline || (!requireOutline && s.shadow)));
  return { total, reached: stops.length, bad: bad.map((s) => s.element),
           pass: stops.length === total && bad.length === 0 };
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
    const pairs = await page.evaluate(probeContrast);
    const coverage = await page.evaluate(probeCoverage, vocabulary(appCss));
    const chips = await page.evaluate(probeChips);
    const fonts = await page.evaluate(probeFonts, FONT_FACES);
    const focus = await focusCheck(page, false);
    await context.close();
    return { scheme: scheme.name, pairs, coverage, chips, fonts, focus };
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
    await shot(page, `reflow-390-text200-${colorScheme}`);
    await context.close();
    return { colorScheme, ...r, pass: r.scrollWidth <= r.innerWidth };
  }));

  const motion = await Promise.all(['reduce', 'no-preference'].map(async (reducedMotion) => {
    const { context, page } = await openPage(browser, { reducedMotion }, null, url);
    await page.waitForTimeout(150);
    const running = await page.evaluate(() => document.getAnimations()
      .filter((a) => a.playState === 'running' && a.effect && a.effect.getComputedTiming().iterations === Infinity)
      .map((a) => a.animationName || 'animation'));
    // Forma's own reduced-motion rule caps every animation at one iteration, so
    // also read the skeleton lines' own declarations: the Echelon rule itself
    // must remove the shimmer (no animation, no gradient).
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
    const focus = await focusCheck(page, true);
    await context.close();
    return { ...result, chips, focus };
  })();

  await browser.close();
  server.close();

  // ---- Verdicts --------------------------------------------------------------
  const chipVerdict = (families) => families.flatMap(({ family, chips }) => [
    ...chips.filter((c) => !c.label).map((c) => `${family}/${c.tone}: no text label`),
    ...chips.filter((c) => !c.markerVisible).map((c) => `${family}/${c.tone}: marker not visible`),
    ...chips.filter((c, i) => chips.some((d, j) => j !== i && d.shape === c.shape)).map((c) => `${family}/${c.tone}: marker shape not distinct`),
  ]);
  const uniquePairs = (pairs) => [...new Map(pairs.map((p) => [`${p.fg}|${p.bg}|${p.need}`, p])).values()];
  const checks = [
    ...schemes.map((s) => ({ name: `coverage (${s.scheme})`, pass: !s.coverage.missingClasses.length && !s.coverage.missingAttributes.length, detail: s.coverage })),
    ...schemes.map((s) => {
      const pairs = uniquePairs(s.pairs);
      const fails = pairs.filter((p) => p.exact < p.need || p.image);
      return { name: `contrast (${s.scheme})`, pass: fails.length === 0,
               detail: { textElements: s.pairs.length, uniquePairs: pairs.length, minRatio: Math.min(...pairs.map((p) => p.ratio)), fails } };
    }),
    ...schemes.map((s) => ({ name: `focus (${s.scheme})`, pass: s.focus.pass, detail: s.focus })),
    ...schemes.map((s) => ({ name: `chips (${s.scheme})`, pass: chipVerdict(s.chips).length === 0 && s.chips.length === 2, detail: chipVerdict(s.chips) })),
    ...schemes.map((s) => ({
      name: `fonts (${s.scheme})`,
      pass: s.fonts.loaded.every((f) => f.loaded > 0) && s.fonts.requests.length === 5
        && s.fonts.requests.every((r) => r.url.startsWith('/dist/fonts/') && r.status === 200),
      detail: s.fonts,
    })),
    ...reflow.map((r) => ({ name: `reflow 390px, 200% text (${r.colorScheme})`, pass: r.pass, detail: r })),
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
  const contrast = schemes.map((s) => ({ scheme: s.scheme, pairs: uniquePairs(s.pairs).map(({ exact, ...p }) => p) }));
  fs.writeFileSync(path.join(out, 'results.json'), JSON.stringify({ checks, contrast }, null, 2) + '\n');
  checks.forEach((c) => console.log(`${c.pass ? 'PASS' : 'FAIL'}: ${c.name}${c.pass ? '' : '\n      ' + JSON.stringify(c.detail)}`));
  contrast.forEach((s) => console.log(`contrast ${s.scheme}: ${s.pairs.length} unique text pairs, min ${Math.min(...s.pairs.map((p) => p.ratio))}:1`));
  const failed = checks.filter((c) => !c.pass).length;
  console.log(`${checks.length - failed} passed, ${failed} failed`);
  process.exitCode = failed ? 1 : 0;
}

main().catch((error) => { console.error(error); process.exitCode = 1; });

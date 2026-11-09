// Builds README.md and the hero banner it shows.
//
// GitHub strips CSS from READMEs, so the hero of ardayildiz.me is drawn here
// as an SVG in the site's own colors and type, once per GitHub theme. It
// plays the site's entrance once: the name rises in and the tagline types
// out behind a blinking cursor. Visitors who ask for reduced motion get the
// finished frame.
//
// Edit the content below, then run: node build.mjs
import { writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = dirname(fileURLToPath(import.meta.url))
const ASSETS = join(ROOT, 'assets')

// === Content =================================================

const SITE = 'https://ardayildiz.me'
const LABEL = 'Computer Engineer · AI & Embedded Systems'
const FIRST = 'Arda'
const LAST = 'Yıldız'
const TAGLINE = ['Working on embedded systems, firmware development,', 'and artificial intelligence applications.']

// === Design tokens (src/assets/styles.css on the site) =======

const THEMES = {
  light: { bg: '#F9F9F8', surface: '#FFFFFF', text: '#0D0D0D', muted: '#6B7280', border: '#E4E4E0', strong: '#C4C4BE', accent: '#55710E' },
  dark: { bg: '#0D0D0D', surface: '#161616', text: '#F5F5F4', muted: '#A0A0A0', border: '#2A2A2A', strong: '#3D3D3D', accent: '#C6F94B' },
}

// GitHub shows the SVG as an image, which cannot load web fonts, so Inter
// and JetBrains Mono only appear where they are installed. The rest of each
// stack is what most visitors will see.
const SANS = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif"
const MONO = "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"

const LOGO = `<rect x="38" y="52" width="180" height="168" rx="36" fill="#93BA2C"/><rect x="58" y="60" width="140" height="128" rx="26" fill="#C6F94B"/><path fill="#0D0D0D" d="M107.4 159.05 L135.4 91.05 A8.0 8.0 0 0 0 120.6 84.95 L92.6 152.95 A8.0 8.0 0 0 0 107.4 159.05 Z M120.6 91.05 L148.6 159.05 A8.0 8.0 0 0 0 163.4 152.95 L135.4 84.95 A8.0 8.0 0 0 0 120.6 91.05 Z M108.24 143 L147.76 143 A7.0 7.0 0 0 0 147.76 129 L108.24 129 A7.0 7.0 0 0 0 108.24 143 Z"/>`

// === Banner ==================================================

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const W = 1200
const H = 500

// The tagline is stretched to an exact width (textLength) so the cursor
// lands on its last letter whatever font the visitor's machine picks. The
// width comes from these glyph widths (thousandths of an em, ASCII 32 to 126),
// averaged from Segoe UI and Arial, so the stretch stays too small to see.
const GLYPHS = '276 281 374 574 548 853 734 211 318 318 403 634 248 367 248 334 548 548 548 548 548 548 548 548 548 548 248 248 634 634 634 502 985 656 620 670 712 586 550 732 716 272 428 624 514 865 735 766 614 766 660 599 524 704 644 939 629 610 590 290 328 290 576 486 300 532 566 477 568 536 300 568 561 232 232 498 232 847 561 561 566 568 355 462 316 561 490 722 480 492 476 318 250 318 634'.split(' ').map(Number)
const TAG_SIZE = 22
const TAG_X = 90
const TAG_Y = [400, 434]
const tagWidth = (s) => Math.round([...s].reduce((sum, ch) => sum + (GLYPHS[ch.charCodeAt(0) - 32] ?? 500), 0) * TAG_SIZE / 1000)

// Timeline in seconds: the name rises first, then each line types out.
const TYPE_START = 1.0
const PER_CHAR = 0.032
const LINE_GAP = 0.15

// The portrait ring from the site, around the logo instead of the photo,
// since GitHub already shows the photo as the avatar right next to this.
const RING = { cx: 940, cy: 236, r: 150 }

function banner(t) {
  const lines = TAGLINE.map((s, i) => {
    const width = tagWidth(s)
    const start = i === 0 ? TYPE_START : TYPE_START + TAGLINE[0].length * PER_CHAR + LINE_GAP
    return { s, width, y: TAG_Y[i], start, dur: s.length * PER_CHAR }
  })
  const done = lines[1].start + lines[1].dur

  const css = `
    .rise { animation: rise 0.9s cubic-bezier(0.25, 0.1, 0.25, 1) both; }
    .fade { animation: fade 1.2s ease-out 0.5s both; }
    .ring { transform-box: fill-box; transform-origin: center; animation: spin 8s linear infinite; }
    ${lines.map((l, i) => `
    .cover${i} { opacity: 0; animation: wipe${i} ${l.dur}s linear ${l.start}s backwards; }
    @keyframes wipe${i} { from { opacity: 1; transform: translateX(0); } to { opacity: 1; transform: translateX(${l.width + 6}px); } }`).join('')}
    .caret0 { opacity: 0; animation: caret0 ${lines[0].dur}s linear ${lines[0].start}s backwards; }
    @keyframes caret0 { from { opacity: 1; transform: translateX(${-lines[0].width}px); } 99% { opacity: 1; transform: translateX(0); } to { opacity: 0; } }
    .caret1 { animation: caret1 ${lines[1].dur}s linear ${lines[1].start}s backwards, blink 1s step-end ${done}s infinite; }
    @keyframes caret1 { from { opacity: 0; transform: translateX(${-lines[1].width}px); } 1% { opacity: 1; } to { opacity: 1; transform: translateX(0); } }
    @keyframes rise { from { opacity: 0; transform: translateY(28px); } to { opacity: 1; transform: none; } }
    @keyframes fade { from { opacity: 0; } to { opacity: 1; } }
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
    @media (prefers-reduced-motion: reduce) { * { animation: none !important; } }`

  const body = [
    `<style>${css}</style>`,
    `<defs><linearGradient id="ring" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${t.strong}"/><stop offset="0.4" stop-color="${t.text}"/><stop offset="0.6" stop-color="${t.strong}"/><stop offset="1" stop-color="${t.strong}" stop-opacity="0"/></linearGradient></defs>`,
    `<rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="20" fill="${t.bg}" stroke="${t.border}"/>`,

    `<text class="rise" x="64" y="88" font-family="${MONO}" font-size="15" letter-spacing="1.2" fill="${t.accent}">${esc(LABEL.toUpperCase())}</text>`,
    `<text class="rise" style="animation-delay: 0.15s" x="58" y="214" font-family="${SANS}" font-size="132" font-weight="800" letter-spacing="-5.3" fill="${t.text}">${esc(FIRST)}</text>`,
    `<text class="rise" style="animation-delay: 0.3s" x="66" y="336" font-family="${SANS}" font-size="132" font-weight="300" font-style="italic" letter-spacing="-6.6" fill="${t.text}">${esc(LAST)}</text>`,

    `<rect class="fade" x="64" y="${TAG_Y[0] - 24}" width="2" height="${TAG_Y[1] - TAG_Y[0] + 36}" fill="${t.strong}"/>`,
    ...lines.map((l) => `<text x="${TAG_X}" y="${l.y}" textLength="${l.width}" lengthAdjust="spacing" font-family="${SANS}" font-size="${TAG_SIZE}" fill="${t.muted}">${esc(l.s)}</text>`),
    // Panel-colored covers slide off the tagline to type it out.
    ...lines.map((l, i) => `<rect class="cover${i}" x="${TAG_X - 2}" y="${l.y - 22}" width="${l.width + 8}" height="30" fill="${t.bg}"/>`),
    ...lines.map((l, i) => `<rect class="caret${i}" x="${TAG_X + l.width + 3}" y="${l.y - 19}" width="2" height="24" fill="${t.accent}"/>`),

    `<g class="fade">`,
    `<circle class="ring" cx="${RING.cx}" cy="${RING.cy}" r="${RING.r}" fill="none" stroke="url(#ring)" stroke-width="3"/>`,
    `<circle cx="${RING.cx}" cy="${RING.cy}" r="${RING.r - 6}" fill="${t.surface}"/>`,
    `<svg x="${RING.cx - 80}" y="${RING.cy - 80}" width="160" height="160" viewBox="30 38 196 196">${LOGO}</svg>`,
    `</g>`,
    `<text class="fade" x="${W - 64}" y="${H - 52}" text-anchor="end" font-family="${MONO}" font-size="13" letter-spacing="1.04" fill="${t.muted}">ARDAYILDIZ.ME ↗</text>`,
  ]

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img"><title>${esc(`${FIRST} ${LAST}, ${LABEL}`)}</title>${body.join('')}</svg>\n`
}

// === Output ==================================================

for (const [theme, tokens] of Object.entries(THEMES)) {
  writeFileSync(join(ASSETS, `banner-${theme}.svg`), banner(tokens))
}

// GitHub swaps the <source> in for its dark theme.
const alt = `${FIRST} ${LAST}, ${LABEL}. ${TAGLINE.join(' ')}`
const readme = `<!-- Generated by build.mjs. Edit the content there, then run: node build.mjs -->

<a href="${SITE}">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="assets/banner-dark.svg">
    <img alt="${esc(alt)}" src="assets/banner-light.svg" width="100%">
  </picture>
</a>
`

writeFileSync(join(ROOT, 'README.md'), readme)
console.log('Wrote README.md and the banner in both themes.')

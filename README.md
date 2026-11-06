# 🪔 Happy Dhanteras Celebration

A cinematic, full-screen Dhanteras greeting experience built with **HTML5, CSS3 and vanilla JavaScript**. No frameworks, no build step, no external images or audio files.

Open it and you get a dark maroon festival night: a golden light blooms from the centre, 100+ clay diyas flicker and glow, blessing words float across the sky, golden Lakshmi coins rain down, and a rotating rangoli mandala glows behind a 3D golden "HAPPY DHANTERAS" headline.

Keep the three files in the same folder.

## 🚀 Run it

1. Put `index.html`, `style.css` and `script.js` in one folder.
2. Double-click `index.html` to open it in a modern browser.

To publish it, upload the folder to any static host (GitHub Pages, Netlify, Vercel, Cloudflare Pages, or a normal web server). No configuration is needed.

> Google Fonts load from the internet. Offline, the page still works with system fonts.

## ✨ What you will see

| Feature | Details |
|---|---|
| **Cinematic opening** | Black screen, a golden light grows from the centre, gold particles spread, then each headline line fades in one at a time with a light sweep |
| **Burning diyas** | 100–150 on desktop (about 60 on phones): bottom rows, both sides, a ring around the screen and a top row. Each has a clay bowl, flickering flame, golden glow, floor reflection and its own random flicker speed |
| **Floating words** | 26 blessings in English and Hindi (WEALTH, धन, लक्ष्मी, सौभाग्य, and more) rising, sliding, zooming, rotating, glowing like neon or fading like magic dust |
| **Lakshmi theme** | Golden kalash, lotus flowers and Lakshmi footprints, a rotating rangoli mandala, light rays |
| **Coin rain** | Gentle falling 3D-spinning gold coins, some bounce near the bottom |
| **Flowers** | Marigold garland border and drifting marigold petals |
| **Background effects** | Twinkling stars, golden dust, bokeh lights, fireflies and mouse parallax |
| **Greeting text** | English and Hindi blessings plus the footer message |

## 🎛️ Buttons

| Button | What it does |
|---|---|
| ✨ **Celebrate Now** | Golden particle explosion |
| 🪔 **Light the Diyas** | Lights every remaining diya in a wave from the bottom up, brightens the room and plays a soft match-strike sound |
| 💰 **Receive Blessings** | Shows a random blessing message in English or Hindi |
| ❤️ **Share Happiness** | Burst of hearts and sparkles |
| 📲 **Share Wishes** | Opens the phone's share sheet where supported, otherwise copies the link to the clipboard |
| 🎵 (top right) | Turns the festive music on or off |

## 🔊 Audio

- The music is **generated in the browser** with the Web Audio API: a soft tanpura-style drone with gentle pentatonic plucks.
- **Nothing plays automatically.** Music starts only when you tap the 🎵 button, and the diya sound plays only when you tap "Light the Diyas".
- If your browser blocks sound, tap the button once more.

## ♿ Accessibility and performance

- Respects `prefers-reduced-motion`: the intro is skipped, CSS animations stop, floating words are not spawned and the scene is drawn as a single still frame.
- Decorative layers are hidden from screen readers, Hindi text is tagged `lang="hi"`, and the message area is announced politely.
- Buttons work with a keyboard and show a visible focus state.
- Diyas, stars, coins, petals and effects are drawn on a single `<canvas>` from pre-rendered sprites, so there are only a few dozen DOM elements.
- Particle counts are reduced on small screens, the device-pixel ratio is capped at 2, floating words are limited to 6–11 at once and removed when finished, and animation pauses when the tab is hidden.

## 🛠️ Easy changes

| What | Where |
|---|---|
| Colours | CSS variables at the top of `style.css` |
| Fonts | the Google Fonts link in `index.html` and the font variables in `style.css` |
| Greeting text | `index.html` |
| Floating words | the `WORDS` array in `script.js` |
| Blessing messages | the `BLESS` array in `script.js` |
| Share text | the `share()` function in `script.js` |
| Diya layout and sizes | the `layout()` function in `script.js` |
| Number of coins, petals, stars | the numbers in `layout()` (for example `ar(38, …)` for coins) |
| Opening animation timing | `introFade` and `core` keyframes in `style.css` |

## 🌐 Browser support

Current versions of Chrome, Edge, Firefox, Safari and their mobile versions. Share Wishes uses the native share sheet on most phones and falls back to copying the link on desktop.

## 🙏 License

Free to use, change and share for personal and festive greetings.

**शुभ धनतेरस! मंगलमय जीवन! — May this Dhanteras bring endless prosperity, happiness, and divine blessings into your life.**

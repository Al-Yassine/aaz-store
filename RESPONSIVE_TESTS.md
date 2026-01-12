Responsive testing checklist

Quick steps

1. Start local dev server: `npm start` or `yarn start`.
2. Open Chrome/Edge and use DevTools > Toggle Device Toolbar (Ctrl+Shift+M) to test sizes.

Common sizes to test

- Mobile (small): 320 x 568 (iPhone SE)
- Mobile (standard): 375 x 812 (iPhone 11/12/13)
- Mobile (large): 412 x 915 (Android)
- Tablet (portrait): 768 x 1024
- Laptop: 1366 x 768
- Desktop: 1920 x 1080

Checklist (pass/fail)

- [ ] No horizontal scrolling at any tested size (html/body overflow-x hidden).
- [ ] Navigation works on mobile (hamburger toggles menu; links are tappable).
- [ ] Product grids: 1 column on mobile, multiple columns on larger screens.
- [ ] Images scale correctly (no distortion; aspect preserved).
- [ ] Form inputs and buttons meet touch target guidelines (~44px min touch height).
- [ ] Text remains readable (no tiny fonts) and layout doesn't overlap.
- [ ] Cart/checkout flows usable on mobile (stacked layout; summary not off-screen).
- [ ] Check for any fixed-width elements (min-widths) causing overflow.

Notes

- Where issues are found, inspect the element in DevTools to find the CSS rule and add a media query or adjust min-width/padding as needed.
- If you have an admin dashboard or separate admin UI, apply the same mobile-first rules: stacked columns on mobile, collapsible sidebars, and touch-friendly buttons.

How to run an automated Lighthouse check

1. In Chrome, open Lighthouse panel in DevTools.
2. Run Lighthouse with device emulation for Mobile and Desktop to capture accessibility & performance suggestions.
3. Act on critical accessibility issues (tap targets, color contrast, focus management).
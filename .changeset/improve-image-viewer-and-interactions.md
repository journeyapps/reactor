---
'@journeyapps/reactor-mod': minor
'@journeyapps/reactor-lib-builder': patch
'@journeyapps/reactor-lib-data-layer': patch
'@journeyapps/reactor-lib-utils': patch
---

- [feature] Add floating image previews with zoom controls, cursor-centered wheel zoom, drag-to-pan, touch pinch, and resize-aware fit mode.
- [feature] Export reusable `usePanZoom`, `usePanZoomGestures`, `useSizeObserver`, and `useDelay` hooks, with shared size observation and gesture and timer cleanup on unmount.
- [fix] Restore Jimp image previews by correcting browser bundle resolution, respect both preview dimensions, and reuse previews by size.
- [fix] Match uploaded media by MIME type first, with trimmed, case-insensitive extension matching as a fallback.
- [fix] Preserve command palette click coordinates when executing actions and center keyboard-triggered comboboxes in the viewport.
- [enhancement] Add configurable tooltip delays with a 500 ms default for buttons, and reuse delayed-callback handling across tooltips, copy feedback, loading indicators, drag-exit detection, and long-press gestures.
- [dependencies] Update Reactor dependencies, including cronstrue and slick-carousel, builder dependencies including Babel and Webpack, and development dependencies across Reactor, the builder, data layer, and utilities.

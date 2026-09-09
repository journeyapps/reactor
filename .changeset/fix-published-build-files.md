---
'@journeyapps/reactor-lib-builder': patch
'@journeyapps/reactor-lib-data-layer': patch
'@journeyapps/reactor-lib-search': patch
'@journeyapps/reactor-lib-server': patch
'@journeyapps/reactor-lib-utils': patch
'@journeyapps/reactor-mod-editor': patch
'@journeyapps/reactor-mod': patch
'@journeyapps/reactor-mod-debug': patch
---

Explicitly include compiled JavaScript, TypeScript declarations, and runtime assets in published packages. This fixes missing build files when packing with pnpm 12.

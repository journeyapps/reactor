# Reactor editor module

![](https://img.shields.io/npm/v/@journeyapps/reactor-mod-editor)

This module provides editor capability to Reactor with the help of Monaco (the OSS editor found in vs-code).

__Features:__
* Upload VSCode themes
* Customize themes
* Customize editor shortcuts
* Shortcuts accessible via cmd palette

## Usage with other modules

Make sure to put this in any modules that will need monaco or react-monaco-editor (in the custom webpack.config.js):

```js
webpack = patchImportedLibrary({
  "w": webpack,
  "module": 'monaco-editor'
})
webpack = patchImportedLibrary({
    "w": webpack,
    "module": 'react-monaco-editor'
})
```
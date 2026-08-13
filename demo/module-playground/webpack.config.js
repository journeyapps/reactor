const { patchImportedLibrary } = require('@journeyapps/reactor-lib-builder');
module.exports = (w) => {
  w = patchImportedLibrary({ w, module: 'monaco-editor' });
  return w;
};

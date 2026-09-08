import { Package } from '@journeyapps/common-docs';

export const packages = [
  {
    dir: '../modules/module-reactor',
    id: 'module-reactor',
    name: 'Module Reactor'
  },
  {
    dir: '../modules/module-editor',
    id: 'module-editor',
    name: 'Module Editor'
  },
  {
    dir: '../modules/module-reactor-debug',
    id: 'module-reactor-debug',
    name: 'Module Reactor Debug'
  },
  {
    dir: '../libs/lib-reactor-utils',
    id: 'lib-reactor-utils',
    name: 'Lib Reactor Utils'
  },
  {
    dir: '../libs/lib-reactor-search',
    id: 'lib-reactor-search',
    name: 'Lib Reactor Search'
  },
  {
    dir: '../libs/lib-reactor-data-layer',
    id: 'lib-reactor-data-layer',
    name: 'Lib Reactor Data Layer'
  }
] as Package[];

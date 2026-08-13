import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';
import { packages } from './utils/packages';
import { generateTSDocSidebarEntry } from '@journeyapps-labs/common-docs';
import * as path from 'path';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */
const sidebars: SidebarsConfig = {
  manualSidebar: [
    {
      type: 'category',
      label: 'Start',
      collapsed: false,
      items: [
        'getting-started/introduction',
        'getting-started/architecture',
        'getting-started/local-development',
        'getting-started/exploring-the-sandbox',
        'getting-started/first-module',
        'getting-started/reactor-server'
      ]
    },
    {
      type: 'category',
      label: 'Core concepts',
      items: [
        'subsystems/application-model',
        'subsystems/modules-and-stores',
        'subsystems/actions-and-validation',
        {
          type: 'category',
          label: 'Entity behaviors',
          link: {
            type: 'doc',
            id: 'subsystems/entity-definitions'
          },
          items: [
            'subsystems/entity-definitions/descriptions',
            'subsystems/entity-definitions/search',
            'subsystems/entity-definitions/presentation-and-panels',
            'subsystems/entity-definitions/handlers-and-opening',
            'subsystems/entity-definitions/encoding',
            'subsystems/entity-definitions/descendants',
            'subsystems/entity-definitions/contextual-documentation'
          ]
        },
        'subsystems/search-selection-and-command-palette',
        'subsystems/controls',
        'subsystems/forms',
        'subsystems/settings-and-persistence',
        'subsystems/themes',
        'subsystems/logging-and-debugging'
      ]
    },
    {
      type: 'category',
      label: 'Application runtime',
      items: [
        'runtime/application-shell',
        'subsystems/workspaces-and-panels',
        'runtime/interaction-layers',
        'runtime/operational-feedback',
        'runtime/responsive-applications',
        'subsystems/ui-system'
      ]
    },
    {
      type: 'category',
      label: 'Advanced systems',
      items: [
        'advanced/guided-workflows',
        'advanced/media-engine',
        'advanced/batch-actions',
        'advanced/data-collections',
        'advanced/production-patterns'
      ]
    }
  ],
  userSidebar: ['using-reactor/getting-around'],
  tsDocSidebar: packages.map((p) => generateTSDocSidebarEntry(p, path.join(__dirname, './docs')))
};

export default sidebars;

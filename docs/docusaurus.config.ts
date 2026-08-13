import type { Config } from '@docusaurus/types';
import { packages } from './utils/packages';

import { generateConfig, generateTSDocPlugin } from '@journeyapps-labs/common-docs';

const base_config = generateConfig({
  project_name: 'reactor'
});

const config: Config = {
  title: 'Reactor Docs',
  tagline: 'Ambitious app building framework',
  favicon: 'img/favicon.ico',
  ...base_config,
  url: 'https://journeyapps.github.io',
  organizationName: 'journeyapps',
  projectName: 'reactor',
  headTags: [
    ...(base_config.headTags ?? []),
    {
      tagName: 'script',
      attributes: {
        async: 'true',
        src: 'https://www.googletagmanager.com/gtag/js?id=G-614LCW142G'
      }
    },
    {
      tagName: 'script',
      attributes: {},
      innerHTML: `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-614LCW142G');
      `
    }
  ],
  plugins: packages.map((p) => generateTSDocPlugin(p)),
  themeConfig: {
    // Replace with your project's social card
    ...base_config.themeConfig,
    image: 'img/labs.png',
    navbar: {
      title: 'Reactor',
      logo: {
        alt: 'Labs Logo',
        src: 'img/labs.png'
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'manualSidebar',
          position: 'left',
          label: 'Manual'
        },
        {
          type: 'docSidebar',
          sidebarId: 'tsDocSidebar',
          position: 'left',
          label: 'TSDoc'
        },
        {
          type: 'docSidebar',
          sidebarId: 'userSidebar',
          position: 'left',
          label: 'Using Reactor'
        }
      ]
    }
  }
};

export default config;

import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import {themes} from 'prism-react-renderer';

const lightCodeTheme = themes.github;
const darkCodeTheme = themes.dracula;

const config: Config = {
  title: '旦挞开发文档',
  tagline: '所有开发相关文档的聚集地',
  favicon: 'img/favicon.ico',

  url: 'https://danxi.fduhole.com',
  baseUrl: '/docs/',

  organizationName: 'DanXi-Dev',
  projectName: 'docs',

  onBrokenLinks: 'throw',

  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  i18n: {
    defaultLocale: 'zh-Hans',
    locales: ['zh-Hans'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/DanXi-Dev/docs',
        },
        blog: {
          showReadingTime: true,
          editUrl: 'https://github.com/DanXi-Dev/docs',
          onInlineAuthors: 'ignore',
          onUntruncatedBlogPosts: 'ignore',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/docusaurus-social-card.jpg',
    navbar: {
      title: '旦挞开发',
      logo: {
        alt: 'My Site Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'introSidebar',
          position: 'left',
          label: '总览',
        },
        {
          type: 'docSidebar',
          sidebarId: 'danxiAppSidebar',
          position: 'left',
          label: '旦挞 App',
        },
        {
          type: 'docSidebar',
          sidebarId: 'maintenanceSidebar',
          position: 'left',
          label: '旦挞日常维护',
        },
        {to: '/blog', label: 'Blog', position: 'left'},
        {
          href: 'https://github.com/DanXi-Dev/docs',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: '文档',
          items: [
            {
              label: 'Tutorial',
              to: 'docs/intro',
            },
          ],
        },
        {
          title: '更多',
          items: [
            {
              label: 'Blog',
              to: 'blog',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/DanXi-Dev/docs',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} DanXi-Dev. Built with Docusaurus.`,
    },
    prism: {
      theme: lightCodeTheme,
      darkTheme: darkCodeTheme,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;

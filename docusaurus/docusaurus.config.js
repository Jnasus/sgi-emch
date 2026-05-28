// @ts-check
const { themes: prismThemes } = require('prism-react-renderer');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'SGI – Documentación',
  tagline: 'Sistema de Gestión de Inventario — EMCH CFB · DTIC',

  // Cambia esta URL a la del dominio donde alojes la documentación
  url: 'https://docs.sgi.escuelamilitar.edu.pe',
  baseUrl: '/',

  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'es',
    locales: ['es'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          // Sirve la documentación desde la raíz (sin prefijo /docs/)
          routeBasePath: '/',
        },
        blog: false,
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: 'SGI · EMCH CFB',
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'sgiSidebar',
            position: 'left',
            label: 'Documentación',
          },
          {
            // En producción, expón temporalmente el backend o configura
            // un proxy en Nginx Proxy Manager apuntando a sgi-full-backend:8080
            href: 'http://localhost:8080/swagger-ui.html',
            label: 'API (Swagger)',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Secciones',
            items: [
              { label: 'Introducción',        to: '/' },
              { label: 'Instalación',         to: '/instalacion/requisitos' },
              { label: 'Guía de Usuario',     to: '/guia-usuario/dashboard' },
              { label: 'Guía de Administrador', to: '/guia-admin/variables-entorno' },
              { label: 'API REST',            to: '/api/overview' },
            ],
          },
        ],
        copyright: `© ${new Date().getFullYear()} Escuela Militar de Chorrillos Francisco Bolognesi — DTIC`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
        additionalLanguages: ['java', 'bash', 'yaml', 'sql', 'json'],
      },
    }),
};

module.exports = config;

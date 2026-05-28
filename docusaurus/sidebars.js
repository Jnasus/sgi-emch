/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  sgiSidebar: [
    {
      type: 'doc',
      id: 'intro',
      label: 'Introducción',
    },
    {
      type: 'category',
      label: 'Instalación',
      collapsed: false,
      items: [
        'instalacion/requisitos',
        'instalacion/despliegue',
      ],
    },
    {
      type: 'category',
      label: 'Arquitectura',
      items: [
        'arquitectura/stack-tecnologico',
        'arquitectura/estructura-del-proyecto',
      ],
    },
    {
      type: 'category',
      label: 'Guía de Usuario',
      items: [
        'guia-usuario/dashboard',
        'guia-usuario/inventario',
        'guia-usuario/incidentes',
        'guia-usuario/reportes',
        'guia-usuario/notificaciones',
        'guia-usuario/usuarios',
        'guia-usuario/configuracion',
      ],
    },
    {
      type: 'category',
      label: 'Guía de Administrador',
      items: [
        'guia-admin/variables-entorno',
        'guia-admin/backups',
        'guia-admin/nginx-proxy-manager',
      ],
    },
    {
      type: 'category',
      label: 'API REST',
      items: [
        'api/overview',
        'api/endpoints-principales',
      ],
    },
  ],
};

module.exports = sidebars;

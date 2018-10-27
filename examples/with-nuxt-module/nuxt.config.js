export default {
  /*
  ** Headers of the page
  */
  head: {
    title: 'with-nuxt',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: 'Nuxt.js project' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },
  css: [
    'tachyons/css/tachyons.min.css'
  ],
  modules: [
    // To start, simply include the module
    // The defaults are suitable for a starter project

    // Advanced options and more examples:
    // https://github.com/Developmint/nuxt-purgecss#defaults
    'nuxt-purgecss'
  ],
  build:{
    extractCSS: true
  }
}

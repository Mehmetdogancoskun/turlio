/**  postcss.config.js  */
module.exports = {
  plugins: {
    // Tailwind v4’ün PostCSS eklentisi
    '@tailwindcss/postcss': {},

    // (İsteğe bağlı) CSS nesting isterseniz bunu açın
    // 'postcss-nesting': {},

    autoprefixer: {},
  },
};

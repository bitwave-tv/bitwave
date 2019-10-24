import colors from 'vuetify/es5/util/colors'

// vuetify.options.js
export default {
  breakpoint: {},
  icons: {},
  lang: {},
  rtl: false,
  theme: {
    dark: true,
    themes: {
      dark: {
        primary:   colors.yellow.base, // #ffeb3b
        secondary: colors.grey.darken3, // #424242
        accent:    colors.yellow.accent1, // #82B1FF
        error:     colors.red.accent2, // #FF5252
        info:      colors.blue.base, // #2196F3
        success:   colors.green.base, // #4CAF50
        warning:   colors.amber.base, // #FFC107
      },
    },
  },
}

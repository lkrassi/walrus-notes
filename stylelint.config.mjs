export default {
  ignoreFiles: ['dist/**', 'dist-server/**', 'node_modules/**'],
  rules: {
    'color-no-hex': true,
    'declaration-property-value-disallowed-list': {
      '/(color|background|border|outline)/i': [/rgba\(/i],
    },
  },
};

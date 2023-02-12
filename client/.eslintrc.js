
module.exports = {
  extends: [
    'taro/react',
  ],
  rules: {
    'react/jsx-uses-react': 'off',
    'react/react-in-jsx-scope': 'off',
    'import/no-commonjs': 'off',
    "react/jsx-closing-bracket-location": [2, 'after-props'],
  },
  ignorePatterns: ['image-cropper'],
  parserOptions: {
    requireConfigFile: false,
  },
};

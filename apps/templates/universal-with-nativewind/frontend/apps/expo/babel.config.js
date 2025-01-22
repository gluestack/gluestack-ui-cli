module.exports = function (api) {
  api.cache(true);
  return {
    sourceType: 'unambiguous',
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel',
    ],
    plugins: [
      [
        'module-resolver',
        {
          alias: {
            '@unitools/image': '@unitools/image-expo',
            '@unitools/link': '@unitools/link-expo',
            '@unitools/router': '@unitools/router-expo',
          },
        },
      ],
    ],
  };
};

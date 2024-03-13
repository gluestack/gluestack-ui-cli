const config = {
  repoUrl: 'https://github.com/gluestack/gluestack-ui.git',
  branchName: 'patch',
  tagName: '',
  writableComponentsPath: 'components',
  style: '',
  gluestackStyleRootPath: 'themed',
  nativeWindRootPath: 'nativewind',
  providerComponent: 'gluestack-ui-provider',
  componentsResourcePath: 'example/storybook-nativewind/src/core-components',
  gluestackDir: '.gluestack/cache/gluestack-ui',
  configFileName: 'config.ts',
  UIconfigPath: 'components/gluestack-ui-provider/config.ts',
  nativeWindDependencies: ['@gluestack-ui/nativewind-utils'],
  tailwindConfigRootPath: 'example/storybook-nativewind/tailwind.config.js',
  nativewindUtilPattern: '@gluestack-ui/nativewind-utils/',
  gluestackUIPattern: '@gluestack-ui/',
  packageVersions: {
    'react-native-svg': '13.4.0',
    nativewind: '4.0.1',
  } as Record<string, string>,
};

export { config };

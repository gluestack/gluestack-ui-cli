const config = {
  repoUrl: 'https://github.com/gluestack/gluestack-ui.git',
  gluestackDir: '.gluestack/cache/gluestack-ui',
  componentsResourcePath: 'example/storybook-nativewind/src/core-components',
  gluestackStyleRootPath: 'themed',
  nativeWindRootPath: 'nativewind',
  tailwindConfigRootPath: 'example/storybook-nativewind/tailwind.config.js',
  UIconfigPath: 'components/ui/gluestack-ui-provider/config.ts',
  writableComponentsPath: 'components/ui',
  branchName: 'patch',
  tagName: '@gluestack-ui/storybook@0.1.0',
  style: '',
  providerComponent: 'gluestack-ui-provider',
  configFileName: 'config.ts',
  nativeWindDependencies: ['@gluestack-ui/nativewind-utils'],
  nativewindUtilPattern: '@gluestack-ui/nativewind-utils/',
  gluestackUIPattern: '@gluestack-ui/',
  GluestackNextJsDependencies: [
    'react-native-web',
    '@gluestack/ui-next-adapter',
    'react-native-svg',
    '@legendapp/motion',
  ],
  GluestackExpoDependencies: ['react-native-svg', '@legendapp/motion'],
  GluestackNativeCLIDependencies: ['react-native-svg', '@legendapp/motion'],
  GlobalAdditionalDependencies: {
    'react-native-svg': '13.4.0',
  } as Record<string, string>,
};

export { config };

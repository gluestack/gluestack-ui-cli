const config = {
  repoUrl: 'https://github.com/gluestack/gluestack-ui.git',
  gluestackDir: '.gluestack/cache/gluestack-ui',
  componentsResourcePath: 'example/storybook-nativewind/src/core-components',
  hooksResourcePath: 'example/storybook-nativewind/src/core-components/hooks',
  dependencyConfigPath:
    'example/storybook-nativewind/src/core-components/nativewind/dependencies.json',
  nativeWindRootPath: 'nativewind',
  expoProject: 'expo',
  nextJsProject: 'nextjs',
  reactNativeCLIProject: 'react-native-cli',
  tailwindConfigRootPath: 'example/storybook-nativewind/src/tailwind.config.js',
  writableComponentsPath: 'components/ui',
  branchName: 'patch',
  style: 'nativewind',
  providerComponent: 'gluestack-ui-provider',
  nativewindUtilPattern: '@gluestack-ui/nativewind-utils/',
  gluestackUIPattern: '@gluestack-ui/',
  templatesDir: '../../../template',
  codeModesDir: '../../../template/codemods',
  packageManager: null as string | null,
};

export { config };

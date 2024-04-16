const config = {
  repoUrl: 'https://github.com/gluestack/gluestack-ui.git',
  gluestackDir: '.gluestack/cache/gluestack-ui',
  componentsResourcePath: 'example/storybook-nativewind/src/core-components',
  gluestackStyleRootPath: 'themed',
  nativeWindRootPath: 'nativewind',
  expoProject: 'expo',
  nextJsProject: 'nextjs',
  reactNativeCLIProject: 'react-native-cli',
  tailwindConfigRootPath: 'example/storybook-nativewind/tailwind.config.js',
  UIconfigPath: 'components/ui/gluestack-ui-provider/config.ts',
  writableComponentsPath: 'components/ui',
  branchName: 'patch',
  tagName: '@gluestack-ui/storybook@0.1.0',
  style: '',
  providerComponent: 'gluestack-ui-provider',
  configFileName: 'config.ts',
  nativewindUtilPattern: '@gluestack-ui/nativewind-utils/',
  gluestackUIPattern: '@gluestack-ui/',
  templatesDir: '../../../template',
  codeModesDir: '../../../template/template-codemods',
  GluestackNextJsDependencies: [
    'react-native-web',
    '@gluestack/ui-next-adapter',
    'react-native-svg',
    '@legendapp/motion',
    '@gluestack/ui-next-adapter',
  ],
  GluestackExpoDependencies: ['react-native-svg', '@legendapp/motion'],
  GluestackReactNativeCLIDependencies: [
    'react-native-svg',
    '@legendapp/motion',
  ],
  NativeWindNextJsDependencies: [
    'tailwindcss',
    'postcss',
    'autoprefixer',
    'react-native-web',
    '@gluestack-ui/nativewind-utils',
    '@gluestack/ui-next-adapter',
    'jscodeshift',
  ],
  NativeWindExpoDependencies: [
    'nativewind',
    'react-native-reanimated',
    'tailwindcss',
    '@gluestack-ui/nativewind-utils',
    'jscodeshift',
  ],
  NativeWindReactNativeCLIDependencies: [
    'nativewind',
    'react-native-reanimated',
    'tailwindcss',
    '@gluestack-ui/nativewind-utils',
    'jscodeshift',
  ],
  DependencyVersion: {
    'react-native-svg': '13.4.0',
    nativewind: '4.0.36',
    tailwindcss: '3.4.3',
    jscodeshift: '0.15.2',
  } as Record<string, string>,
  demoCode: `// ...imports of the app
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import "@/global.css";
      
export default function App() {
  return (
    <GluestackUIProvider>
     {/* Your code */}
    </GluestackUIProvider>
  );
}`,
};

export { config };

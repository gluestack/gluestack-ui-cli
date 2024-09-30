export interface Dependency {
  [key: string]: string;
}
export interface ComponentConfig {
  dependencies: Dependency;
  devDependencies?: Dependency;
  additionalComponents?: string[];
  hooks?: string[];
}

export interface Dependencies {
  [key: string]: ComponentConfig;
}

const projectBasedDependencies: Dependencies = {
  nextjs: {
    dependencies: {
      postcss: '',
      autoprefixer: '',
      'react-native-web': '',
      '@gluestack/ui-next-adapter': 'latest',
    },
    devDependencies: {
      '@types/react-native': '',
    },
  },
  expo: {
    dependencies: {
      'react-native-reanimated': '',
    },
  },
  'react-native-cli': {
    dependencies: {
      'react-native-reanimated': '',
    },
    devDependencies: {
      'babel-plugin-module-resolver': '',
    },
  },
};
const dependenciesConfig: Dependencies = {
  'gluestack-ui-provider': {
    dependencies: {
      tailwindcss: '',
      '@gluestack-ui/overlay': 'latest',
      '@gluestack-ui/toast': 'latest',
      '@gluestack-ui/nativewind-utils': 'latest',
      'react-native-svg': '13.4.0',
    },
    devDependencies: {
      jscodeshift: '0.15.2',
      prettier: '',
    },
  },
  accordion: {
    dependencies: {
      '@gluestack-ui/accordion': 'latest',
      '@expo/html-elements': '0.4.2',
    },
  },
  actionsheet: {
    dependencies: {
      '@legendapp/motion': 'latest',
      '@gluestack-ui/actionsheet': 'latest',
    },
  },
  alert: {
    dependencies: {
      '@gluestack-ui/alert': 'latest',
    },
  },
  'alert-dialog': {
    dependencies: {
      '@gluestack-ui/alert-dialog': 'latest',
      '@legendapp/motion': 'latest',
    },
  },
  avatar: {
    dependencies: {
      '@gluestack-ui/avatar': 'latest',
    },
  },
  badge: { dependencies: {} },
  box: { dependencies: {} },
  button: {
    dependencies: {
      '@gluestack-ui/button': 'latest',
    },
  },
  card: { dependencies: {} },
  center: { dependencies: {} },
  checkbox: {
    dependencies: {
      '@gluestack-ui/checkbox': 'latest',
    },
  },
  divider: {
    dependencies: {
      '@gluestack-ui/divider': 'latest',
    },
  },
  fab: {
    dependencies: {
      '@gluestack-ui/fab': 'latest',
    },
  },
  'flat-list': {
    dependencies: {},
  },
  'form-control': {
    dependencies: {
      '@gluestack-ui/form-control': 'latest',
    },
  },
  heading: {
    dependencies: {
      '@expo/html-elements': '0.4.2',
    },
  },
  hstack: {
    dependencies: {},
  },
  icon: {
    dependencies: {
      '@gluestack-ui/icon': 'latest',
    },
  },
  image: {
    dependencies: {
      '@gluestack-ui/image': 'latest',
    },
  },
  'image-background': {
    dependencies: {},
  },
  input: {
    dependencies: {
      '@gluestack-ui/input': 'latest',
    },
  },
  'input-accessory-view': {
    dependencies: {},
  },
  'keyboard-avoiding-view': {
    dependencies: {},
  },
  link: {
    dependencies: {
      '@gluestack-ui/link': 'latest',
    },
  },
  menu: {
    dependencies: {
      '@gluestack-ui/menu': 'latest',
      '@legendapp/motion': 'latest',
    },
  },
  modal: {
    dependencies: {
      '@gluestack-ui/modal': 'latest',
      '@legendapp/motion': 'latest',
    },
  },
  popover: {
    dependencies: {
      '@gluestack-ui/popover': 'latest',
      '@legendapp/motion': 'latest',
    },
  },
  pressable: {
    dependencies: {
      '@gluestack-ui/pressable': 'latest',
    },
  },
  progress: {
    dependencies: {
      '@gluestack-ui/progress': 'latest',
    },
  },
  radio: {
    dependencies: {
      '@gluestack-ui/radio': 'latest',
    },
  },
  'refresh-control': { dependencies: {} },
  'safe-area-view': { dependencies: {} },
  'scroll-view': { dependencies: {} },
  'section-list': {
    dependencies: {},
  },
  select: {
    dependencies: {
      '@gluestack-ui/select': 'latest',
      '@gluestack-ui/actionsheet': 'latest',
      '@legendapp/motion': 'latest',
      '@expo/html-elements': '0.4.2',
    },
  },
  slider: {
    dependencies: {
      '@gluestack-ui/slider': 'latest',
    },
  },
  spinner: {
    dependencies: {
      '@gluestack-ui/spinner': 'latest',
    },
  },
  'status-bar': { dependencies: {} },
  switch: {
    dependencies: {
      '@gluestack-ui/switch': 'latest',
    },
  },
  text: { dependencies: {} },
  textarea: {
    dependencies: {
      '@gluestack-ui/textarea': 'latest',
    },
  },
  toast: {
    dependencies: {
      '@gluestack-ui/toast': 'latest',
      '@legendapp/motion': 'latest',
    },
  },
  tooltip: {
    dependencies: {
      '@gluestack-ui/tooltip': 'latest',
      '@legendapp/motion': 'latest',
    },
  },
  view: { dependencies: {} },
  'virtualized-list': { dependencies: {} },
  vstack: { dependencies: {} },
  grid: {
    dependencies: {},
    hooks: ['useBreakpointValue'],
  },
};

// Ignore components that are in development or not in supported list
const IgnoredComponents = ['bottomsheet'];

const getComponentDependencies = (componentName: string): ComponentConfig => {
  const config = dependenciesConfig[componentName];
  if (!config) {
    return {
      dependencies: {},
      devDependencies: {},
      additionalComponents: [],
      hooks: [],
    };
  }
  return {
    dependencies: config.dependencies || {},
    devDependencies: config.devDependencies || {},
    additionalComponents: config.additionalComponents || [],
    hooks: config.hooks || [],
  };
};
export {
  dependenciesConfig,
  projectBasedDependencies,
  IgnoredComponents,
  getComponentDependencies,
};

module.exports = {
  gitRepo: 'https://github.com/gluestack/gluestack-ui-cli.git',
  parentPath: 'apps/templates',
  tag: 'generate/script',
  options: {
    framework: {
      default: {
        question: 'What would you like to \x1b[36mbuild\x1b[0m?',
        options: [
          { value: 'expo', label: 'Expo app', hint: 'Expo + gluestack-ui' },
          { value: 'next', label: 'Next.js app', hint: 'Next + gluestack-ui' },
          {
            value: 'react-native',
            label: 'React Native app',
            hint: 'React Native + gluestack-ui',
          },
        ],
      },
      Route: {
        next: {
          question: 'Would you like to use \x1b[36mApp Router\x1b[0m?',
          options: [
            {
              value: 'next-app-router',
              label: 'Yes',
              hint: 'Next.js with app router',
            },
            {
              value: 'next-page-router',
              label: 'No',
              hint: 'Next.js with page router',
            },
          ],
        },
        expo: {
          question: 'Would you like to use \x1b[36mExpo Router V3\x1b[0m?',
          options: [
            {
              value: 'expo-router',
              label: 'Yes',
              hint: 'Expo app with Expo router V3',
            },
            { value: 'expo', label: 'No', hint: 'Expo app' },
          ],
        },
      },
    },
    style: {
      bundle: {
        // question: 'Would you like to use \x1b[36m@gluestack-ui/themed\x1b[0m?',
        // options: [
        //   { value: 'ejected', label: 'No', hint: '' },
        //   {
        //     value: 'gui',
        //     label: 'Yes',
        //     hint: 'A Themed UI component library',
        //   },
        // ],
      },
      default: {
        question: 'Which \x1b[36mStyle engine\x1b[0m would you like to use?',
        options: [
          {
            value: 'nw',
            label: 'NativeWind',
            hint: 'Tailwind styling for native',
          },
          {
            value: 'gs',
            label: 'gluestack-style',
            hint: 'Universal and Performant Styling Library',
          },
        ],
      },
    },
  },
  option: {
    'expo-router-v3': {
      hint: '',
      label: 'expo app with expo router v3',
      options: {
        'with-themed-library': {
          value: 'expo-router-with-gluestack-style-ejected',
          hint: '',
          label: 'themed library',
        },
        'with-gluestack-style': {
          value: 'expo-router-with-gluestack-style',
          hint: '',
          label: 'themed library bundled',
        },
        'with-nativewind': {
          value: 'expo-router-with-nativewind',
          hint: '',
          label: 'nativewind v4 styling',
        },
      },
    },
    expo: {
      hint: '',
      label: 'expo app',
      options: {
        'with-themed-library': {
          value: 'expo-with-gluestack-style-ejected',
          hint: '',
          label: 'themed library',
        },
        'with-gluestack-style': {
          value: 'expo-with-gluestack-style',
          hint: '',
          label: 'themed library bundled',
        },
        'with-nativewind': {
          value: 'expo-with-nativewind',
          hint: '',
          label: 'nativewind v4 styling',
        },
      },
    },
    'next-app-router': {
      hint: '',
      label: 'next app with app router',
      options: {
        'with-themed-library': {
          value: 'next-app-router-with-gluestack-style-ejected',
          hint: '',
          label: 'Themed Library',
        },
        'with-gluestack-style': {
          value: 'next-app-router-with-gluestack-style',
          hint: '',
          label: 'themed library bundled',
        },
        'with-nativewind': {
          value: 'next-app-router-with-nativewind',
          hint: '',
          label: 'nativewind v4 styling',
        },
      },
    },
    'next-page-router': {
      hint: '',
      label: 'next app with page router',
      options: {
        'with-themed-library': {
          value: 'next-page-router-with-gluestack-style-ejected',
          hint: '',
          label: 'Themed Library',
        },
        'with-gluestack-style': {
          value: 'next-page-router-with-gluestack-style',
          hint: '',
          label: 'themed library bundled',
        },
        'with-nativewind': {
          value: 'next-page-router-with-nativewind',
          hint: '',
          label: 'nativewind v4 styling',
        },
      },
    },
    'react-native': {
      hint: '',
      label: 'react-native app',
      options: {
        'with-themed-library': {
          value: 'reactNativeWithGluestackStyleEjected',
          hint: '',
          label: 'themed Library',
        },
        'with-gluestack-style': {
          value: 'reactNativeWithGluestackStyle',
          hint: '',
          label: 'themed library bundled',
        },
        'with-nativewind': {
          value: 'reactNativeWithNativewind',
          hint: '',
          label: 'nativewind v4 styling',
        },
      },
    },
  },
  styleOptions: {
    'with-themed-library': 'themed Library with styling ejected',
    'with-gluestack-style': 'themed library bundled',
    'with-nativewind': 'nativewind v4 styling ejected',
  },
  map: {
    'expo-gs': 'expo-with-gluestack-style-ejected',
    'expo-nw': 'expo-with-nativewind',
    'expo-router-gs': 'expo-router-with-gluestack-style-ejected',
    'expo-router-nw': 'expo-router-with-nativewind',
    'next-app-router-gs': 'next-app-router-with-gluestack-style-ejected',
    'next-app-router-nw': 'next-app-router-with-nativewind',
    'next-page-router-gs': 'next-page-router-with-gluestack-style-ejected',
    'next-page-router-nw': 'next-page-router-with-nativewind',
    'react-native-gs': 'reactNativeWithGluestackStyleEjected',
    'react-native-nw': 'reactNativeWithNativeWind',
  },
};

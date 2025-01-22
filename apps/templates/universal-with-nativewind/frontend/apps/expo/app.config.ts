import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'App Launch Kit',
  slug: 'app-launch-kit',
  extra: {
    ...config?.extra,
  },
  // plugins:[
  //   ...config.plugins!,
  //     [
  //       "@react-native-google-signin/google-signin",
  //       {
  //         "iosURLScheme": "com.googleusercontent.apps.339982569827-41u3c9a67997u48h0s3k0k3i61kaim6t"
  //       }
  //     ]
  // ]
});

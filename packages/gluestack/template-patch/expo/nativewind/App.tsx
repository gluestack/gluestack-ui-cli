import './global.css';
import { StatusBar } from 'expo-status-bar';
import { Text, View } from 'react-native';
import { GluestackUIProvider } from '@/components';

export default function App() {
  return (
    <GluestackUIProvider mode='dark'>
      <View className='flex-1 items-center justify-center bg-white'>
          <Text className="text-typography-900">
            Open up App.tsx to start working on your app!
          </Text>
        <StatusBar style="auto" />
      </View>
    </GluestackUIProvider>
  );
}
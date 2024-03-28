/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import './global.css';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  useColorScheme,
} from 'react-native';

import {Colors} from 'react-native/Libraries/NewAppScreen';
import {Box} from './components/ui/box';
import {Text} from './components/ui/text';

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        {/* <Header /> */}
        <Container />
      </ScrollView>
    </SafeAreaView>
  );
}

const Container = () => {
  return (
    <Box className="flex-1 bg-black h-[100vh] flex-row justify-center items-center">
      <Text className="text-white font-normal">Get started by editing</Text>
      <Text className="text-white font-semibold ml-2">./App.tsx</Text>
    </Box>
  );
};

export default App;

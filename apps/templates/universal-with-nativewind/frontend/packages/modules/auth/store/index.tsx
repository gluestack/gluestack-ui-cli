import AsyncStorage from '@react-native-async-storage/async-storage';

export const store = {
  get: async function (provider: 'rest' | 'firebase') {
    const tokenData = await AsyncStorage.getItem(
      `async-storage-${provider}-session-data`
    );
    if (tokenData) {
      return JSON.parse(tokenData);
    } else {
      return null;
    }
  },
  set: async function (provider: 'rest' | 'firebase', tokenData: any) {
    await AsyncStorage.setItem(
      `async-storage-${provider}-session-data`,
      JSON.stringify(tokenData)
    );
  },
  clear: async function (provider: 'rest' | 'firebase') {
    await AsyncStorage.removeItem(`async-storage-${provider}-session-data`);
  },
};

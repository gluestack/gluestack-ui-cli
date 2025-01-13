export const store = {
  get: async function (provider: 'rest' | 'firebase') {
    const tokenData = localStorage.getItem(
      `local-storage-${provider}-session-data`
    );
    if (tokenData) {
      return JSON.parse(tokenData);
    } else {
      return null;
    }
  },
  set: async function (provider: 'rest' | 'firebase', tokenData: any) {
    localStorage.setItem(
      `local-storage-${provider}-session-data`,
      JSON.stringify(tokenData)
    );
  },
  clear: async function (provider: 'rest' | 'firebase') {
    localStorage.removeItem(`local-storage-${provider}-session-data`);
  },
};

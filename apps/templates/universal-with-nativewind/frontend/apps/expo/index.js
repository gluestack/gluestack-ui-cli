import { ExpoRoot } from 'expo-router';
require('expo-router/entry');

export function App() {
  const ctx = require.context('./app');
  return <ExpoRoot context={ctx} />;
}

export default App;

const { getDefaultConfig } = require('expo/metro-config');
const findWorkspaceRoot = require('find-yarn-workspace-root');
const { withNativeWind } = require('nativewind/metro');
const { withUnitools } = require('@unitools/metro-config');
const path = require('path');

// eslint-disable-next-line no-undef
const workspaceRoot = findWorkspaceRoot(__dirname);
// Find the project and workspace directories
// eslint-disable-next-line no-undef
const projectRoot = __dirname;

const config = getDefaultConfig(projectRoot);
config.transformer.unstable_allowRequireContext = true;
config.watchFolders = [workspaceRoot];
// 2. Let Metro know where to resolve packages and in what order
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];
module.exports = withUnitools(config);
module.exports = withNativeWind(config, {
  input: './globals.css',
  inlineRem: 16,
});

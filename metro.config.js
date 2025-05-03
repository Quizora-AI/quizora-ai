
const { getDefaultConfig } = require('@expo/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

module.exports = {
  resolver: {
    assetExts: [...defaultConfig.resolver.assetExts, 'db'],
    sourceExts: [...defaultConfig.resolver.sourceExts, 'mjs'],
    extraNodeModules: {
      stream: require.resolve('readable-stream'),
    }
  },
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
    assetPlugins: ['expo-asset/tools/hashAssetFiles'],
  },
  maxWorkers: 2,
  resetCache: true
};

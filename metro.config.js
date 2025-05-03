
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
  // Optimize for Termux environment
  maxWorkers: 2,
  resetCache: true,
  server: {
    port: 8081,
    enhanceMiddleware: (middleware) => {
      return (req, res, next) => {
        // Allow connections from all IPs
        res.setHeader('Access-Control-Allow-Origin', '*');
        return middleware(req, res, next);
      };
    }
  }
};


const { getDefaultConfig } = require('@expo/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

module.exports = {
  resolver: {
    assetExts: [...defaultConfig.resolver.assetExts, 'db'],
    sourceExts: [...defaultConfig.resolver.sourceExts, 'mjs', 'js', 'jsx', 'ts', 'tsx', 'json', 'svg', 'png', 'jpg', 'webp'],
    extraNodeModules: {
      'react-native': require.resolve('react-native-web'),
      'react': require.resolve('react'),
      'react-dom': require.resolve('react-dom'),
      'stream': require.resolve('readable-stream'),
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

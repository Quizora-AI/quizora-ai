
/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */

const { getDefaultConfig } = require('@expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add all the extensions you need
config.resolver.assetExts.push('db');
config.resolver.sourceExts = [
  ...config.resolver.sourceExts,
  'mjs', 'cjs', 'json', 'svg', 'png', 'jpg', 'webp'
];

// React Native Web support
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  'react-native': require.resolve('react-native-web'),
  'react': require.resolve('react'),
  'react-dom': require.resolve('react-dom'),
};

// Transformer options
config.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: false,
    inlineRequires: true,
  },
});

// Use expo asset plugins
config.transformer.assetPlugins = ['expo-asset/tools/hashAssetFiles'];

// Server configuration
config.server = {
  port: 8081,
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      return middleware(req, res, next);
    };
  }
};

// Export the config
module.exports = config;

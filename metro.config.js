const { getDefaultConfig } = require('@expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.assetExts.push('db');
config.resolver.sourceExts.push('mjs', 'js', 'jsx', 'ts', 'tsx', 'json', 'svg', 'png', 'jpg', 'webp');
config.resolver.extraNodeModules = {
  'react-native': require.resolve('react-native-web'),
  'react': require.resolve('react'),
  'react-dom': require.resolve('react-dom'),
  'stream': require.resolve('readable-stream'),
};

config.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: false,
    inlineRequires: true,
  },
});
config.transformer.assetPlugins = ['expo-asset/tools/hashAssetFiles'];

config.server = {
  port: 8081,
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      return middleware(req, res, next);
    };
  }
};

module.exports = config;

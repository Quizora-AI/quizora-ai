// metro.config.js
const { getDefaultConfig } = require('@expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Extend asset extensions
config.resolver.assetExts = [...config.resolver.assetExts, 'db'];

// Extend source extensions
config.resolver.sourceExts = [
  ...new Set([
    ...config.resolver.sourceExts,
    'mjs',
    'js',
    'jsx',
    'ts',
    'tsx',
    'json',
    'svg',
    'png',
    'jpg',
    'webp',
  ]),
];

// Extra Node.js modules mapping
config.resolver.extraNodeModules = {
  ...(config.resolver.extraNodeModules || {}),
  'react-native': require.resolve('react-native-web'),
  'react': require.resolve('react'),
  'react-dom': require.resolve('react-dom'),
  'stream': require.resolve('readable-stream'),
};

// Transformer config
config.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: false,
    inlineRequires: true,
  },
});

config.transformer.assetPlugins = ['expo-asset/tools/hashAssetFiles'];

// Dev server middleware customization
config.server = {
  ...config.server,
  port: 8081,
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      return middleware(req, res, next);
    };
  },
};

module.exports = config;

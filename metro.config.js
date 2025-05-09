const { getDefaultConfig } = require("@react-native/metro-config");
const path = require('path');

const defaultConfig = getDefaultConfig(__dirname);

// Your customizations
const config = {
  ...defaultConfig,

  // Extend asset extensions
  resolver: {
    ...defaultConfig.resolver,
    assetExts: [...defaultConfig.resolver.assetExts, 'db'],
    sourceExts: [
      ...new Set([
        ...defaultConfig.resolver.sourceExts,
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
    ],
    extraNodeModules: {
      ...(defaultConfig.resolver.extraNodeModules || {}),
      'react-native': require.resolve('react-native-web'),
      'react': require.resolve('react'),
      'react-dom': require.resolve('react-dom'),
      'stream': require.resolve('readable-stream'),
    },
  },

  transformer: {
    ...defaultConfig.transformer,
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
    assetPlugins: ['expo-asset/tools/hashAssetFiles'],
  },

  server: {
    ...defaultConfig.server,
    port: 8081,
    enhanceMiddleware: (middleware) => {
      return (req, res, next) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        return middleware(req, res, next);
      };
    },
  },
};

module.exports = config;

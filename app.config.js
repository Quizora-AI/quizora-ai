
export default {
  name: 'Quizora AI',
  slug: 'quizora-ai',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff'
  },
  assetBundlePatterns: [
    '**/*'
  ],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.quizora.com'
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#ffffff'
    },
    package: 'com.quizora.com',
    permissions: [
      'INTERNET',
      'ACCESS_NETWORK_STATE'
    ]
  },
  web: {
    favicon: './assets/favicon.png'
  },
  plugins: [],
  extra: {
    eas: {
      projectId: "8e3ba7ff-542e-4cad-a22e-4b6376a1209d"
    }
  }
};

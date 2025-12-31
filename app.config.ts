import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => {
  // Build plugins array conditionally
  const plugins: (string | [string] | [string, unknown])[] = [
    'expo-font',
    ['react-native-permissions', { iosPermissions: ['Camera', 'PhotoLibrary', 'MediaLibrary'] }],
  ];

  // Only include Sentry plugin if configuration is provided
  if (process.env.EXPO_PUBLIC_SENTRY_PROJECT_NAME && process.env.EXPO_PUBLIC_SENTRY_ORG_NAME) {
    plugins.push([
      '@sentry/react-native/expo',
      {
        url: 'https://sentry.io/',
        project: process.env.EXPO_PUBLIC_SENTRY_PROJECT_NAME,
        organization: process.env.EXPO_PUBLIC_SENTRY_ORG_NAME,
      },
    ]);
  }

  plugins.push(
    '@react-native-firebase/app',
    '@react-native-firebase/messaging',
    [
      'expo-build-properties',
      {
        // https://github.com/invertase/notifee/issues/808#issuecomment-2175934609
        android: {
          minSdkVersion: 24,
          compileSdkVersion: 35,
          targetSdkVersion: 35,
          enableProguardInReleaseBuilds: true,
        },
        ios: { useFrameworks: 'static' },
      },
    ],
    './with-ffmpeg-pod.js',
  );

  return {
    name: 'Wiral',
    slug: process.env.EXPO_PUBLIC_APP_SLUG || 'wiral',
    version: '4.3.0',
    orientation: 'portrait',
    icon: './assets/icon.jpg',
    userInterfaceStyle: 'light',
    backgroundColor: '#ffffff',
    newArchEnabled: false,
    scheme: 'wiralapp',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'cover', 
      backgroundColor: '#ffffff',
      // 2025-12-09 thouseef-hamza: Added padding-safe logo to avoid side clipping
      imageStyle: {
        resizeMode: 'cover',
      },
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.wiral.app',
      infoPlist: {
        NSCameraUsageDescription:
          'This app requires access to the camera to upload images and videos.',
        NSPhotoLibraryUsageDescription:
          'This app requires access to the photo library to upload images.',
        NSMicrophoneUsageDescription: 'This app requires access to the microphone to record audio.',
        NSAppleMusicUsageDescription:
          'This app does not use Apple Music, but a system API may require this permission.',
        UIBackgroundModes: ['fetch', 'remote-notification'],
        ITSAppUsesNonExemptEncryption: false,
      },
      // Please use the relative path to the google-services.json file
      googleServicesFile:
        process.env.EXPO_PUBLIC_IOS_GOOGLE_SERVICES_FILE || './google-services.json',
      entitlements: { 'aps-environment': 'production' },
      associatedDomains: ['applinks:uat.wiral.ai'],
    },
    android: {
      adaptiveIcon: { foregroundImage: './assets/icon.jpg', backgroundColor: '#ffffff' },
      package: 'com.wiral.app',
      permissions: ['android.permission.CAMERA', 'android.permission.RECORD_AUDIO'],
      // Please use the relative path to the google-services.json file
      googleServicesFile:
        process.env.EXPO_PUBLIC_ANDROID_GOOGLE_SERVICES_FILE || './google-services.json',
      intentFilters: [
        {
          action: 'VIEW',
          autoVerify: true,
          data: [
            {
              scheme: 'https',
              host: 'uat.wiral.ai',
              pathPrefix: '/app/accounts/',
              pathPattern: '/*/conversations/*',
            },
          ],
          category: ['BROWSABLE', 'DEFAULT'],
        },
        {
          action: 'VIEW',
          data: [
            {
              scheme: 'wiralapp',
            },
          ],
          category: ['BROWSABLE', 'DEFAULT'],
        },
      ],
    },
    extra: {
      eas: {
        projectId: '5eeef906-87ff-42a6-8480-9c2d5e835463',
        storybookEnabled: process.env.EXPO_STORYBOOK_ENABLED,
      },
    },
    plugins,
    androidNavigationBar: { backgroundColor: '#ffffff' },
  };
};

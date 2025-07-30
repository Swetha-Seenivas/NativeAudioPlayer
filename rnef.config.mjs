import { platformIOS } from '@rnef/platform-ios';
import { platformAndroid } from '@rnef/platform-android';
import { pluginBrownfieldIos } from '@rnef/plugin-brownfield-ios';
import { pluginMetro } from '@rnef/plugin-metro';

export default {
  plugins: [
    pluginBrownfieldIos(),
  ],
  bundler: pluginMetro(),
  platforms: {
    ios: platformIOS(),
    android: platformAndroid(),
  },
  remoteCacheProvider: null,
};

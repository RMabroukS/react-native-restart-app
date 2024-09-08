"use strict";

import { NativeModules, Platform } from 'react-native';
const LINKING_ERROR = `The package 'react-native-restart-app' doesn't seem to be linked. Make sure: \n\n` + Platform.select({
  ios: "- You have run 'pod install'\n",
  default: ''
}) + '- You rebuilt the app after installing the package\n' + '- You are not using Expo Go\n';
const RestartApp = NativeModules.RestartApp ? NativeModules.RestartApp : new Proxy({}, {
  get() {
    throw new Error(LINKING_ERROR);
  }
});
export default function restart() {
  return RestartApp.restart();
}
//# sourceMappingURL=index.js.map
import { NativeModules, Platform } from 'react-native';
import NativeRestartApp from './NativeRestartApp';

const LINKING_ERROR =
  `The package 'react-native-restart-app' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

type RestartModule = { restart(): void };

// Resolution order:
//   1. TurboModule (New Architecture, JSI direct call — fastest, no serialization)
//   2. NativeModules bridge (Old Architecture)
//   3. Proxy that throws a clear error (module not linked)
//
// This covers RN 0.63+ through latest without requiring the interop layer.
function resolveNativeModule(): RestartModule {
  if (NativeRestartApp) {
    return NativeRestartApp;
  }
  if (NativeModules.RestartApp) {
    return NativeModules.RestartApp as RestartModule;
  }
  return new Proxy({} as RestartModule, {
    get() {
      throw new Error(LINKING_ERROR);
    },
  });
}

const nativeModule = resolveNativeModule();

export function restart(): void {
  nativeModule.restart();
}

export default restart;

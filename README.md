<img src="./free-palestine.jpg" title="Free Palestine" width="800">

# react-native-restart-app

Programmatically restart a React Native application on iOS and Android — in both debug and release builds, with Old Architecture and New Architecture (TurboModule) support.

[![npm version](https://img.shields.io/npm/v/react-native-restart-app.svg)](https://www.npmjs.com/package/react-native-restart-app)
[![license](https://img.shields.io/npm/l/react-native-restart-app.svg)](./LICENSE)
[![platform](https://img.shields.io/badge/platform-iOS%20%7C%20Android-lightgrey.svg)](#)

---

## Table of Contents

- [Features](#features)
- [Requirements](#requirements)
- [Installation](#installation)
- [Usage](#usage)
- [API](#api)
- [How It Works](#how-it-works)
- [Common Use Cases](#common-use-cases)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- Works in **debug and release** builds
- Supports **Old Architecture** (Bridge) and **New Architecture** (TurboModules / Bridgeless)
- Supports **Hermes** engine
- Full process restart on Android — clean state, no residual native memory
- Main-thread safe on iOS
- Handles foreground and background app states
- Zero dependencies beyond React Native itself

---

## Requirements

| Requirement | Minimum Version |
|-------------|----------------|
| React Native | 0.63 |
| iOS | 10.0 |
| Android API | 21 (Lollipop) |
| Kotlin | 1.6+ |

---

## Installation

```bash
npm install react-native-restart-app
# or
yarn add react-native-restart-app
```

### iOS

```bash
cd ios && pod install
```

### Android

No additional steps required. Auto-linking handles everything for React Native 0.60+.

#### React Native 0.59 and below (manual linking)

1. Add to `android/settings.gradle`:

```gradle
include ':react-native-restart-app'
project(':react-native-restart-app').projectDir = new File(rootProject.projectDir, '../node_modules/react-native-restart-app/android')
```

2. Add to `android/app/build.gradle` inside `dependencies`:

```gradle
implementation project(':react-native-restart-app')
```

3. Add to `MainApplication.java`:

```java
import com.restartapp.RestartAppPackage;

// inside getPackages():
new RestartAppPackage()
```

---

## Usage

```ts
import restart from 'react-native-restart-app';
// or
import { restart } from 'react-native-restart-app';

restart();
```

Both the default and named export point to the same function, so either import style works.

---

## API

### `restart(): void`

Immediately restarts the application.

- On **Android**: launches a fresh instance of the app's entry Activity and terminates the current process, ensuring all native state (Hermes heap, SQLite connections, background threads) is fully reset.
- On **iOS**: triggers `RCTTriggerReloadCommandListeners`, which instructs the React Native bridge (or ReactHost in Bridgeless mode) to reload the JS bundle from scratch.

The call is synchronous from JavaScript's perspective. There is no return value or promise — the app restarts before any response could be delivered.

---

## How It Works

### Android

The module obtains the current `Activity`, builds the app's launch `Intent` with `FLAG_ACTIVITY_NEW_TASK | FLAG_ACTIVITY_CLEAR_TASK`, calls `startActivity`, and then terminates the process via `Process.killProcess`. The OS delivers the intent and starts the new Activity before the old process exits.

When the app is in the background and no Activity reference is available, a 500 ms `AlarmManager` alarm is scheduled to relaunch the app, then the process is terminated immediately.

### iOS

The module dispatches `RCTTriggerReloadCommandListeners` on the main queue. This notifies all registered `RCTReloadCommand` listeners — including the bridge itself — which triggers a full JS bundle reload via `[RCTBridge reload]` (Old Architecture) or the equivalent ReactHost reload path (New Architecture / Bridgeless).

---

## Common Use Cases

**Language or locale change**

```ts
import { changeLanguage } from 'i18next';
import restart from 'react-native-restart-app';

async function switchLanguage(locale: string) {
  await changeLanguage(locale);
  restart();
}
```

**Theme change requiring a full reload**

```ts
import { saveTheme } from './storage';
import restart from 'react-native-restart-app';

async function applyTheme(theme: 'light' | 'dark') {
  await saveTheme(theme);
  restart();
}
```

**Error boundary recovery**

```tsx
import React from 'react';
import { View, Text, Button } from 'react-native';
import restart from 'react-native-restart-app';

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <View>
          <Text>Something went wrong.</Text>
          <Button title="Restart App" onPress={restart} />
        </View>
      );
    }
    return this.props.children;
  }
}
```

**After a remote config fetch**

```ts
import { fetchConfig } from './config';
import restart from 'react-native-restart-app';

async function refreshConfig() {
  await fetchConfig();
  restart();
}
```

---

## Troubleshooting

**`The package 'react-native-restart-app' doesn't seem to be linked`**

- Run `pod install` inside the `ios/` directory and rebuild.
- Ensure you rebuilt the native app after installing the package (`npx react-native run-ios` / `npx react-native run-android`).
- Expo Go is not supported. Use a development build (`expo run:ios` / `expo run:android`).

**Android: nothing happens in release build**

Upgrade to version 1.1.0 or later. Versions before 1.1.0 used a dev-only reload mechanism that is a no-op in release builds.

**iOS: restart appears to do nothing**

Ensure you are not calling `restart()` inside a `useEffect` cleanup or during unmount. The module dispatch is asynchronous — schedule the call after any cleanup has completed.

---

## Contributing

Contributions, bug reports, and feature requests are welcome. Please open an issue or pull request on [GitHub](https://github.com/RMabroukS/react-native-restart-app).

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development setup and guidelines.

---

## License

MIT — see [LICENSE](./LICENSE) for details.

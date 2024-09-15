<img src="./free-palestine.jpg" title="Free Palestine" width="800">

# react-native-restart-app

A simple module to restart your React Native app programmatically. This module works on both iOS and Android platforms, providing a unified API to restart the application when needed, such as after a configuration change or an error recovery action.

## Table of Contents

1. [Description](#description)
2. [Installation](#installation)
   - [React Native >= 0.60](#react-native--060)
   - [Extra Step for React Native <= 0.67](#extra-step-for-react-native--067)
   - [Manual iOS Installation](#manual-ios-installation)
   - [Manual Android Installation](#manual-android-installation)
3. [Usage](#usage)

---

## Description

`react-native-restart-app` allows you to restart your app from the code, which is especially useful when applying significant changes such as language updates, theme switching, or reloading configurations without requiring the user to manually restart the application.

## Installation

### React Native >= 0.60

For React Native version 0.60 and above, auto-linking will handle the linking of the library. Simply run the following command to install the module:

```bash
npm install react-native-restart-app
# or
yarn add react-native-restart-app
```

Run `pod install` in the `ios` directory to install the necessary pods:

```bash
cd ios/
pod install
```

### Extra Step for React Native <= 0.67

For React Native versions 0.67 and below, you need to add an extra step in the `Podfile`:

Add the following to your `Podfile`:

```ruby
pod 'react-native-restart-app', :path => '../node_modules/react-native-restart-app'
```

Then, run `pod install` in the `ios` directory to install the necessary pods:

```bash
cd ios/
pod install
```

Build your project using Xcode or via CLI:

```bash
npx react-native run-ios
```

### Manual iOS Installation

If auto-linking is not supported or you are using an older version of React Native (<0.60), you can manually link the library.

1. Open your project in Xcode and find the `Libraries` folder.
2. Right-click the folder and select "Add Files to [Your Project]".
3. Navigate to `node_modules/react-native-restart-app/ios/` and add `RNRestart.xcodeproj`.
4. In the "Build Phases" section of your project settings, add `libRNRestart.a` to "Link Binary With Libraries".
5. Perform a clean build with Xcode (`Cmd + Shift + K`) and then build the app again (`Cmd + B`).

### Manual Android Installation

For Android, manual linking can be performed as follows:

1. Open `android/settings.gradle` and add:

   ```gradle
   include ':react-native-restart-app'
   project(':react-native-restart-app').projectDir = new File(rootProject.projectDir, '../node_modules/react-native-restart-app/android')
   ```

2. In `android/app/build.gradle`, add the following line inside the `dependencies` block:

   ```gradle
   implementation project(':react-native-restart-app')
   ```

3. Open `MainApplication.java` and import the package:

   ```java
   import com.reactnativerestartapp.RNRestartPackage;
   ```

4. Then, add the package to your `getPackages` method:

   ```java
   @Override
   protected List<ReactPackage> getPackages() {
       return Arrays.<ReactPackage>asList(
           new MainReactPackage(),
           new RNRestartPackage() // Add this line
       );
   }
   ```

## Usage

To use `react-native-restart-app`, import it into your component and call the `restart` method when needed.

```javascript
import restart from 'react-native-restart-app';

// Example: Restart the app after a configuration change
const handleRestart = () => {
  // Perform any necessary cleanup or configuration here
  restart();
};
```

### Example Use Case

You can use the restart functionality after a language change in your app:

```javascript
const changeLanguage = (language) => {
  // Change app language or configuration
  i18n.changeLanguage(language);

  // Restart the app to apply the changes
  restart();
};
```

This will cause the app to reload and apply any new configurations, such as a language change, theme change, or other critical updates.

---

## License

This project is licensed under the MIT License.

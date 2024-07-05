## Quick Start

Use this template and follow the instructions to build the app: [Expo First App Tutorial](https://docs.expo.dev/tutorial/create-your-first-app/)

> **Note:** Do not use the `.tsx` style file; it's too complicated and unnecessary for this project. Your folder structure should look like the screenshot below:

<img width="772" alt="1" src="https://github.com/Zdong104/ZTrade/assets/77849792/eee81d57-5b92-45ff-a4a8-1e74935fb15c">


### Create the Project
```bash
# Create a project named StickerSmash
npx create-expo-app StickerSmash --template blank

# Navigate to the project directory
cd StickerSmash
```

### Prebuild the Project
```bash
npx expo prebuild
```

### Run on a Local Device Without a Server
1. Open the `ios/StickerSmash.xcworkspace` file in Xcode.
2. Click on the Project as shown below:
    <img width="1446" alt="2" src="https://github.com/Zdong104/ZTrade/assets/77849792/6f75b822-79cc-4e48-994a-5b2d70d972c1">
3. Click `Product` -> `Scheme` -> `Edit Scheme`:
    <img width="454" alt="3" src="https://github.com/Zdong104/ZTrade/assets/77849792/961e60ee-2843-43b1-9309-0de773611679">

    ![Edit Scheme](https://github.com/AInsight-AI/ViSportApp/assets/168395410/22de13dd-ba61-45a9-ba04-ce96b31e2175)
4. Under `Run`, select `Release` instead of `Debug`:
    <img width="1156" alt="4" src="https://github.com/Zdong104/ZTrade/assets/77849792/ae740bae-449c-49de-9279-b860fb2a5607">

    ![Run Release](https://github.com/AInsight-AI/ViSportApp/assets/168395410/6ea0cf73-df42-466e-9d59-7a039b736560)

## Install the Expo App
```bash
npm install expo
```

## Starting the App
Start the app within the Expo app:
```bash
npx expo start
```

## Installation and Uninstallation

### Remove the Global Expo CLI if Installed
```bash
npm uninstall -g expo-cli
```

### Install the Latest Version of Expo CLI Package
```bash
npm install expo-cli --global
```

### Use the Local Expo CLI Bundled with Your Project
Since you already have Node.js 20 installed, you can use `npx` to run the local Expo CLI:
```bash
npx expo start
```

### Clean npm Cache and Reinstall Node Modules
```bash
npm cache clean --force
rm -rf node_modules
npm install
```

### Start Your Project with the Local Expo CLI
```bash
npx expo start
```

## Pushing Files to Branches

### Push `zdong` to `main`
```bash
git push origin zdong:main
```

### Push `zdong` to `backup`
```bash
git push origin zdong:backup
```

## Building the App with Server on Mac

For detailed instructions, refer to the [Expo Prebuild Documentation](https://docs.expo.dev/workflow/prebuild/).

1. Install the iOS and Android folders:
    ```bash
    npx expo prebuild
    ```

2. Build the Native iOS Project:
    ```bash
    npx expo run:ios
    ```

3. Build on Device (Note: Do not build simultaneously on Simulator and Device):
    ```bash
    npx expo run:ios --device
    ```
    Ensure you are in the main directory `/visportapp` to avoid missing `package.json` errors.

    If you encounter a sandbox error during the build, refer to this [StackOverflow post](https://stackoverflow.com/questions/76792138/sandbox-bash72986-deny1-file-write-data-users-xxx-ios-pods-resources-to-co) and set User Script Sandboxing to No under All options.

## Watchman Issue Resolution

1. Uninstall Watchman:
    ```bash
    brew uninstall watchman
    ```

2. Replace Watchman Formula:
    ```bash
    brew install watchman
    ```

3. Pin the Watchman Version (remember to unpin once the problem is solved):
    ```bash
    brew pin watchman
    ```

4. Restart Server and Give Full Disk Access to Watchman in Settings - Privacy (MacOS 14.5):
    ```bash
    watchman shutdown-server
    ```

## Changing the Simulator Device

1. Start the Expo app:
    ```bash
    npx expo start
    ```

2. Press `shift + i`.

3. Select the device you want to work with.

## 常见问题

**Problem:** Error Cannot find module '@react-native/metro-config'

**Solution:**
```bash
npm install @react-native/metro-config --save
```

**Problem:** Error No Metro config found in `/Users/zihan/Desktop/TradeApp`.

**Solution:** Add a file named `metro.config.js` in the main folder containing:
```javascript
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const config = {};
module.exports = mergeConfig(getDefaultConfig(__dirname), config);
```

**Problem:** Folder has no `main.jsbundle` file

**Solution:**
```bash
react-native bundle --platform ios --dev false --entry-file /Users/zihan/Desktop/TradeApp/app/tabs/Home.js --bundle-output ios/main.jsbundle --assets-dest ios
```

# Expo Web Metro Bundler Error Report

## The Problem
When trying to run the Expo app on the web (`npx expo start --web`), the browser displayed a completely blank screen.
The browser console showed two main errors:
1. `SES Removing unpermitted intrinsics`
2. `Failed to load resource: the server responded with a status of 500 (Internal Server Error)` for the `index.bundle`

Additionally, the terminal later threw an error stating `Unable to resolve "@expo/vector-icons"`.

## Root Cause Analysis
Because the Metro Bundler was crashing silently under the hood and returning a generic 500 error to the browser, we had to manually fetch the raw error trace from the bundler using `curl`. 

The raw error revealed: `Cannot find module 'react-native-worklets/plugin'`.

Here is why this happened:
- We installed **NativeWind v4** for styling, which heavily relies on **React Native Reanimated (v4)** for animations.
- In version 4 of React Native Reanimated, they extracted their worklets engine into a completely separate package called `react-native-worklets`.
- Because this peer dependency was missing, the Babel compiler crashed entirely when trying to build the Javascript bundle for the web, resulting in the 500 Internal Server Error. 
- The `SES Removing unpermitted intrinsics` warning is a side-effect often seen in modern Expo Web apps when Reanimated fails to initialize its secure context correctly due to missing babel plugins.

## The Solution
To fix the underlying build crash, we performed the following steps:

1. **Install Missing Dependencies:**
   We explicitly installed the missing worklets module that Reanimated v4 requires:
   ```bash
   npm install react-native-worklets@latest --legacy-peer-deps
   ```

2. **Update Babel Configuration:**
   We added the strict requirement for the Reanimated babel plugin. `babel.config.js` was updated to include:
   ```javascript
   plugins: [
     'react-native-reanimated/plugin',
   ],
   ```

3. **Resolved Vector Icons:**
   We installed `@expo/vector-icons` to fix the missing imports in `LoginScreen.tsx`:
   ```bash
   npm install @expo/vector-icons --legacy-peer-deps
   ```

4. **Clear Cache and Restart:**
   Finally, because we modified `babel.config.js` and installed deeply-integrated native modules, we had to completely clear the Metro bundler cache to rebuild the bundle from scratch:
   ```bash
   npx expo start -c --web
   ```

After these steps, the Expo Metro Bundler successfully compiled the `index.bundle` and the UI rendered perfectly on the web.

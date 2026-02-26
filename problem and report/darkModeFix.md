# Why Dark Mode is Not Working in SettingsScreen

The current implementation of Dark Mode in your `SettingsScreen.tsx` has three main issues that prevent it from actually changing the app's appearance.

---

### 1. Hardcoded Hex Colors
In your `SettingsScreen.tsx`, you are using hardcoded hex codes for background colors, like this:
```tsx
<SafeAreaView className="flex-1 bg-[#FDFCF5]">
```
The problem is that hex codes like `#FDFCF5` are "static". To make them support dark mode, you need to use the Tailwind classes we defined in your `tailwind.config.js` and add the `dark:` prefix.

**Correct Way:**
```tsx
<SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
```

### 2. Local State vs. Global Theme
You created a local state for the toggle:
```tsx
const [isDarkMode, setIsDarkMode] = useState(false);
```
This only updates a variable *inside* that specific screen. It doesn't tell NativeWind or the rest of the app to switch themes.

### 3. Missing the `useColorScheme` Hook
NativeWind provides a special hook called `useColorScheme` (usually imported from `nativewind`) that controls the entire app's theme. To fix the toggle, you need to use this hook to switch between 'light' and 'dark' modes globally.

---

## Steps to Fix

### Step 1: Import the Theme Hook
At the top of `SettingsScreen.tsx`, import `useColorScheme`:
```tsx
import { useColorScheme } from "nativewind";
```

### Step 2: Connect the Switch to the Global Theme
Inside your component, replace your local `useState` with the hook:
```tsx
const { colorScheme, setColorScheme } = useColorScheme();
const isDarkMode = colorScheme === 'dark';

const toggleDarkMode = () => {
    setColorScheme(isDarkMode ? 'light' : 'dark');
};
```

### Step 3: Update the Switch Props
Update your `Switch` component to use these new values:
```tsx
<Switch
    value={isDarkMode}
    onValueChange={toggleDarkMode}
    // ... other props
/>
```

### Step 4: Refactor with Tailwind Classes
Go through your `SettingsScreen.tsx` and replace any `bg-[#...]` or `text-[#...]` classes with the theme classes we set up, ensuring you use the `dark:` prefix for anything that should change when the lights go out!
- Backgrounds: `bg-background-light dark:bg-background-dark`
- Surface: `bg-surface dark:bg-surface-dark`
- Text: `text-text-main dark:text-white`

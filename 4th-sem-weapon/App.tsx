import React from 'react';
import { SafeAreaView, StatusBar } from 'react-native';
import { ClerkProvider, ClerkLoaded, SignedIn, SignedOut } from '@clerk/clerk-expo';
import * as SecureStore from 'expo-secure-store';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import './global.css';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, Text, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useColorScheme } from 'nativewind';


import ProfileScreen from './src/screens/ProfileScreen';
import LoginScreen from './src/screens/LoginScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import DashboardScreen from './src/screens/DashboardScreen';

const PlaceholderScreen = ({ name }: { name: string }) => (
  <View className="flex-1 justify-center items-center bg-background-light dark:bg-background-dark">
    <Text className="text-2xl font-bold text-text-main dark:text-white font-display">{name}</Text>
    <Text className="text-text-muted font-body mt-2">Chamber under construction...</Text>
  </View>
);


const tokenCache = {
  async getToken(key: string) {
    try {
      const item = await SecureStore.getItemAsync(key);
      if (item) {
        console.log(`${key} was used 🔐 \n`);
      } else {
        console.log('No values stored under key: ' + key);
      }
      return item;
    } catch (error) {
      console.error('SecureStore get item error: ', error);
      await SecureStore.deleteItemAsync(key);
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      return SecureStore.setItemAsync(key, value);
    } catch (err) {
      return;
    }
  },
};

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error('Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env');
}

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// -- the 5 slot tab navigator --

function MainTabs() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Tab.Navigator
      id={undefined}
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: isDark ? '#1c2111' : '#FDFCF5',
          borderTopColor: isDark ? '#2a3020' : '#F4F1EA',
          height: 60,
          paddingBottom: 0,
          paddingTop: 0,
        },
        tabBarActiveTintColor: '#6B8E23', // Your primary olive green
        tabBarInactiveTintColor: isDark ? '#64748b' : '#95A5A6', // Muted gray
      }}
    >
      <Tab.Screen
        name="Dojo"
        component={DashboardScreen}
        options={{ tabBarIcon: ({ color }) => <MaterialIcons name="home" size={24} color={color} /> }}
      />
      <Tab.Screen
        name="Quest"
        component={() => <PlaceholderScreen name="Quest Log" />}
        options={{ tabBarIcon: ({ color }) => <MaterialIcons name="map" size={24} color={color} /> }}
      />

      {/* 🌟 THE CENTER UPLOAD ANCHOR */}
      <Tab.Screen
        name="Upload"
        component={() => <PlaceholderScreen name="Upload" />}
        options={{
          tabBarLabel: () => null, // Hide the text so the button can be bigger
          tabBarIcon: () => (
            <View
              className="bg-[#6B8E23] w-14 h-14 rounded-full items-center justify-center shadow-lg -mt-6 border-4"
              style={{ borderColor: isDark ? '#1c2111' : '#FDFCF5' }}
            >
              <MaterialIcons name="cloud-upload" size={32} color="white" />
            </View>
          )
        }}
      />

      <Tab.Screen
        name="Chat"
        component={() => <PlaceholderScreen name="AI Oracle" />}
        options={{ tabBarIcon: ({ color }) => <MaterialIcons name="smart-toy" size={24} color={color} /> }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarIcon: ({ color }) => <MaterialIcons name="account-tree" size={24} color={color} /> }}
      />
    </Tab.Navigator>
  );
}


export default function App() {
  const { colorScheme, setColorScheme } = useColorScheme();

  // Force dark mode on initial app load if no preference is set yet
  React.useEffect(() => {
    if (colorScheme !== 'dark' && colorScheme !== 'light') {
      setColorScheme('dark');
    }
  }, []);

  // Web synchronization override
  React.useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      if (colorScheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [colorScheme]);

  return (
    <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
      <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
        <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
        <ClerkLoaded>
          <NavigationContainer>
            <SignedIn>
              <Stack.Navigator id={undefined} screenOptions={{ headerShown: false }}>
                <Stack.Screen name="MainTabs" component={MainTabs} />
                <Stack.Screen name="Settings" component={SettingsScreen} />
              </Stack.Navigator>
            </SignedIn>
            <SignedOut>
              <LoginScreen />
            </SignedOut>
          </NavigationContainer>
        </ClerkLoaded>
      </SafeAreaView>
    </ClerkProvider>
  );
}
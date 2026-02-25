import React from 'react';
import { SafeAreaView, StatusBar } from 'react-native';
import './global.css';

// Importing your newly typed Login Screen
import LoginScreen from './src/screens/LoginScreen';

export default function App() {
  return (
    <SafeAreaView className="flex-1 bg-[#F9FAF9]">
      <StatusBar barStyle="dark-content" />
      {/* Rendering the Login UI */}
      <LoginScreen />
    </SafeAreaView>
  );
}
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    return (
        <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                className="flex-1"
            >
                <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 16 }}>
                    <View className="w-full max-w-[480px] self-center bg-white dark:bg-zinc-900/50 rounded-[2rem] border border-primary/10 shadow-lg overflow-hidden p-8">

                        {/* --- Header Section --- */}
                        <View className="items-center mb-8">
                            <View className="p-4 rounded-full mb-4 bg-[#F4F7E6]">
                                <MaterialIcons name="eco" size={48} color="#6B8E23" />
                            </View>
                            <Text className="text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Zen Level-Up</Text>
                            <Text className="text-slate-600 dark:text-slate-400 mt-2 text-center text-base">
                                Find your balance, level your life.
                            </Text>
                        </View>

                        <View className="w-full">
                            {/* --- Social Login --- */}
                            <TouchableOpacity className="w-full flex-row items-center justify-center gap-3 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 py-3 rounded-full shadow-sm mb-4">
                                <Svg width="20" height="20" viewBox="0 0 24 24">
                                    <Path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <Path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <Path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                                    <Path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </Svg>
                                <Text className="text-slate-700 dark:text-slate-200 font-medium text-base">Continue with Google</Text>
                            </TouchableOpacity>

                            {/* --- Divider --- */}
                            <View className="flex-row items-center py-4 mb-4">
                                <View className="flex-1 h-[1px] bg-slate-200 dark:bg-zinc-800" />
                                <Text className="mx-4 text-slate-400 text-sm font-medium">or email</Text>
                                <View className="flex-1 h-[1px] bg-slate-200 dark:bg-zinc-800" />
                            </View>

                            {/* --- Form Elements --- */}
                            <View className="mb-4 w-full">
                                <Text className="text-slate-700 dark:text-slate-300 text-sm font-medium mb-1.5 ml-1">Email</Text>
                                <TextInput
                                    className="w-full bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-slate-100 p-3.5 rounded-full shadow-sm"
                                    placeholder="you@zen.com"
                                    placeholderTextColor="#94a3b8"
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                            </View>

                            <View className="mb-2 w-full">
                                <Text className="text-slate-700 dark:text-slate-300 text-sm font-medium mb-1.5 ml-1">Password</Text>
                                <View className="relative w-full justify-center">
                                    <TextInput
                                        className="w-full bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-slate-100 p-3.5 rounded-full shadow-sm pr-12"
                                        placeholder="••••••••"
                                        placeholderTextColor="#94a3b8"
                                        value={password}
                                        onChangeText={setPassword}
                                        secureTextEntry={!isPasswordVisible}
                                    />
                                    <TouchableOpacity
                                        className="absolute right-4"
                                        onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                                        style={{ height: '100%', justifyContent: 'center' }}
                                    >
                                        <MaterialIcons
                                            name={isPasswordVisible ? "visibility" : "visibility-off"}
                                            size={20}
                                            color="#94a3b8"
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* --- Options --- */}
                            <View className="flex-row items-center justify-between py-2 mb-4">
                                <TouchableOpacity
                                    className="flex-row items-center gap-2"
                                    onPress={() => setRememberMe(!rememberMe)}
                                >
                                    <View className={`w-5 h-5 rounded border items-center justify-center ${rememberMe ? 'bg-primary border-primary' : 'bg-white dark:bg-zinc-800 border-slate-300 dark:border-zinc-700'}`}>
                                        {rememberMe && <MaterialIcons name="check" size={14} color="white" />}
                                    </View>
                                    <Text className="text-sm text-slate-600 dark:text-slate-400">Remember me</Text>
                                </TouchableOpacity>
                                <TouchableOpacity>
                                    <Text className="text-sm text-primary font-medium">Forgot password?</Text>
                                </TouchableOpacity>
                            </View>

                            {/* --- Main Action Button --- */}
                            <TouchableOpacity className="w-full bg-primary py-4 rounded-full items-center shadow-md mb-8">
                                <Text className="text-white font-bold text-base">Begin Your Journey</Text>
                            </TouchableOpacity>

                            {/* --- Footer Link --- */}
                            <View className="flex-row justify-center">
                                <Text className="text-slate-500 dark:text-slate-400 text-sm">
                                    New to the path?{' '}
                                </Text>
                                <TouchableOpacity>
                                    <Text className="text-primary font-bold text-sm">Join the Dojo</Text>
                                </TouchableOpacity>
                            </View>

                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
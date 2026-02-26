import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, Switch } from 'react-native';
import { MaterialIcons } from "@expo/vector-icons";
import { useAuth } from "@clerk/clerk-expo";
import { useColorScheme } from "nativewind";

export default function SettingsScreen({ navigation }: any) {
    const { colorScheme, setColorScheme } = useColorScheme();
    // Default to 'light' if colorScheme is undefined on first load
    const isDarkMode = colorScheme === 'dark';

    const toggleDarkMode = () => {
        setColorScheme(isDarkMode ? 'light' : 'dark');
    };
    const { signOut } = useAuth();

    const handleSignOut = async () => {
        try {
            await signOut();
            console.log("🟢 System Disconnected.");
        } catch (err) {
            console.error("🚨 Sign out error:", err);
        }
    };
    return (
        <SafeAreaView className="flex-1 bg-surface dark:bg-background-dark">
            <View className="flex-row items-center justify-between px-4 py-4 border-b border-primary/10 bg-background-light dark:bg-background-dark">
                <TouchableOpacity onPress={() => navigation.goBack()}
                    className="w-10 h-10 items-center justify-center rounded-full bg-primary/10">
                    <MaterialIcons name="arrow-back" size={24} color="#6B8E23" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-text-main dark:text-white font-display tracking-tight">Settings & Inventory</Text>
                <View className="w-10 h-10" />
            </View>
            <ScrollView className="flex-1 px-4 py-6" showsVerticalScrollIndicator={false}>
                <View className="mb-8">
                    <Text className="text-xs font-bold font-mono tracking-wider text-primary mb-3 px-2">General Settings</Text>
                    <View className="bg-background-light dark:bg-surface-dark rounded-2xl overflow-hidden border border-primary/10 shadow-sm">
                        {/* Dark Mode Toggle */}
                        <View className="flex-row items-center justify-between px-4 py-4 border-b border-primary/5">
                            <View className="flex-row items-center gap-4">
                                <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center">
                                    <MaterialIcons name="dark-mode" size={24} color="#6B8E23" />
                                </View>
                                <View>
                                    <Text className="text-text-main dark:text-white font-bold font-display">Dark Mode</Text>
                                    <Text className="text-text-muted font-body text-xs">Enable dark mode for a better experience</Text>
                                </View>
                            </View>
                            <Switch
                                value={isDarkMode}
                                onValueChange={toggleDarkMode}
                                trackColor={{ false: "#E2E8F0", true: "#6B8E23" }}
                                thumbColor={"#FFFFFF"}
                                ios_backgroundColor="#E2E8F0"
                            />
                        </View>

                        {/* Profile settings */}
                        <TouchableOpacity className="flex-row items-center justify-between px-4 py-4 border-b border-primary/5">
                            <View className="flex-row items-center gap-4">
                                <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center">
                                    <MaterialIcons name="person" size={20} color="#6B8E23" />
                                </View>
                                <View>
                                    <Text className="text-text-main dark:text-white font-bold font-display">Profile</Text>
                                    <Text className="text-text-muted font-body text-xs">Manage your Bio, Goals, and avatar</Text>
                                </View>
                            </View>
                            <MaterialIcons name="chevron-right" size={24} color="#6B8E23" />
                        </TouchableOpacity>

                        {/* Reset Semester */}
                        <TouchableOpacity className="flex-row items-center justify-between px-4 py-4 border-b border-primary/5">
                            <View className="flex-row items-center gap-4">
                                <View className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 items-center justify-center">
                                    <MaterialIcons name="history" size={20} color="#E53E3E" />
                                </View>
                                <View>
                                    <Text className="text-text-main dark:text-white font-bold font-display">Reset Semester</Text>
                                    <Text className="text-text-muted font-body text-xs">Clear all progress for current term</Text>
                                </View>
                            </View>
                            <MaterialIcons name="delete-forever" size={20} color="#95A5A6" />
                        </TouchableOpacity>

                        {/* 🚨 Disconnect System (Sign Out) */}
                        <TouchableOpacity
                            onPress={handleSignOut}
                            className="flex-row items-center justify-between px-4 py-4 bg-red-50/50 dark:bg-red-900/10"
                        >
                            <View className="flex-row items-center gap-4">
                                <View className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 items-center justify-center">
                                    <MaterialIcons name="logout" size={20} color="#E53E3E" />
                                </View>
                                <View>
                                    <Text className="font-bold font-display text-red-600 dark:text-red-400">Disconnect System</Text>
                                    <Text className="text-xs font-body text-red-400 dark:text-red-500">Sign out of your account</Text>
                                </View>
                            </View>
                            <MaterialIcons name="logout" size={20} color="#E53E3E" />
                        </TouchableOpacity>

                    </View>
                </View>

                {/*--- Inventory Scratched Section --- */}
                <View className="mb-8">
                    <View className="flex-row items-center justify-between px-4 mb-3">
                        <Text className="text-xs font-bold font-mono tracking-wider text-primary">Inventory</Text>
                        <TouchableOpacity>
                            <Text className="text-primary text-xs font-bold font-mono">Clear All</Text>
                        </TouchableOpacity>
                    </View>

                    <View className="bg-primary/5 rounded-2xl p-4 border-2 border-dashed border-primary/20">
                        <View className="mb-4 flex-row items-center gap-2">
                            <MaterialIcons name="edit-note" size={20} color="#6B8E23" />
                            <View>
                                <Text className="text-sm font-bold font-display text-text-main dark:text-white">Quick Links & Snippets</Text>
                                <Text className="text-xs font-body text-text-muted">Temporary storage for links and notes.</Text>
                            </View>
                        </View>
                    </View>

                    {/* Scratchpad Item 1 */}
                    <View className="bg-surface dark:bg-surface-dark p-3 rounded-xl border border-primary/10 mb-2 flex-row justify-between items-center mt-3 shadow-sm">
                        <View className="flex-1 mr-2">
                            <Text className="text-sm font-bold font-display text-primary mb-1">Calculus Resources</Text>
                            <Text className="text-xs font-body text-text-muted truncate" numberOfLines={1}>https://ocw.mit.edu/courses/mathematics/...</Text>
                        </View>
                        <View className="flex-row gap-2">
                            <MaterialIcons name="content-copy" size={18} color="#95A5A6" />
                            <MaterialIcons name="close" size={18} color="#E53E3E" />
                        </View>
                    </View>

                    {/* Scratchpad Item 2 */}
                    <View className="bg-surface dark:bg-surface-dark p-3 rounded-xl border border-primary/10 mb-4 flex-row justify-between items-center shadow-sm">
                        <View className="flex-1 mr-2">
                            <Text className="text-sm font-bold font-display text-primary mb-1">Weekly Mantra</Text>
                            <Text className="text-xs font-body text-text-muted italic" numberOfLines={2}>"Discipline is the bridge between goals and accomplishment."</Text>
                        </View>
                        <View className="flex-row gap-2">
                            <MaterialIcons name="edit" size={18} color="#95A5A6" />
                            <MaterialIcons name="close" size={18} color="#E53E3E" />
                        </View>
                    </View>

                    {/* Add Button */}
                    <TouchableOpacity className="w-full py-3 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 items-center justify-center flex-row gap-2 active:opacity-70">
                        <MaterialIcons name="add-circle" size={20} color="#6B8E23" />
                        <Text className="text-primary font-bold font-display">Add to Inventory</Text>
                    </TouchableOpacity>
                </View>

                {/* --- Mood Area --- */}
                <View className="items-center justify-center py-6 bg-primary/10 rounded-2xl mb-12">
                    <MaterialIcons name="spa" size={32} color="#6B8E23" style={{ opacity: 0.5, marginBottom: 8 }} />
                    <Text className="text-sm text-primary font-bold font-body mt-2 opacity-80">Stay focused, stay level.</Text>
                </View>

            </ScrollView>
        </SafeAreaView>
    )
}
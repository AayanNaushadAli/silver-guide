import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, Image, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useUser } from '@clerk/clerk-expo';
import { useColorScheme } from 'nativewind';

export default function ChatScreen({ navigation }: any) {
    const { user } = useUser();
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';

    return (
        <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                {/* --- Header --- */}
                <View className="flex-row items-center justify-between px-6 py-4 bg-background-light/90 dark:bg-background-dark/90 border-b border-primary/10 z-10">
                    <View className="flex-row items-center gap-3">
                        <TouchableOpacity onPress={() => navigation.navigate('Dojo')} className="p-2 bg-primary/10 rounded-full mr-1">
                            <MaterialIcons name="arrow-back" size={24} color="#6B8E23" />
                        </TouchableOpacity>
                        <View className="p-2 bg-primary/10 rounded-xl">
                            <MaterialIcons name="auto-awesome" size={24} color="#6B8E23" />
                        </View>
                        <View>
                            <Text className="text-lg font-bold text-text-main dark:text-white leading-tight">The Oracle</Text>
                            <View className="flex-row items-center gap-1.5">
                                <View className="h-2 w-2 rounded-full bg-primary" />
                                <Text className="text-[10px] font-bold text-primary uppercase tracking-wider">Online & Ready</Text>
                            </View>
                        </View>
                    </View>
                    <TouchableOpacity className="p-2 rounded-full hover:bg-primary/5">
                        <MaterialIcons name="more-vert" size={24} color="#95A5A6" />
                    </TouchableOpacity>
                </View>

                {/* --- Chat Area --- */}
                <ScrollView className="flex-1 px-4 pt-2" showsVerticalScrollIndicator={false}>

                    <View className="text-center py-4 items-center">
                        <Text className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em]">Matcha Latte Theme • Zen Level-Up</Text>
                    </View>

                    {/* AI Message 1 */}
                    <View className="flex-row items-start gap-3 w-[85%] mb-6">
                        <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center border border-primary/20">
                            <MaterialIcons name="psychology" size={20} color="#6B8E23" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-[11px] font-bold text-text-muted ml-1 mb-1">The Oracle</Text>
                            <View className="bg-surface dark:bg-surface-dark p-4 rounded-2xl rounded-tl-none shadow-sm border border-primary/10">
                                <Text className="text-text-main dark:text-white text-sm leading-relaxed">
                                    I've analyzed the Thermodynamics PYQs from the last five years. There's a high probability of questions regarding the Carnot Cycle and Entropy. Would you like me to highlight the most frequent topics?
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* User Message */}
                    <View className="flex-row items-start justify-end gap-3 w-[85%] self-end mb-6">
                        <View className="flex-1 items-end">
                            <Text className="text-[11px] font-bold text-text-muted mr-1 mb-1">You</Text>
                            <View className="bg-primary p-4 rounded-2xl rounded-tr-none shadow-sm">
                                <Text className="text-white text-sm leading-relaxed">
                                    Yes, please! Also, can we focus on the second law of thermodynamics? I need a quick refresher on the Clausius statement.
                                </Text>
                            </View>
                        </View>
                        <Image
                            source={{ uri: user?.imageUrl || 'https://via.placeholder.com/150' }}
                            className="w-10 h-10 rounded-full border-2 border-white dark:border-surface-dark bg-gray-200"
                        />
                    </View>

                    {/* AI Message 2 */}
                    <View className="flex-row items-start gap-3 w-[85%] mb-6">
                        <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center border border-primary/20">
                            <MaterialIcons name="psychology" size={20} color="#6B8E23" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-[11px] font-bold text-text-muted ml-1 mb-1">The Oracle</Text>
                            <View className="bg-surface dark:bg-surface-dark p-4 rounded-2xl rounded-tl-none shadow-sm border border-primary/10">
                                <Text className="text-text-main dark:text-white text-sm leading-relaxed">
                                    Understood. The Second Law is fundamental. I've prepared a concise summary of the Clausius and Kelvin-Planck statements. Would you like to start with the concept or jump straight into a practice problem?
                                </Text>
                            </View>
                        </View>
                    </View>

                    <View className="h-6" /> {/* Bottom padding */}
                </ScrollView>

                {/* --- Footer Area (Input & Chips) --- */}
                <View className="p-4 bg-background-light dark:bg-background-dark border-t border-primary/10">

                    {/* Action Chips */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3" contentContainerStyle={{ gap: 8 }}>
                        <TouchableOpacity className="px-4 py-2 bg-surface dark:bg-surface-dark border border-primary/20 rounded-full flex-row items-center gap-2">
                            <MaterialIcons name="summarize" size={16} color="#6B8E23" />
                            <Text className="text-xs font-bold text-text-main dark:text-white">Summarize Ch 4</Text>
                        </TouchableOpacity>
                        <TouchableOpacity className="px-4 py-2 bg-surface dark:bg-surface-dark border border-primary/20 rounded-full flex-row items-center gap-2">
                            <MaterialIcons name="flag" size={16} color="#6B8E23" />
                            <Text className="text-xs font-bold text-text-main dark:text-white">Next Study Goal</Text>
                        </TouchableOpacity>
                        <TouchableOpacity className="px-4 py-2 bg-surface dark:bg-surface-dark border border-primary/20 rounded-full flex-row items-center gap-2">
                            <MaterialIcons name="quiz" size={16} color="#6B8E23" />
                            <Text className="text-xs font-bold text-text-main dark:text-white">Quick Quiz</Text>
                        </TouchableOpacity>
                    </ScrollView>

                    {/* Text Input */}
                    <View className="flex-row items-center gap-2">
                        <View className="flex-1 relative justify-center">
                            <TextInput
                                className="w-full bg-surface dark:bg-surface-dark border border-primary/20 rounded-xl pl-4 pr-10 py-3.5 text-sm text-text-main dark:text-white"
                                placeholder="Ask the Oracle anything..."
                                placeholderTextColor="#95A5A6"
                            />
                            <TouchableOpacity className="absolute right-3">
                                <MaterialIcons name="attach-file" size={20} color="#95A5A6" />
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity className="bg-primary p-3.5 rounded-xl items-center justify-center shadow-sm">
                            <MaterialIcons name="send" size={20} color="white" />
                        </TouchableOpacity>
                    </View>

                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
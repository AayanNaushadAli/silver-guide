import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useUser } from '@clerk/clerk-expo';
import { useColorScheme } from 'nativewind';

export default function LeaderboardScreen({ navigation }: any) {
    const [activeTab, setActiveTab] = useState('Global');
    const { user } = useUser();
    const { colorScheme } = useColorScheme();
    const isDarkMode = colorScheme === 'dark';

    // Mock Data: The 4th-Semester Rivals
    const topPlayers = {
        first: { name: 'Yuki', pts: '15.8k', avatar: 'https://i.pravatar.cc/150?img=68' },
        second: { name: 'Satoshi', pts: '12.4k', avatar: 'https://i.pravatar.cc/150?img=47' },
        third: { name: 'Hana', pts: '11.1k', avatar: 'https://i.pravatar.cc/150?img=5' }
    };

    const leaderboardList = [
        { rank: 4, name: 'Marcus', level: 24, pts: '9.2k', avatar: 'https://i.pravatar.cc/150?img=11' },
        { rank: 5, name: 'Elena', level: 22, pts: '8.8k', avatar: 'https://i.pravatar.cc/150?img=9' },
        { rank: 6, name: 'Chen', level: 21, pts: '8.5k', avatar: 'https://i.pravatar.cc/150?img=12' },
    ];

    return (
        <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">

            {/* --- Header --- */}
            <View className="flex-row items-center justify-between px-6 py-4 border-b border-primary/10">
                <TouchableOpacity onPress={() => navigation.goBack()}
                    className="w-10 h-10 bg-primary/10 rounded-full items-center justify-center">
                    <MaterialIcons name="arrow-back" size={24} color="#6B8E23" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-text-main dark:text-white font-display">Zen Leaderboard</Text>
                <TouchableOpacity className="w-10 h-10 bg-primary/10 rounded-full items-center justify-center">
                    <MaterialIcons name="share" size={20} color="#6B8E23" />
                </TouchableOpacity>
            </View>

            {/* --- Global / Batch Toggle --- */}
            <View className="px-6 mt-6 mb-6">
                <View className="flex-row bg-primary/5 dark:bg-surface-dark p-1 rounded-full border border-primary/10">
                    <TouchableOpacity
                        onPress={() => setActiveTab('Global')}
                        className={`flex-1 py-3 rounded-full items-center ${activeTab === 'Global' ? 'bg-white dark:bg-primary shadow-sm' : ''}`}
                    >
                        <Text className={`font-bold ${activeTab === 'Global' ? (isDarkMode ? 'text-white' : 'text-primary') : 'text-text-muted'}`}>Global Ranking</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setActiveTab('Batch')}
                        className={`flex-1 py-3 rounded-full items-center ${activeTab === 'Batch' ? 'bg-white dark:bg-primary shadow-sm' : ''}`}
                    >
                        <Text className={`font-bold ${activeTab === 'Batch' ? (isDarkMode ? 'text-white' : 'text-primary') : 'text-text-muted'}`}>Batch Ranking</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 130 }}>

                {/* --- The 3D Podium --- */}
                <View className="flex-row justify-center items-end mt-4 mb-10 h-48">

                    {/* 2nd Place */}
                    <View className="items-center mb-4 z-10">
                        <View className="relative">
                            <Image source={{ uri: topPlayers.second.avatar }}
                                className="w-20 h-20 rounded-full border-4 border-background-light dark:border-surface-dark bg-gray-200" />
                            <View className="absolute -bottom-3 self-center bg-gray-300 dark:bg-gray-600 px-3 py-1 rounded-full border-2 border-white dark:border-background-dark shadow-sm">
                                <Text className="text-gray-700 dark:text-white font-bold text-[10px]">2ND</Text>
                            </View>
                        </View>
                        <Text className="font-bold text-text-main dark:text-white mt-4">{topPlayers.second.name}</Text>
                        <Text className="text-primary text-xs font-bold">{topPlayers.second.pts} pts</Text>
                    </View>

                    {/* 1st Place */}
                    <View className="items-center mx-4 z-20 mb-8">
                        <MaterialIcons name="workspace-premium" size={28} color="#F1C40F" className="mb-1" />
                        <View className="relative">
                            <Image source={{ uri: topPlayers.first.avatar }}
                                className="w-24 h-24 rounded-full border-4 border-[#F1C40F] bg-gray-200" />
                            <View className="absolute -bottom-3 self-center bg-[#F1C40F] px-4 py-1 rounded-full border-2 border-white dark:border-background-dark shadow-sm">
                                <Text className="text-white font-bold text-[10px]">1ST</Text>
                            </View>
                        </View>
                        <Text className="font-bold text-text-main dark:text-white text-lg mt-4">{topPlayers.first.name}</Text>
                        <Text className="text-primary font-bold">{topPlayers.first.pts} pts</Text>
                    </View>

                    {/* 3rd Place */}
                    <View className="items-center mb-2 z-10">
                        <View className="relative">
                            <Image source={{ uri: topPlayers.third.avatar }}
                                className="w-16 h-16 rounded-full border-4 border-background-light dark:border-surface-dark bg-gray-200" />
                            <View className="absolute -bottom-3 self-center bg-orange-400 px-3 py-1 rounded-full border-2 border-white dark:border-background-dark shadow-sm">
                                <Text className="text-white font-bold text-[10px]">3RD</Text>
                            </View>
                        </View>
                        <Text className="font-bold text-text-main dark:text-white mt-4">{topPlayers.third.name}</Text>
                        <Text className="text-primary text-xs font-bold">{topPlayers.third.pts} pts</Text>
                    </View>
                </View>

                {/* --- The Competitors List --- */}
                {leaderboardList.map((player) => (
                    <View key={player.rank} className="flex-row items-center bg-surface dark:bg-surface-dark p-4 rounded-2xl mb-3 border border-primary/10 shadow-sm">
                        <Text className="w-8 font-bold text-text-muted text-lg">{player.rank}</Text>
                        <Image source={{ uri: player.avatar }} className="w-12 h-12 rounded-full mr-4 bg-gray-100" />
                        <View className="flex-1">
                            <Text className="font-bold text-text-main dark:text-white text-base">{player.name}</Text>
                            <Text className="text-xs text-text-muted uppercase font-medium mt-0.5">Level {player.level}</Text>
                        </View>
                        <Text className="font-bold text-primary">{player.pts}</Text>
                    </View>
                ))}
            </ScrollView>

            {/* --- Sticky Current Player Card --- */}
            <View className="absolute bottom-6 left-6 right-6 bg-primary p-4 rounded-3xl flex-row items-center shadow-lg border border-primary/20">
                <Text className="w-8 font-bold text-white text-lg">12</Text>
                <Image source={{ uri: user?.imageUrl || 'https://via.placeholder.com/150' }} className="w-12 h-12 rounded-full mr-4 border-2 border-white/30" />
                <View className="flex-1">
                    <Text className="font-bold text-white text-base">You ({user?.firstName || 'Aayan'})</Text>
                    <Text className="text-[10px] text-white/80 uppercase tracking-wider mt-0.5">Next Rank in 450 pts</Text>
                </View>
                <View className="items-end">
                    <Text className="font-bold text-white text-lg">6.2k</Text>
                    <Text className="text-[10px] text-[#F1C40F] font-bold tracking-wider mt-0.5">TOP 12%</Text>
                </View>
            </View>

        </SafeAreaView>
    );
}
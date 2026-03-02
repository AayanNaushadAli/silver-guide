import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, Image, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useUser, useAuth } from '@clerk/clerk-expo';
import { useColorScheme } from 'nativewind';
import { createClerkSupabaseClient } from '../database/supabaseClient';

export default function LeaderboardScreen({ navigation }: any) {
    const [activeTab, setActiveTab] = useState('Global');
    const { user } = useUser();
    const { getToken } = useAuth();
    const { colorScheme } = useColorScheme();
    const isDarkMode = colorScheme === 'dark';

    const [leaderboard, setLeaderboard] = useState<any[]>([]);
    const [currentUserStat, setCurrentUserStat] = useState<any>(null);
    const [currentUserRank, setCurrentUserRank] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch Leaderboard from DB
    useEffect(() => {
        async function fetchLeaderboard() {
            if (!user) return;
            setIsLoading(true);
            try {
                const token = await getToken({ template: 'Supabase' });
                if (!token) return;
                const supabase = createClerkSupabaseClient(token);

                // Fetch top 10 players globally
                const { data: topPlayers, error } = await supabase
                    .from('player_stats')
                    .select('clerk_user_id, name, level, total_xp')
                    .order('total_xp', { ascending: false })
                    .limit(10);

                if (topPlayers) {
                    setLeaderboard(topPlayers);

                    // Find current user in the top 10
                    const rankIndex = topPlayers.findIndex(p => p.clerk_user_id === user.id);
                    if (rankIndex !== -1) {
                        setCurrentUserRank(rankIndex + 1);
                        setCurrentUserStat(topPlayers[rankIndex]);
                    } else {
                        // If not in top 10, fetch their specific stat
                        const { data: myData } = await supabase
                            .from('player_stats')
                            .select('clerk_user_id, name, level, total_xp')
                            .eq('clerk_user_id', user.id)
                            .single();

                        if (myData) {
                            setCurrentUserStat(myData);
                            // We don't have exact rank outside top 10 without a complex query, default to 10+
                            setCurrentUserRank(11);
                        }
                    }
                }
            } catch (error) {
                console.error('Leaderboard fetch error', error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchLeaderboard();
    }, [user, activeTab]);

    // Format utility for XP
    const formatXP = (xp: number) => {
        return xp >= 1000 ? (xp / 1000).toFixed(1) + 'k' : xp.toString();
    };

    // Extract Podium
    const getAvatar = (id: string, index: number) => `https://i.pravatar.cc/150?u=${id}`;

    // Provide sensible fallbacks if DB is empty
    const firstPlace = leaderboard.length > 0 ? leaderboard[0] : null;
    const secondPlace = leaderboard.length > 1 ? leaderboard[1] : null;
    const thirdPlace = leaderboard.length > 2 ? leaderboard[2] : null;
    const others = leaderboard.length > 3 ? leaderboard.slice(3) : [];

    if (isLoading) {
        return (
            <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark justify-center items-center">
                <ActivityIndicator size="large" color="#6B8E23" />
                <Text className="text-text-muted mt-4 font-mono text-xs uppercase tracking-widest text-primary/70">
                    Fetching Ranks...
                </Text>
            </SafeAreaView>
        );
    }

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
                {leaderboard.length > 0 ? (
                    <View className="flex-row justify-center items-end mt-4 mb-10 h-48">

                        {/* 2nd Place */}
                        {secondPlace && (
                            <View className="items-center mb-4 z-10 w-[30%]">
                                <View className="relative">
                                    <Image source={{ uri: getAvatar(secondPlace.clerk_user_id, 2) }}
                                        className="w-20 h-20 rounded-full border-4 border-background-light dark:border-surface-dark bg-gray-200" />
                                    <View className="absolute -bottom-3 self-center bg-gray-300 dark:bg-gray-600 px-3 py-1 rounded-full border-2 border-white dark:border-background-dark shadow-sm">
                                        <Text className="text-gray-700 dark:text-white font-bold text-[10px]">2ND</Text>
                                    </View>
                                </View>
                                <Text className="font-bold text-text-main dark:text-white mt-4" numberOfLines={1}>{secondPlace.name}</Text>
                                <Text className="text-primary text-xs font-bold">{formatXP(secondPlace.total_xp)} XP</Text>
                            </View>
                        )}

                        {/* 1st Place */}
                        {firstPlace && (
                            <View className="items-center mx-1 z-20 mb-8 w-[35%]">
                                <MaterialIcons name="workspace-premium" size={28} color="#F1C40F" className="mb-1" />
                                <View className="relative">
                                    <Image source={{ uri: getAvatar(firstPlace.clerk_user_id, 1) }}
                                        className="w-24 h-24 rounded-full border-4 border-[#F1C40F] bg-gray-200" />
                                    <View className="absolute -bottom-3 self-center bg-[#F1C40F] px-4 py-1 rounded-full border-2 border-white dark:border-background-dark shadow-sm">
                                        <Text className="text-white font-bold text-[10px]">1ST</Text>
                                    </View>
                                </View>
                                <Text className="font-bold text-text-main dark:text-white text-lg mt-4" numberOfLines={1}>{firstPlace.name}</Text>
                                <Text className="text-primary font-bold">{formatXP(firstPlace.total_xp)} XP</Text>
                            </View>
                        )}

                        {/* 3rd Place */}
                        {thirdPlace && (
                            <View className="items-center mb-2 z-10 w-[30%]">
                                <View className="relative">
                                    <Image source={{ uri: getAvatar(thirdPlace.clerk_user_id, 3) }}
                                        className="w-16 h-16 rounded-full border-4 border-background-light dark:border-surface-dark bg-gray-200" />
                                    <View className="absolute -bottom-3 self-center bg-orange-400 px-3 py-1 rounded-full border-2 border-white dark:border-background-dark shadow-sm">
                                        <Text className="text-white font-bold text-[10px]">3RD</Text>
                                    </View>
                                </View>
                                <Text className="font-bold text-text-main dark:text-white mt-4" numberOfLines={1}>{thirdPlace.name}</Text>
                                <Text className="text-primary text-xs font-bold">{formatXP(thirdPlace.total_xp)} XP</Text>
                            </View>
                        )}
                    </View>
                ) : (
                    <View className="items-center justify-center py-20">
                        <Text className="text-text-muted font-bold text-center">No rivals found yet.{'\n'}Be the first to claim the top spot!</Text>
                    </View>
                )}

                {/* --- The Competitors List --- */}
                {others.map((player, index) => (
                    <View key={player.clerk_user_id} className="flex-row items-center bg-surface dark:bg-surface-dark p-4 rounded-2xl mb-3 border border-primary/10 shadow-sm">
                        <Text className="w-8 font-bold text-text-muted text-lg">{index + 4}</Text>
                        <Image source={{ uri: getAvatar(player.clerk_user_id, index + 4) }} className="w-12 h-12 rounded-full mr-4 bg-gray-100" />
                        <View className="flex-1">
                            <Text className="font-bold text-text-main dark:text-white text-base">{player.name}</Text>
                            <Text className="text-xs text-text-muted uppercase font-medium mt-0.5">Level {player.level}</Text>
                        </View>
                        <Text className="font-bold text-primary">{formatXP(player.total_xp)}</Text>
                    </View>
                ))}
            </ScrollView>

            {/* --- Sticky Current Player Card --- */}
            {currentUserStat && (
                <View className="absolute bottom-6 left-6 right-6 bg-primary p-4 rounded-3xl flex-row items-center shadow-lg border border-primary/20">
                    <Text className="w-8 font-bold text-white text-lg">{currentUserRank <= 10 ? currentUserRank : '10+'}</Text>
                    <Image source={{ uri: user?.imageUrl || 'https://via.placeholder.com/150' }} className="w-12 h-12 rounded-full mr-4 border-2 border-white/30" />
                    <View className="flex-1">
                        <Text className="font-bold text-white text-base" numberOfLines={1}>You ({currentUserStat.name})</Text>
                        <Text className="text-[10px] text-white/80 uppercase tracking-wider mt-0.5">Level {currentUserStat.level}</Text>
                    </View>
                    <View className="items-end">
                        <Text className="font-bold text-white text-lg">{formatXP(currentUserStat.total_xp)}</Text>
                    </View>
                </View>
            )}

        </SafeAreaView>
    );
}
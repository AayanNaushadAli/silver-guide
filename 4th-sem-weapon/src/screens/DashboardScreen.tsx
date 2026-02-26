import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, Platform, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useUser, useAuth } from '@clerk/clerk-expo';
import { createClerkSupabaseClient } from '../database/supabaseClient';
import { useNavigation } from '@react-navigation/native';

export default function DashboardScreen() {

    const { user } = useUser();
    const { getToken } = useAuth();
    const [playerStats, setPlayerStats] = useState<any>(null);

    const navigation = useNavigation<any>();

    useEffect(() => {
        async function syncPlayerToDatabase() {
            if (!user) return;

            const clerkToken = await getToken({ template: 'supabase' });
            if (!clerkToken) return;

            const supabase = createClerkSupabaseClient(clerkToken);

            const { data: existingPlayer, error: fetchError } = await supabase.from('player_stats').select('*').eq('clerk_user_id', user.id).single();

            if (!existingPlayer) {
                console.log("New player Detected. Initializing Stats...");
                const { data: newPlayer, error: insertError } = await supabase.from('player_stats').insert({
                    clerk_user_id: user.id,
                    name: user.firstName || 'Seeker',
                    level: 1,
                    total_xp: 0,
                    streak_days: 0
                })
                    .select()
                    .single();

                setPlayerStats(newPlayer);
            } else {
                console.log("Welcome Back, Player!")
                setPlayerStats(existingPlayer);
            }
        }
        syncPlayerToDatabase();
    }, [user]);



    return (
        <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
            {/* Sticky Header */}
            <View className="px-6 pt-6 pb-4 border-b border-primary/10">
                <View className="flex-row items-center justify-between mb-3">
                    <View className="flex-row items-center gap-3">
                        <View className="relative">
                            <Image
                                source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDBJyOz_-6WyVDz9F1DjyU4Sk4Q1xEnLu7pSRFuYR8b5kjkyvtWQ1gpDr9cvHCb3XRli6Bq9seBbST2bWtSXvRSlFsz7_I3nlHoRHdwIUEJH5qBgj2F11C5Sf8H3RXs0qd0qNpEdnuEjBOhuSsJuSZoQ5paclNQNCa-IxCMmwl2utZUwRiqpX99JVYqLIzj4yPaRe9QhxOb0DryOZe92ru-BNxCUzDX47HQ_JC1VHsyqak2DdlNJb0LwAmZ-HQa2stjKu1tmGZcOTpL' }}
                                className="h-12 w-12 rounded-full border-2 border-primary/20"
                            />
                            <View className="absolute -bottom-1 -right-1 bg-surface rounded-full p-0.5 border border-primary/10">
                                <MaterialIcons name="verified" size={12} color="#6B8E23" />
                            </View>
                        </View>
                        <View>
                            <Text className="text-sm font-bold text-text-main dark:text-white leading-tight">
                                {playerStats ? playerStats.name : (user?.firstName || 'Loading...')}
                            </Text>
                            <Text className="text-xs text-primary font-medium tracking-wide uppercase">
                                Lvl {playerStats ? playerStats.level : '1'} Novice Engineer
                            </Text>
                        </View>
                    </View>
                    <View className="flex-row items-center gap-1.5 bg-surface dark:bg-surface-dark px-3 py-1.5 rounded-full border border-primary/10">
                        <Text className="text-sm">🔥</Text>
                        <Text className="text-sm font-bold text-text-main dark:text-white font-mono">14</Text>
                    </View>
                </View>

                {/* XP Bar */}
                <View className="w-full">
                    <View className="flex-row justify-between mb-1.5">
                        <Text className="text-[10px] text-text-muted font-mono">1450 XP</Text>
                        <Text className="text-[10px] text-text-muted font-mono">2000 XP</Text>
                    </View>
                    <View className="h-2 w-full bg-surface dark:bg-surface-dark rounded-full overflow-hidden border border-primary/5">
                        <View className="h-full bg-gold rounded-full" style={{ width: '72%' }} />
                    </View>
                </View>
            </View>

            <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                {/* System Insight */}
                <View className="mb-6">
                    <View className="flex-row items-center gap-2 px-1 mb-2">
                        <MaterialIcons name="psychology" size={18} color="#6366f1" />
                        <Text className="text-xs font-bold text-indigo-500 uppercase tracking-widest font-mono">System Insight</Text>
                    </View>
                    <View className="bg-indigo-50/50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800/50 rounded-2xl p-4 flex-row gap-4 items-start">
                        <View className="h-10 w-10 rounded-xl bg-indigo-100 dark:bg-indigo-800/40 items-center justify-center">
                            <MaterialIcons name="ads-click" size={24} color="#4f46e5" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-sm font-bold text-indigo-900 dark:text-indigo-100 mb-1">Boss Weakness Detected</Text>
                            <Text className="text-xs text-indigo-800/70 dark:text-indigo-300/70 leading-relaxed">
                                Operating Systems Unit 3 is <Text className="font-bold text-indigo-600 dark:text-indigo-400">high-weightage</Text> and <Text className="font-bold text-indigo-600 dark:text-indigo-400">low-effort</Text>. Prioritize this for maximum efficiency.
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Daily Mission */}
                <View className="mb-8">
                    <View className="flex-row items-center justify-between mb-4">
                        <Text className="text-xl font-bold text-text-main dark:text-white font-display">Daily Mission</Text>
                        <Text className="text-[10px] font-mono text-text-muted bg-surface dark:bg-surface-dark px-2 py-1 rounded-md border border-primary/10">PRIORITY: HIGH</Text>
                    </View>

                    <TouchableOpacity className="bg-surface dark:bg-surface-dark rounded-2xl p-6 border border-primary/5 shadow-sm active:opacity-80 transition-opacity">
                        <View className="flex-row items-center gap-2 mb-2">
                            <Text className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Quest Line: Thermodynamics</Text>
                        </View>
                        <Text className="text-2xl font-bold text-text-main dark:text-white leading-tight font-display mb-2">Defeat Thermo Chapter 4</Text>
                        <Text className="text-text-muted text-sm font-body leading-relaxed mb-6">
                            Master the Second Law of Thermodynamics and entropy calculations before the exam boss.
                        </Text>

                        <View className="flex-row items-center gap-4 mb-6">
                            <View className="flex-row items-center gap-1.5 text-text-muted">
                                <MaterialIcons name="schedule" size={16} color="#95A5A6" />
                                <Text className="text-xs font-mono text-text-muted">2h 30m</Text>
                            </View>
                            <View className="flex-row items-center gap-1.5 text-gold">
                                <MaterialIcons name="stars" size={16} color="#F1C40F" />
                                <Text className="text-xs font-mono font-bold text-gold">+500 XP</Text>
                            </View>
                        </View>

                        <View className="w-full bg-primary py-4 rounded-full items-center shadow-sm flex-row justify-center gap-2">
                            <MaterialIcons name="play-circle-outline" size={20} color="white" />
                            <Text className="text-white font-bold font-display tracking-wider">ENGAGE MISSION</Text>
                        </View>
                    </TouchableOpacity>
                    <Text className="text-center text-xs text-text-muted italic font-body opacity-60 mt-4">"Consistency is the path to mastery."</Text>
                </View>

                {/* Side Quests */}
                <View className="mb-6">
                    <Text className="text-lg font-bold text-text-main dark:text-white font-display mb-4 px-1">Side Quests</Text>

                    {/* Item 1 */}
                    <TouchableOpacity className="flex-row items-center gap-4 p-4 bg-surface dark:bg-background-dark rounded-xl border border-primary/10 shadow-sm mb-3">
                        <View className="h-10 w-10 rounded-full bg-blue-50 dark:bg-blue-900/20 items-center justify-center">
                            <MaterialIcons name="functions" size={20} color="#3b82f6" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-sm font-bold text-text-main dark:text-white">Review Calc III Integration</Text>
                            <View className="flex-row items-center gap-2 mt-1">
                                <Text className="text-[10px] font-mono text-text-muted bg-surface dark:bg-surface-dark px-1.5 rounded">30m</Text>
                                <Text className="text-[10px] font-mono text-gold font-medium">+50 XP</Text>
                            </View>
                        </View>
                        <MaterialIcons name="chevron-right" size={20} color="#95A5A6" />
                    </TouchableOpacity>

                    {/* Item 2 */}
                    <TouchableOpacity className="flex-row items-center gap-4 p-4 bg-surface dark:bg-background-dark rounded-xl border border-primary/10 shadow-sm mb-3">
                        <View className="h-10 w-10 rounded-full bg-purple-50 dark:bg-purple-900/20 items-center justify-center">
                            <MaterialIcons name="mail" size={20} color="#a855f7" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-sm font-bold text-text-main dark:text-white">Email Professor about Lab</Text>
                            <View className="flex-row items-center gap-2 mt-1">
                                <Text className="text-[10px] font-mono text-text-muted bg-surface dark:bg-surface-dark px-1.5 rounded">5m</Text>
                                <Text className="text-[10px] font-mono text-gold font-medium">+20 XP</Text>
                            </View>
                        </View>
                        <MaterialIcons name="chevron-right" size={20} color="#95A5A6" />
                    </TouchableOpacity>

                    {/* Item 3 Completed */}
                    <View className="flex-row items-center gap-4 p-4 bg-surface/40 dark:bg-surface-dark/40 rounded-xl opacity-60">
                        <View className="h-10 w-10 rounded-full bg-primary/20 items-center justify-center">
                            <MaterialIcons name="check" size={20} color="#6B8E23" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-sm font-bold text-text-main dark:text-white line-through">Submit Weekly Reflection</Text>
                            <View className="flex-row items-center gap-2 mt-1">
                                <Text className="text-[10px] font-mono text-primary font-medium">Completed</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Bottom Nav */}
            <View className="absolute bottom-0 left-0 right-0 bg-background-light/95 dark:bg-background-dark/95 border-t border-primary/10 pb-6 pt-3 px-6 flex-row justify-around items-center">
                <TouchableOpacity className="items-center gap-1">
                    <View className="h-10 w-14 rounded-2xl bg-primary/10 items-center justify-center">
                        <MaterialIcons name="home" size={24} color="#6B8E23" />
                    </View>
                    <Text className="text-[10px] font-medium text-primary">Dojo</Text>
                </TouchableOpacity>
                <TouchableOpacity className="items-center gap-1 opacity-60">
                    <View className="h-10 w-14 rounded-2xl items-center justify-center">
                        <MaterialIcons name="map" size={24} color="#2C3E50" />
                    </View>
                    <Text className="text-[10px] font-medium text-text-main">Quest Log</Text>
                </TouchableOpacity>
                <TouchableOpacity className="items-center gap-1 opacity-60">
                    <View className="h-10 w-14 rounded-2xl items-center justify-center">
                        <MaterialIcons name="timer" size={24} color="#2C3E50" />
                    </View>
                    <Text className="text-[10px] font-medium text-text-main">Focus</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    className="items-center gap-1 opacity-60"
                    onPress={() => navigation.navigate('ProfileScreen')}
                >
                    <View className="h-10 w-14 rounded-2xl items-center justify-center">
                        <MaterialIcons name="person" size={24} color="#2C3E50" />
                    </View>
                    <Text className="text-[10px] font-medium text-text-main">Profile</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
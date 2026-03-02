import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, Platform, Image, ActivityIndicator, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useUser, useAuth } from '@clerk/clerk-expo';
import { createClerkSupabaseClient } from '../database/supabaseClient';
import { useNavigation } from '@react-navigation/native';

import FloatingMenu from '../components/FloatingMenu';
import { useQuests } from '../context/QuestContext';
import { useMentor } from '../context/MentorContext';


export default function DashboardScreen() {

    const { user } = useUser();
    const { getToken } = useAuth();
    const [playerStats, setPlayerStats] = useState<any>(null);

    const navigation = useNavigation<any>();
    const { mentorState, isLoading: mentorLoading } = useMentor();

    const [isLoadingPlayer, setIsLoadingPlayer] = useState(true);

    useEffect(() => {
        async function syncPlayerToDatabase() {
            try {
                if (!user) return;

                const clerkToken = await getToken({ template: 'Supabase' });
                if (!clerkToken) {
                    console.error('❌ Dashboard: Clerk JWT returned null');
                    setIsLoadingPlayer(false);
                    return;
                }

                const supabase = createClerkSupabaseClient(clerkToken);

                const { data: existingPlayer, error: fetchError } = await supabase
                    .from('player_stats')
                    .select('*')
                    .eq('clerk_user_id', user.id)
                    .single();

                if (fetchError && fetchError.code !== 'PGRST116') {
                    console.error('❌ Dashboard: DB error:', fetchError.code);
                }

                if (!existingPlayer) {
                    // New player → insert minimal row, redirect to onboarding
                    const { data: newPlayer, error: insertError } = await supabase
                        .from('player_stats')
                        .insert({
                            clerk_user_id: user.id,
                            name: user.firstName || 'Seeker',
                            level: 1,
                            total_xp: 0,
                            streak_days: 0,
                            has_completed_onboarding: false,
                        })
                        .select()
                        .single();

                    if (insertError) {
                        console.error('❌ Dashboard: Insert failed:', insertError.code);
                    } else {
                        setPlayerStats(newPlayer);
                        navigation.replace('Onboarding');
                        return;
                    }
                } else {
                    // Existing player — check onboarding
                    if (!existingPlayer.has_completed_onboarding) {
                        navigation.replace('Onboarding');
                        return;
                    }

                    // --- STREAK TRACKING ---
                    const now = new Date();
                    const lastActive = existingPlayer.last_active_at ? new Date(existingPlayer.last_active_at) : null;
                    let newStreak = existingPlayer.streak_days || 0;

                    if (lastActive) {
                        const msPerDay = 1000 * 60 * 60 * 24;
                        // zero out time to just compare dates
                        const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                        const lastActiveDate = new Date(lastActive.getFullYear(), lastActive.getMonth(), lastActive.getDate());

                        const diffDays = Math.floor((todayDate.getTime() - lastActiveDate.getTime()) / msPerDay);

                        if (diffDays === 1) {
                            newStreak += 1; // Logged in next day, increase streak
                        } else if (diffDays > 1) {
                            newStreak = 1; // Skipped a day, reset streak
                        }
                    } else {
                        newStreak = 1; // First time playing
                    }

                    const isSameDay = lastActive && lastActive.toDateString() === now.toDateString();

                    if (!isSameDay) {
                        // Update DB with new streak and last_active_at
                        await supabase
                            .from('player_stats')
                            .update({
                                last_active_at: now.toISOString(),
                                streak_days: newStreak
                            })
                            .eq('clerk_user_id', user.id);

                        existingPlayer.streak_days = newStreak;
                        existingPlayer.last_active_at = now.toISOString();
                    }

                    setPlayerStats(existingPlayer);
                }
            } catch (err: any) {
                console.error('💥 Dashboard: Sync error:', err.message);
            } finally {
                setIsLoadingPlayer(false);
            }
        }
        syncPlayerToDatabase();
    }, [user]);



    const { quests, totalXP, getProgress } = useQuests();

    // AI picks the daily mission, fallback to first quest
    const dailyMission = mentorState?.dailyMission || quests[0];
    // AI sorts the rest, fallback to remaining quests
    const sideQuests = quests.filter(q => q.id !== dailyMission?.id);
    const xpForNextLevel = 2000;
    const xpPercent = Math.min((totalXP / xpForNextLevel) * 100, 100);

    // AI-driven insight or fallback
    const insightTitle = mentorState?.insight?.title || 'Focus on Consistency';
    const insightMessage = mentorState?.insight?.message || 'Complete today\'s primary mission to stay on track.';
    const mentorGreeting = mentorState?.mentorMessage || '"Consistency is the path to mastery."';

    if (isLoadingPlayer) {
        return (
            <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark items-center justify-center">
                <ActivityIndicator size="large" color="#6B8E23" />
                <Text className="text-text-muted mt-4 font-mono text-xs uppercase tracking-widest text-primary/70">
                    Calibrating System...
                </Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
            {/* Sticky Header */}
            <View className="px-6 pt-6 pb-4 border-b border-primary/10">
                <View className="flex-row items-center justify-between mb-3">
                    <View className="flex-row items-center gap-3">
                        <View className="relative">
                            <Image
                                source={{ uri: user?.imageUrl || 'https://lh3.googleusercontent.com/aida-public/AB6AXuDBJyOz_-6WyVDz9F1DjyU4Sk4Q1xEnLu7pSRFuYR8b5kjkyvtWQ1gpDr9cvHCb3XRli6Bq9seBbST2bWtSXvRSlFsz7_I3nlHoRHdwIUEJH5qBgj2F11C5Sf8H3RXs0qd0qNpEdnuEjBOhuSsJuSZoQ5paclNQNCa-IxCMmwl2utZUwRiqpX99JVYqLIzj4yPaRe9QhxOb0DryOZe92ru-BNxCUzDX47HQ_JC1VHsyqak2DdlNJb0LwAmZ-HQa2stjKu1tmGZcOTpL' }}
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
                    <View className="flex-row items-center gap-3">
                        <View className="flex-row items-center gap-1.5 bg-surface dark:bg-surface-dark px-3 py-1.5 rounded-full border border-primary/10 mr-1">
                            <Text className="text-sm">🔥</Text>
                            <Text className="text-sm font-bold text-text-main dark:text-white font-mono">{playerStats?.streak_days || 0}</Text>
                        </View>
                        <TouchableOpacity onPress={() => navigation.navigate('Settings')} className="p-1">
                            <MaterialIcons name="settings" size={24} color="#6B8E23" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* XP Bar */}
                <View className="w-full">
                    <View className="flex-row justify-between mb-1.5">
                        <Text className="text-[10px] text-text-muted font-mono">{totalXP} XP</Text>
                        <Text className="text-[10px] text-text-muted font-mono">{xpForNextLevel} XP</Text>
                    </View>
                    <View className="h-2 w-full bg-surface dark:bg-surface-dark rounded-full overflow-hidden border border-primary/5">
                        <View className="h-full bg-gold rounded-full" style={{ width: `${xpPercent}%` }} />
                    </View>
                </View>
            </View>

            <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                {/* AI Mentor Greeting */}
                {mentorLoading ? (
                    <View className="mb-4 flex-row items-center gap-2 px-1">
                        <ActivityIndicator size="small" color="#6B8E23" />
                        <Text className="text-xs text-text-muted font-mono">Oracle is analyzing your progress...</Text>
                    </View>
                ) : null}

                {/* System Insight — AI Driven */}
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
                            <Text className="text-sm font-bold text-indigo-900 dark:text-indigo-100 mb-1">{insightTitle}</Text>
                            <Text className="text-xs text-indigo-800/70 dark:text-indigo-300/70 leading-relaxed">
                                {insightMessage}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Empty State — No quests yet */}
                {quests.length === 0 && !mentorLoading ? (
                    <View className="items-center py-12 px-4">
                        <View className="w-20 h-20 rounded-full bg-primary/10 items-center justify-center mb-4">
                            <MaterialIcons name="auto-awesome" size={40} color="#6B8E23" />
                        </View>
                        <Text className="text-xl font-bold text-text-main dark:text-white text-center mb-2">
                            No Missions Yet
                        </Text>
                        <Text className="text-text-muted text-center text-sm mb-6">
                            The Oracle hasn't generated your quests yet. Complete onboarding or recalibrate to get your study path.
                        </Text>
                        <TouchableOpacity
                            onPress={() => navigation.navigate('Onboarding')}
                            className="bg-primary px-8 py-4 rounded-2xl flex-row items-center gap-2"
                        >
                            <MaterialIcons name="refresh" size={18} color="white" />
                            <Text className="text-white font-bold">Start Onboarding</Text>
                        </TouchableOpacity>
                    </View>
                ) : null}

                {/* Daily Mission — AI Picked */}
                {dailyMission && quests.length > 0 && (
                    <View className="mb-8">
                        <View className="flex-row items-center justify-between mb-4">
                            <Text className="text-xl font-bold text-text-main dark:text-white font-display">Daily Mission</Text>
                            <Text className="text-[10px] font-mono text-text-muted bg-surface dark:bg-surface-dark px-2 py-1 rounded-md border border-primary/10">AI PRIORITY</Text>
                        </View>

                        <TouchableOpacity
                            onPress={() => navigation.navigate('TopicDetail', { questId: dailyMission.id })}
                            className="bg-surface dark:bg-surface-dark rounded-2xl p-6 border border-primary/5 shadow-sm active:opacity-80 transition-opacity">
                            <View className="flex-row items-center gap-2 mb-2">
                                <Text className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Quest Line: {dailyMission.title}</Text>
                            </View>
                            <Text className="text-2xl font-bold text-text-main dark:text-white leading-tight font-display mb-2">
                                {dailyMission.tasks.find(t => !t.completed)?.title || 'All Tasks Complete! 🎉'}
                            </Text>
                            <Text className="text-text-muted text-sm font-body leading-relaxed mb-6">
                                Progress: {getProgress(dailyMission)}% complete • {dailyMission.tasks.filter(t => !t.completed).length} tasks remaining
                            </Text>

                            <View className="flex-row items-center gap-4 mb-6">
                                <View className="flex-row items-center gap-1.5 text-text-muted">
                                    <MaterialIcons name="schedule" size={16} color="#95A5A6" />
                                    <Text className="text-xs font-mono text-text-muted">{dailyMission.deadline}</Text>
                                </View>
                                <View className="flex-row items-center gap-1.5 text-gold">
                                    <MaterialIcons name="stars" size={16} color="#F1C40F" />
                                    <Text className="text-xs font-mono font-bold text-gold">+{dailyMission.tasks.reduce((s, t) => s + t.xp, 0)} XP</Text>
                                </View>
                            </View>

                            <View className="w-full bg-primary py-4 rounded-full items-center shadow-sm flex-row justify-center gap-2">
                                <MaterialIcons name="play-circle-outline" size={20} color="white" />
                                <Text className="text-white font-bold font-display tracking-wider">ENGAGE MISSION</Text>
                            </View>
                        </TouchableOpacity>
                        <Text className="text-center text-xs text-text-muted italic font-body opacity-60 mt-4">{mentorGreeting}</Text>
                    </View>
                )}

                {/* Side Quests — AI Ordered */}
                {sideQuests.length > 0 && (
                    <View className="mb-6">
                        <Text className="text-lg font-bold text-text-main dark:text-white font-display mb-4 px-1">Side Quests</Text>

                        {sideQuests.map((quest) => (
                            <TouchableOpacity
                                key={quest.id}
                                onPress={() => navigation.navigate('TopicDetail', { questId: quest.id })}
                                className="flex-row items-center gap-4 p-4 bg-surface dark:bg-background-dark rounded-xl border border-primary/10 shadow-sm mb-3">
                                <View className="h-10 w-10 rounded-full items-center justify-center" style={{ backgroundColor: quest.iconColor + '15' }}>
                                    <MaterialIcons name={quest.icon as any} size={20} color={quest.iconColor} />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-sm font-bold text-text-main dark:text-white">{quest.title}</Text>
                                    <View className="flex-row items-center gap-2 mt-1">
                                        <Text className="text-[10px] font-mono text-text-muted bg-surface dark:bg-surface-dark px-1.5 rounded">{getProgress(quest)}%</Text>
                                        <Text className="text-[10px] font-mono text-gold font-medium">+{quest.tasks.reduce((s, t) => s + t.xp, 0)} XP</Text>
                                    </View>
                                </View>
                                <MaterialIcons name="chevron-right" size={20} color="#95A5A6" />
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </ScrollView>
            <FloatingMenu />
        </SafeAreaView>
    );
}
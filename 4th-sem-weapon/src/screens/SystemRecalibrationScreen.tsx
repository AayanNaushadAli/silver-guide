import React, { useState } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { createClerkSupabaseClient } from '../database/supabaseClient';
import { useQuests } from '../context/QuestContext';
import { getSubjectsForSemester, buildSyllabusContext } from '../services/knowledgeService';
import { MentorService } from '../services/mentorService';

/**
 * SystemRecalibrationScreen
 * Allows users to re-generate quests or adjust focus mode after onboarding.
 * Think of it as a "re-roll" for the AI study path.
 */
export default function SystemRecalibrationScreen({ navigation }: any) {
    const { user } = useUser();
    const { getToken } = useAuth();
    const { quests, replaceAllQuests } = useQuests();

    const [isRecalibrating, setIsRecalibrating] = useState(false);
    const [selectedMode, setSelectedMode] = useState('exam_performance');
    const [status, setStatus] = useState('');

    const focusModes = [
        { id: 'exam_performance', label: 'Exam Performance', icon: 'school', desc: 'Prioritize topics by exam weightage' },
        { id: 'skill_mastery', label: 'Skill Mastery', icon: 'psychology', desc: 'Deep dive into every concept' },
        { id: 'consistency', label: 'Consistency', icon: 'trending-up', desc: 'Small daily tasks for steady progress' },
    ];

    const handleRecalibrate = async () => {
        setIsRecalibrating(true);
        setStatus('Re-analyzing syllabus data...');

        try {
            const token = await getToken({ template: 'Supabase' });
            if (!token || !user) return;

            const supabase = createClerkSupabaseClient(token);

            // Get user profile to know their semester/branch
            const { data: profile } = await supabase
                .from('player_stats')
                .select('*')
                .eq('clerk_user_id', user.id)
                .single();

            const semester = profile?.semester || 4;
            const branch = profile?.branch || 'cs';

            setStatus('Generating new quest paths...');

            // Update focus mode in DB
            await supabase
                .from('player_stats')
                .update({ focus_mode: selectedMode })
                .eq('clerk_user_id', user.id);

            const allSubjects = getSubjectsForSemester(semester, branch);
            const syllabusContext = buildSyllabusContext(allSubjects);

            const mentorService = new MentorService();
            const newQuests = await mentorService.generateQuestsFromSyllabus(
                syllabusContext,
                allSubjects,
                selectedMode,
                profile?.target_cgpa || 3.0
            );

            setStatus('Syncing new path to The Dojo...');

            if (newQuests && newQuests.length > 0) {
                await replaceAllQuests(newQuests);
            }

            setStatus('System recalibrated! ✅');
            setTimeout(() => {
                navigation.goBack();
            }, 1200);

        } catch (err: any) {
            console.error('❌ Recalibration failed:', err.message);
            setStatus('Failed. Try again later.');
        } finally {
            setIsRecalibrating(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
            {/* Header */}
            <View className="flex-row items-center px-6 pt-6 pb-4 border-b border-primary/10">
                <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
                    <MaterialIcons name="arrow-back" size={24} color="#6B8E23" />
                </TouchableOpacity>
                <View>
                    <Text className="text-xl font-bold text-text-main dark:text-white">System Recalibration</Text>
                    <Text className="text-xs text-text-muted font-mono">Re-generate your study path</Text>
                </View>
            </View>

            <ScrollView className="flex-1 px-6 pt-6" contentContainerStyle={{ paddingBottom: 40 }}>
                {/* Current Stats */}
                <View className="bg-surface dark:bg-surface-dark rounded-2xl p-5 mb-6 border border-primary/10">
                    <Text className="text-sm font-bold text-text-main dark:text-white mb-3">Current Status</Text>
                    <View className="flex-row gap-4">
                        <View className="flex-1 bg-primary/5 rounded-xl p-3 items-center">
                            <Text className="text-2xl font-bold text-primary">{quests.length}</Text>
                            <Text className="text-[10px] text-text-muted font-mono mt-1">Active Quests</Text>
                        </View>
                        <View className="flex-1 bg-gold/5 rounded-xl p-3 items-center">
                            <Text className="text-2xl font-bold text-gold">
                                {quests.reduce((sum, q) => {
                                    const done = q.tasks.filter(t => t.completed).length;
                                    return sum + done;
                                }, 0)}
                            </Text>
                            <Text className="text-[10px] text-text-muted font-mono mt-1">Tasks Done</Text>
                        </View>
                        <View className="flex-1 bg-red-500/5 rounded-xl p-3 items-center">
                            <Text className="text-2xl font-bold text-red-500">
                                {quests.reduce((sum, q) => {
                                    const remaining = q.tasks.filter(t => !t.completed).length;
                                    return sum + remaining;
                                }, 0)}
                            </Text>
                            <Text className="text-[10px] text-text-muted font-mono mt-1">Remaining</Text>
                        </View>
                    </View>
                </View>

                {/* Focus Mode Selection */}
                <Text className="text-lg font-bold text-text-main dark:text-white mb-3 px-1">New Focus Mode</Text>
                <Text className="text-xs text-text-muted mb-4 px-1">Choose how the Oracle should prioritize your tasks</Text>

                {focusModes.map(mode => (
                    <TouchableOpacity
                        key={mode.id}
                        onPress={() => setSelectedMode(mode.id)}
                        className={`flex-row items-center gap-4 p-4 rounded-2xl border mb-3 ${selectedMode === mode.id
                                ? 'bg-primary/10 border-primary'
                                : 'bg-surface dark:bg-surface-dark border-primary/10'
                            }`}
                    >
                        <View className={`h-12 w-12 rounded-full items-center justify-center ${selectedMode === mode.id ? 'bg-primary' : 'bg-primary/10'
                            }`}>
                            <MaterialIcons
                                name={mode.icon as any}
                                size={24}
                                color={selectedMode === mode.id ? 'white' : '#6B8E23'}
                            />
                        </View>
                        <View className="flex-1">
                            <Text className={`text-sm font-bold ${selectedMode === mode.id ? 'text-primary' : 'text-text-main dark:text-white'
                                }`}>{mode.label}</Text>
                            <Text className="text-xs text-text-muted mt-0.5">{mode.desc}</Text>
                        </View>
                        {selectedMode === mode.id && (
                            <MaterialIcons name="check-circle" size={24} color="#6B8E23" />
                        )}
                    </TouchableOpacity>
                ))}

                {/* Warning */}
                <View className="bg-amber-50/50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 rounded-2xl p-4 mt-4 mb-6 flex-row gap-3 items-start">
                    <MaterialIcons name="warning" size={20} color="#d97706" />
                    <Text className="text-xs text-amber-800/80 dark:text-amber-200/80 flex-1 leading-relaxed">
                        Recalibrating will regenerate all quests. Your current task progress will be reset. XP earned is kept.
                    </Text>
                </View>

                {/* Status */}
                {status ? (
                    <View className="flex-row items-center gap-2 mb-4 px-1">
                        {isRecalibrating && <ActivityIndicator size="small" color="#6B8E23" />}
                        <Text className="text-xs text-text-muted font-mono">{status}</Text>
                    </View>
                ) : null}

                {/* Recalibrate Button */}
                <TouchableOpacity
                    onPress={handleRecalibrate}
                    disabled={isRecalibrating}
                    className={`w-full py-4 rounded-2xl items-center flex-row justify-center gap-2 ${isRecalibrating ? 'bg-primary/50' : 'bg-primary'
                        }`}
                >
                    <MaterialIcons name="sync" size={20} color="white" />
                    <Text className="text-white font-bold text-base">
                        {isRecalibrating ? 'Recalibrating...' : 'Recalibrate System'}
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

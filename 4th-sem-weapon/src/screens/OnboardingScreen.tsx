import React, { useState, useRef } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, SafeAreaView, ScrollView,
    Dimensions, Alert, ActivityIndicator, Image
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';
import { useUser, useAuth } from '@clerk/clerk-expo';
import { createClerkSupabaseClient } from '../database/supabaseClient';
import { getSubjectsForSemester, SubjectData } from '../services/knowledgeService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─────────────────────────────────────────
// Step 1: The Awakening
// ─────────────────────────────────────────
function StepAwakening({ data, setData }: { data: any; setData: (d: any) => void }) {
    const semesters = [1, 2, 3, 4, 5, 6, 7, 8];
    return (
        <View className="flex-1 items-center px-6 pt-8">
            {/* Icon */}
            <View className="w-20 h-20 rounded-full bg-primary/10 items-center justify-center mb-4">
                <MaterialIcons name="eco" size={40} color="#6B8E23" />
            </View>

            <Text className="text-3xl font-bold text-text-main dark:text-white text-center mb-2">
                Welcome, Seeker
            </Text>
            <Text className="text-text-muted text-center mb-8 text-base">
                Initialize your path to academic{'\n'}mastery and inner peace.
            </Text>

            {/* Player Name */}
            <Text className="text-primary font-bold text-xs uppercase tracking-widest self-start mb-2 ml-1">
                Player Name
            </Text>
            <View className="w-full flex-row items-center bg-surface dark:bg-surface-dark rounded-2xl px-4 py-4 mb-8 border border-primary/10">
                <MaterialIcons name="person" size={22} color="#95A5A6" />
                <TextInput
                    className="flex-1 ml-3 text-text-main dark:text-white text-base"
                    placeholder="Enter your moniker"
                    placeholderTextColor="#95A5A6"
                    value={data.name}
                    onChangeText={(text) => setData({ ...data, name: text })}
                />
            </View>

            {/* Current Semester */}
            <Text className="text-primary font-bold text-xs uppercase tracking-widest self-start mb-3 ml-1">
                Current Semester
            </Text>
            <View className="flex-row flex-wrap gap-3 w-full">
                {semesters.map(sem => (
                    <TouchableOpacity
                        key={sem}
                        onPress={() => setData({ ...data, semester: sem })}
                        className={`w-[22%] aspect-square rounded-2xl items-center justify-center border-2 ${data.semester === sem
                            ? 'bg-primary/20 border-primary'
                            : 'bg-surface dark:bg-surface-dark border-primary/10'
                            }`}
                    >
                        <Text className={`text-xl font-bold ${data.semester === sem ? 'text-primary' : 'text-text-main dark:text-white'}`}>
                            {sem}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
}

// ─────────────────────────────────────────
// Step 2: Curriculum Initialization
// ─────────────────────────────────────────
function StepCurriculum({ data, setData }: { data: any; setData: (d: any) => void }) {
    const branches = [
        { key: 'cs', label: 'Computer Science', icon: 'computer' },
        { key: 'mech', label: 'Mechanical', icon: 'settings' },
        { key: 'elec', label: 'Electrical', icon: 'flash-on' },
        { key: 'civil', label: 'Civil', icon: 'apartment' },
    ];

    const availableSubjects = getSubjectsForSemester(data.semester, data.branch);
    const isAvailable = availableSubjects.length > 0;

    const toggleSubject = (code: string) => {
        const current = data.selectedSubjects || [];
        if (current.includes(code)) {
            setData({ ...data, selectedSubjects: current.filter((c: string) => c !== code) });
        } else {
            setData({ ...data, selectedSubjects: [...current, code] });
        }
    };

    return (
        <View className="flex-1 px-6 pt-6">
            <Text className="text-2xl font-bold text-text-main dark:text-white mb-1">
                Select Your Branch
            </Text>
            <Text className="text-text-muted mb-5 text-sm">
                Align your path with your core discipline
            </Text>

            {/* Branch chips */}
            <View className="flex-row flex-wrap gap-2 mb-6">
                {branches.map(b => (
                    <TouchableOpacity
                        key={b.key}
                        onPress={() => setData({ ...data, branch: b.key, selectedSubjects: [] })}
                        className={`flex-row items-center gap-2 px-4 py-3 rounded-full border ${data.branch === b.key
                            ? 'bg-primary border-primary'
                            : 'bg-surface dark:bg-surface-dark border-primary/10'
                            }`}
                    >
                        <MaterialIcons name={b.icon as any} size={16} color={data.branch === b.key ? 'white' : '#6B8E23'} />
                        <Text className={`font-bold text-sm ${data.branch === b.key ? 'text-white' : 'text-text-main dark:text-white'}`}>
                            {b.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Semester Subjects */}
            <View className="flex-row justify-between items-center mb-4">
                <Text className="text-lg font-bold text-text-main dark:text-white">Semester Subjects</Text>
                <Text className="text-primary font-bold text-sm">{(data.selectedSubjects || []).length} selected</Text>
            </View>

            {!isAvailable ? (
                <View className="items-center py-12 px-4">
                    <MaterialIcons name="construction" size={48} color="#95A5A6" />
                    <Text className="text-text-muted text-center mt-4 text-base font-medium">
                        Syllabus for Sem {data.semester} {data.branch?.toUpperCase()} is coming soon!
                    </Text>
                    <Text className="text-text-muted text-center mt-2 text-xs">
                        Currently only 4th Sem CS is available.
                    </Text>
                </View>
            ) : (
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 80 }}>
                    <View className="flex-row flex-wrap gap-3">
                        {availableSubjects.map(subj => {
                            const isSelected = (data.selectedSubjects || []).includes(subj.code);
                            return (
                                <TouchableOpacity
                                    key={subj.code}
                                    onPress={() => toggleSubject(subj.code)}
                                    className={`w-[47%] rounded-2xl p-4 items-center border-2 ${isSelected
                                        ? 'bg-primary/10 border-primary'
                                        : 'bg-surface dark:bg-surface-dark border-primary/10'
                                        }`}
                                >
                                    {isSelected && (
                                        <View className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary items-center justify-center">
                                            <MaterialIcons name="check" size={14} color="white" />
                                        </View>
                                    )}
                                    <View className={`w-14 h-14 rounded-full items-center justify-center mb-2 ${isSelected ? 'bg-primary/20' : 'bg-background-light dark:bg-background-dark'}`}>
                                        <MaterialIcons name={subj.icon as any} size={28} color={subj.iconColor} />
                                    </View>
                                    <Text className="text-text-main dark:text-white font-bold text-sm text-center" numberOfLines={2}>
                                        {subj.title}
                                    </Text>
                                    <Text className="text-text-muted text-xs text-center mt-1">
                                        {subj.units.length} Units
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </ScrollView>
            )}
        </View>
    );
}

// ─────────────────────────────────────────
// Step 3: Goal Setting
// ─────────────────────────────────────────
function StepGoals({ data, setData }: { data: any; setData: (d: any) => void }) {
    const focusModes = [
        { key: 'exam_performance', icon: 'quiz', title: 'Exam Performance', desc: 'Maximize grades and ace tests' },
        { key: 'skill_mastery', icon: 'psychology', title: 'Skill Mastery', desc: 'Deep dive into practical knowledge' },
        { key: 'consistency', icon: 'event-repeat', title: 'Consistency', desc: 'Build sustainable study habits' },
    ];

    // Simple slider using touchable steps
    const cgpaSteps = [2.0, 2.5, 3.0, 3.25, 3.5, 3.75, 4.0];

    return (
        <View className="flex-1 items-center px-6 pt-6">
            {/* Header */}
            <View className="w-16 h-16 rounded-full bg-primary/10 items-center justify-center mb-4">
                <MaterialIcons name="gps-fixed" size={32} color="#6B8E23" />
            </View>
            <Text className="text-2xl font-bold text-text-main dark:text-white text-center mb-1">
                Define Your Target
            </Text>
            <Text className="text-text-muted text-center mb-8 text-sm">
                Precision leads to mastery.
            </Text>

            {/* Target CGPA */}
            <View className="w-full bg-surface dark:bg-surface-dark rounded-2xl p-5 border border-primary/10 mb-8">
                <View className="flex-row justify-between items-center mb-4">
                    <Text className="text-text-main dark:text-white font-bold text-base">Target CGPA</Text>
                    <View className="bg-primary/10 px-3 py-1 rounded-full">
                        <Text className="text-primary font-bold text-lg">{data.targetCGPA?.toFixed(2)}</Text>
                    </View>
                </View>
                <View className="flex-row justify-between">
                    {cgpaSteps.map(val => (
                        <TouchableOpacity
                            key={val}
                            onPress={() => setData({ ...data, targetCGPA: val })}
                            className={`px-3 py-2 rounded-xl ${data.targetCGPA === val ? 'bg-primary' : 'bg-background-light dark:bg-background-dark'}`}
                        >
                            <Text className={`font-bold text-xs ${data.targetCGPA === val ? 'text-white' : 'text-text-muted'}`}>
                                {val}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Focus Mode */}
            <Text className="text-lg font-bold text-text-main dark:text-white self-start mb-3">
                Primary Semester Focus
            </Text>
            {focusModes.map(fm => (
                <TouchableOpacity
                    key={fm.key}
                    onPress={() => setData({ ...data, focusMode: fm.key })}
                    className={`w-full flex-row items-center p-4 rounded-2xl mb-3 border-2 ${data.focusMode === fm.key
                        ? 'bg-primary/10 border-primary'
                        : 'bg-surface dark:bg-surface-dark border-primary/10'
                        }`}
                >
                    <View className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${data.focusMode === fm.key ? 'bg-primary/20' : 'bg-background-light dark:bg-background-dark'}`}>
                        <MaterialIcons name={fm.icon as any} size={24} color={data.focusMode === fm.key ? '#6B8E23' : '#95A5A6'} />
                    </View>
                    <View className="flex-1">
                        <Text className="text-text-main dark:text-white font-bold text-base">{fm.title}</Text>
                        <Text className="text-text-muted text-xs">{fm.desc}</Text>
                    </View>
                    <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${data.focusMode === fm.key ? 'border-primary bg-primary' : 'border-text-muted/30'}`}>
                        {data.focusMode === fm.key && <View className="w-2.5 h-2.5 rounded-full bg-white" />}
                    </View>
                </TouchableOpacity>
            ))}
        </View>
    );
}

// ─────────────────────────────────────────
// Step 4: Final Sync (Review)
// ─────────────────────────────────────────
function StepFinalSync({ data }: { data: any }) {
    const selectedSubjects = getSubjectsForSemester(data.semester, data.branch)
        .filter(s => (data.selectedSubjects || []).includes(s.code));

    return (
        <View className="flex-1 items-center px-6 pt-6">
            {/* Hero Image Area */}
            <View className="w-full h-44 rounded-3xl bg-gradient-to-b from-primary/20 to-primary/5 items-center justify-center mb-6 overflow-hidden border border-primary/10">
                <MaterialIcons name="self-improvement" size={80} color="#6B8E23" />
            </View>

            <Text className="text-3xl font-bold text-text-main dark:text-white text-center mb-2">
                System Calibrated
            </Text>
            <Text className="text-text-muted text-center mb-8 text-sm">
                Your path is set. Review your profile{'\n'}before you begin your journey.
            </Text>

            {/* Summary Cards */}
            <View className="w-full gap-3">
                <View className="flex-row items-center bg-surface dark:bg-surface-dark rounded-2xl p-4 border border-primary/10">
                    <View className="w-12 h-12 rounded-full bg-primary/10 items-center justify-center mr-4">
                        <MaterialIcons name="person" size={24} color="#6B8E23" />
                    </View>
                    <View>
                        <Text className="text-primary text-xs font-bold uppercase">Master Name</Text>
                        <Text className="text-text-main dark:text-white font-bold text-lg">{data.name || 'Seeker'}</Text>
                    </View>
                </View>

                <View className="flex-row items-center bg-surface dark:bg-surface-dark rounded-2xl p-4 border border-primary/10">
                    <View className="w-12 h-12 rounded-full bg-primary/10 items-center justify-center mr-4">
                        <MaterialIcons name="school" size={24} color="#6B8E23" />
                    </View>
                    <View>
                        <Text className="text-primary text-xs font-bold uppercase">Zen Path</Text>
                        <Text className="text-text-main dark:text-white font-bold text-lg">
                            Sem {data.semester} · {data.branch?.toUpperCase()} · {selectedSubjects.length} Subjects
                        </Text>
                    </View>
                </View>

                <View className="flex-row items-center bg-surface dark:bg-surface-dark rounded-2xl p-4 border border-primary/10">
                    <View className="w-12 h-12 rounded-full bg-primary/10 items-center justify-center mr-4">
                        <MaterialIcons name="gps-fixed" size={24} color="#6B8E23" />
                    </View>
                    <View>
                        <Text className="text-primary text-xs font-bold uppercase">Core Target</Text>
                        <Text className="text-text-main dark:text-white font-bold text-lg">
                            CGPA {data.targetCGPA?.toFixed(2)} · {data.focusMode?.replace('_', ' ')}
                        </Text>
                    </View>
                </View>
            </View>
        </View>
    );
}

// ─────────────────────────────────────────
// Main Onboarding Screen
// ─────────────────────────────────────────
export default function OnboardingScreen({ navigation }: any) {
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';
    const { user } = useUser();
    const { getToken } = useAuth();
    const [step, setStep] = useState(0);
    const [saving, setSaving] = useState(false);

    const [data, setData] = useState({
        name: user?.firstName || '',
        semester: 4,
        branch: 'cs',
        selectedSubjects: [] as string[],
        targetCGPA: 3.5,
        focusMode: 'exam_performance',
    });

    const steps = [
        { title: 'System Initialization', component: <StepAwakening data={data} setData={setData} /> },
        { title: 'Initialize Curriculum', component: <StepCurriculum data={data} setData={setData} /> },
        { title: 'Goal Setting', component: <StepGoals data={data} setData={setData} /> },
        { title: 'Final Sync', component: <StepFinalSync data={data} /> },
    ];

    const canProceed = () => {
        if (step === 0) return data.name.trim().length > 0;
        if (step === 1) return (data.selectedSubjects || []).length > 0;
        if (step === 2) return data.targetCGPA > 0 && data.focusMode;
        return true;
    };

    const handleComplete = async () => {
        if (!user) return;
        setSaving(true);

        try {
            const token = await getToken({ template: 'Supabase' });
            if (!token) {
                Alert.alert('Error', 'Could not get auth token.');
                setSaving(false);
                return;
            }

            const supabase = createClerkSupabaseClient(token);

            // Update player_stats with onboarding data
            const { error } = await supabase
                .from('player_stats')
                .update({
                    name: data.name,
                    semester: data.semester,
                    branch: data.branch,
                    target_cgpa: data.targetCGPA,
                    focus_mode: data.focusMode,
                    has_completed_onboarding: true,
                })
                .eq('clerk_user_id', user.id);

            if (error) {
                // If no row exists yet, insert instead
                const { error: insertErr } = await supabase
                    .from('player_stats')
                    .insert({
                        clerk_user_id: user.id,
                        name: data.name,
                        semester: data.semester,
                        branch: data.branch,
                        target_cgpa: data.targetCGPA,
                        focus_mode: data.focusMode,
                        has_completed_onboarding: true,
                        level: 1,
                        total_xp: 0,
                        streak_days: 0,
                    });
                if (insertErr) {
                    console.error('❌ Onboarding insert error:', JSON.stringify(insertErr));
                    Alert.alert('Error', insertErr.message);
                    setSaving(false);
                    return;
                }
            }

            console.log('✅ Onboarding complete! Navigating to main app...');
            navigation.replace('OracleProcessing', {
                semester: data.semester,
                branch: data.branch,
                selectedSubjects: data.selectedSubjects,
                focusMode: data.focusMode,
                targetCGPA: data.targetCGPA,
            });
        } catch (err: any) {
            Alert.alert('Error', err.message);
        } finally {
            setSaving(false);
        }
    };

    const isLastStep = step === steps.length - 1;

    return (
        <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
            {/* Header */}
            <View className="flex-row items-center justify-between px-6 py-4">
                {step > 0 ? (
                    <TouchableOpacity onPress={() => setStep(step - 1)} className="w-10 h-10 items-center justify-center">
                        <MaterialIcons name="arrow-back" size={24} color={isDark ? '#fff' : '#2C3E50'} />
                    </TouchableOpacity>
                ) : (
                    <View className="w-10" />
                )}
                <Text className="text-text-main dark:text-white font-bold text-xs uppercase tracking-[0.2em]">
                    {steps[step].title}
                </Text>
                <View className="w-10" />
            </View>

            {/* Progress dots */}
            <View className="flex-row justify-center gap-2 mb-4">
                {steps.map((_, i) => (
                    <View
                        key={i}
                        className={`h-1.5 rounded-full ${i === step ? 'w-8 bg-primary' : i < step ? 'w-2 bg-primary/50' : 'w-2 bg-text-muted/20'}`}
                    />
                ))}
            </View>

            {/* Content */}
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                {steps[step].component}
            </ScrollView>

            {/* Bottom CTA */}
            <View className="px-6 pb-8 pt-4">
                <TouchableOpacity
                    onPress={isLastStep ? handleComplete : () => setStep(step + 1)}
                    disabled={!canProceed() || saving}
                    className={`w-full py-5 rounded-2xl flex-row items-center justify-center gap-2 ${canProceed() ? 'bg-primary' : 'bg-primary/30'}`}
                >
                    {saving ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <>
                            <Text className="text-white font-bold text-lg">
                                {isLastStep ? 'Enter the Dojo' : step === 0 ? 'Begin Journey' : 'Continue'}
                            </Text>
                            <MaterialIcons name={isLastStep ? 'arrow-forward' : 'auto-awesome'} size={20} color="white" />
                        </>
                    )}
                </TouchableOpacity>

                {step === 0 && (
                    <Text className="text-text-muted text-xs text-center mt-3 uppercase tracking-wider">
                        System Status: Stable · Ready for Awakening
                    </Text>
                )}
            </View>
        </SafeAreaView>
    );
}

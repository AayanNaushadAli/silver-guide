import React, { useEffect, useState, useRef } from 'react';
import { View, Text, SafeAreaView, Animated, Easing } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { getSubjectsForSemester, buildSyllabusContext } from '../services/knowledgeService';
import { MentorService } from '../services/mentorService';
import { useQuests } from '../context/QuestContext';

const FAKE_LOGS = [
    'Initializing neural pathways...',
    'Scanning syllabus data nodes...',
    'Mapping knowledge graph...',
    'Calculating optimal study path...',
    'Generating quest objectives...',
    'Assigning XP values...',
    'Calibrating difficulty curve...',
    'Syncing with The Oracle...',
    'Finalizing your journey...',
];

export default function OracleProcessingScreen({ route, navigation }: any) {
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';
    const { getToken } = useAuth();
    const { user } = useUser();
    const { replaceAllQuests } = useQuests();

    const { semester, branch, selectedSubjects, focusMode, targetCGPA } = route.params || {};

    const [currentLog, setCurrentLog] = useState(0);
    const [progress, setProgress] = useState(0);
    const [statusText, setStatusText] = useState('Consulting the Oracle...');

    // Pulse animation
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        const pulse = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1.3, duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 1, duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
            ])
        );
        pulse.start();
        return () => pulse.stop();
    }, []);

    // Fake log feed
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentLog(prev => {
                if (prev < FAKE_LOGS.length - 1) return prev + 1;
                return prev;
            });
            setProgress(prev => Math.min(prev + 12, 95));
        }, 800);
        return () => clearInterval(interval);
    }, []);

    // Actual AI quest generation
    useEffect(() => {
        generateQuests();
    }, []);

    async function generateQuests() {
        try {
            if (!user) {
                setStatusText('Auth error. Retrying...');
                return;
            }

            const allSubjects = getSubjectsForSemester(semester, branch);
            const selected = allSubjects.filter(s => selectedSubjects.includes(s.code));
            const syllabusContext = buildSyllabusContext(selected);

            // Use AI to generate structured quests
            const mentorService = new MentorService();
            const quests = await mentorService.generateQuestsFromSyllabus(
                syllabusContext,
                selected,
                focusMode,
                targetCGPA
            );

            if (quests && quests.length > 0) {
                // Use QuestContext to save — keeps React state + DB in sync
                await replaceAllQuests(quests);
            }

            setProgress(100);
            setStatusText('Path illuminated!');

            // Navigate to main app after a brief pause
            setTimeout(() => {
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'MainTabs' }],
                });
            }, 1200);

        } catch (err: any) {
            console.error('❌ Oracle: Generation failed:', err.message);
            setStatusText('Oracle encountered interference...');
            // Still navigate after error — user can recalibrate later
            setTimeout(() => {
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'MainTabs' }],
                });
            }, 2000);
        }
    }

    return (
        <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
            <View className="flex-1 items-center justify-center px-8">

                {/* Pulsing Oracle Circle */}
                <Animated.View
                    style={{ transform: [{ scale: pulseAnim }] }}
                    className="w-32 h-32 rounded-full bg-primary/20 items-center justify-center mb-8"
                >
                    <View className="w-24 h-24 rounded-full bg-primary/30 items-center justify-center">
                        <View className="w-16 h-16 rounded-full bg-primary items-center justify-center">
                            <MaterialIcons name="auto-awesome" size={32} color="white" />
                        </View>
                    </View>
                </Animated.View>

                {/* Title */}
                <Text className="text-2xl font-bold text-text-main dark:text-white text-center mb-2">
                    {statusText}
                </Text>
                <Text className="text-text-muted text-center text-sm mb-8">
                    The Oracle is analyzing your syllabus{'\n'}and crafting your study path.
                </Text>

                {/* Progress Bar */}
                <View className="w-full h-2 bg-surface dark:bg-surface-dark rounded-full overflow-hidden mb-6">
                    <View
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${progress}%` }}
                    />
                </View>

                {/* Fake Log Feed */}
                <View className="w-full bg-surface dark:bg-surface-dark rounded-2xl p-4 border border-primary/10">
                    {FAKE_LOGS.slice(0, currentLog + 1).map((log, i) => (
                        <View key={i} className="flex-row items-center gap-2 mb-1">
                            <MaterialIcons
                                name={i < currentLog ? 'check-circle' : 'pending'}
                                size={14}
                                color={i < currentLog ? '#6B8E23' : '#95A5A6'}
                            />
                            <Text className={`text-xs font-mono ${i < currentLog ? 'text-text-muted' : 'text-primary font-bold'}`}>
                                {log}
                            </Text>
                        </View>
                    ))}
                </View>

                {/* Data nodes counter */}
                <Text className="text-text-muted text-xs mt-4 font-mono">
                    Data Nodes Processed: {Math.min(currentLog * 12 + 7, 108)} / 108
                </Text>
            </View>
        </SafeAreaView>
    );
}

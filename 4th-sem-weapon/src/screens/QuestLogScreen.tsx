import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, LayoutAnimation, Platform, UIManager, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';
import { useNavigation } from '@react-navigation/native';
import { useQuests, Quest } from '../context/QuestContext';
import { useMentor } from '../context/MentorContext';



// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

// --- The Custom Accordion Component ---
const QuestCard = ({
    quest, onToggleTask, onNavigateDetail
}: { quest: Quest, onToggleTask: (questId: string, taskIndex: number) => void, onNavigateDetail: (questId: string) => void }) => {
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';
    const [isOpen, setIsOpen] = useState(false);
    const { getProgress } = useQuests();
    const progress = getProgress(quest);

    const toggleAccordion = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setIsOpen(!isOpen);
    };

    return (
        <View className="bg-surface dark:bg-surface-dark rounded-2xl shadow-sm overflow-hidden mb-4 border border-primary/10">
            {/* Quest Header (Always Visible) */}
            <TouchableOpacity onPress={toggleAccordion} activeOpacity={0.7} className="p-4 flex-row items-center">

                {/* Icon */}
                <View className="w-12 h-12 rounded-full bg-background-light dark:bg-background-dark flex items-center justify-center shadow-sm mr-4">
                    <MaterialIcons name={quest.icon as any} size={24} color={quest.iconColor} />
                </View>

                {/* Info */}
                <View className="flex-1 mr-2">
                    <View className="flex-row justify-between items-center mb-2">
                        <Text className="font-bold text-lg text-text-main dark:text-white truncate" numberOfLines={1}>{quest.title}</Text>
                        <View className={`flex-row items-center gap-1 px-2 py-1 rounded-full border ${quest.deadlineBg}`}>
                            <MaterialIcons name={quest.deadlineIcon as any} size={12} color={quest.deadlineColor} />
                            <Text className="font-mono text-[10px] font-bold" style={{ color: quest.deadlineColor }}>{quest.deadline}</Text>
                        </View>
                    </View>

                    {/* Progress Bar */}
                    <View className="flex-row items-center gap-3">
                        <View className="flex-1 h-1.5 bg-black/5 dark:bg-black/20 rounded-full overflow-hidden">
                            <View className={`h-full rounded-full ${quest.progressColor}`} style={{ width: `${progress}%` }} />
                        </View>
                        <Text className="font-mono text-xs text-text-muted">{progress}%</Text>
                    </View>
                </View>

                {/* Chevron */}
                <MaterialIcons
                    name="expand-more"
                    size={24}
                    color="#95A5A6"
                    style={{ transform: [{ rotate: isOpen ? '180deg' : '0deg' }] }}
                />
            </TouchableOpacity>

            {/* Dropdown Content (Tasks) */}
            {isOpen && (
                <View className="px-4 pb-4 pt-2 border-t border-black/5 dark:border-white/5 bg-background-light/40 dark:bg-background-dark/40">
                    {quest.tasks.map((task: any, index: number) => (
                        <TouchableOpacity
                            key={index}
                            onPress={() => onToggleTask(quest.id, index)}
                            activeOpacity={0.7}
                            className={`flex-row items-center p-3 rounded-xl mb-2 transition-colors ${task.completed ? 'bg-transparent' : 'bg-background-light dark:bg-background-dark shadow-sm border border-primary/10'}`}
                        >
                            {/* Checkbox */}
                            <View className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 ${task.completed ? 'bg-gold border-gold' : 'border-text-muted/40'}`}>
                                {task.completed && <MaterialIcons name="check" size={16} color="white" />}
                                {!task.completed && <MaterialIcons name="lock" size={10} color="#95A5A6" />}
                            </View>

                            {/* Task Name */}
                            <Text className={`flex-1 text-sm ${task.completed ? 'text-text-muted line-through decoration-primary/50' : 'text-text-main dark:text-white font-bold'}`}>
                                {task.title}
                            </Text>

                            {/* XP Reward & Score */}
                            <View className="flex-row items-center gap-2">
                                {task.completed && task.score !== undefined && (
                                    <View className="bg-primary/20 px-2 py-0.5 rounded-md border border-primary/30">
                                        <Text className="font-mono text-[10px] font-bold text-primary">
                                            {task.score}%
                                        </Text>
                                    </View>
                                )}
                                <View className={task.completed ? 'opacity-50' : 'bg-gold/10 px-2 py-0.5 rounded-md'}>
                                    <Text className="font-mono text-[10px] font-bold" style={{ color: task.completed ? '#95A5A6' : '#F1C40F' }}>
                                        +{task.earnedXp ?? task.xp} XP
                                    </Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))}

                    <TouchableOpacity
                        onPress={() => onNavigateDetail(quest.id)}
                        className="mt-3 flex-row items-center justify-center bg-primary/10 py-3 rounded-xl border border-primary/20 active:opacity-70"
                    >
                        <MaterialIcons name="local-library" size={18} color="#6B8E23" className="mr-2" />
                        <Text className="text-primary font-bold text-sm ml-2">Deep Dive & Focus</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};


// --- The Main Screen ---
export default function QuestLogScreen() {
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';
    const navigation = useNavigation<any>();
    const { quests, toggleTask, getProgress } = useQuests();
    const { reviewTaskCompletion, refreshBriefing } = useMentor();

    const overallProgress = quests.length > 0
        ? Math.round(quests.reduce((sum, q) => sum + getProgress(q), 0) / quests.length)
        : 0;

    // AI-enhanced task toggle: complete task → AI reviews → gives feedback
    const handleTaskToggle = async (questId: string, taskIndex: number) => {
        const quest = quests.find(q => q.id === questId);
        if (!quest) return;

        const task = quest.tasks[taskIndex];

        // Block manual toggling for ALL quests entirely
        if (!task.completed) {
            Alert.alert(
                '🧠 Oracle Required',
                'This quest requires a quiz to prove your mastery. Ask The Oracle to quiz you on this topic to earn XP!',
                [
                    { text: 'Go to Chat', onPress: () => navigation.navigate('Chat') },
                    { text: 'Cancel', style: 'cancel' }
                ]
            );
        } else {
            Alert.alert(
                '⚠️ Reset Quest',
                'Are you sure you want to reset this quest? You will lose the XP and score earned from The Oracle.',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Reset', style: 'destructive', onPress: () => toggleTask(questId, taskIndex) }
                ]
            );
        }
        return;
    };

    // Recalibrate: navigate to full recalibration screen
    const handleRecalibrate = () => {
        navigation.navigate('SystemRecalibration');
    };

    return (
        <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">

            {/* Top Header */}
            <View className="px-6 pt-6 pb-4 border-b border-primary/10 bg-background-light/90 dark:bg-background-dark/90 z-20">
                <View className="flex-row items-center justify-between mb-4">
                    <View>
                        <Text className="font-bold text-3xl text-text-main dark:text-white tracking-tight font-display">Quest Log</Text>
                        <Text className="text-text-muted text-sm font-medium mt-1">
                            Semester Completion: <Text className="text-primary font-bold">{overallProgress}%</Text>
                        </Text>
                    </View>

                    <View className="flex-row items-center gap-2">
                        {/* Recalibrate Button */}
                        <TouchableOpacity
                            onPress={handleRecalibrate}
                            className="flex-row items-center gap-1.5 bg-indigo-50 dark:bg-indigo-900/20 px-3 py-2 rounded-full border border-indigo-200 dark:border-indigo-800/50 active:opacity-70">
                            <MaterialIcons name="sync" size={16} color="#6366f1" />
                            <Text className="font-bold text-xs text-indigo-600 dark:text-indigo-400">Recalibrate</Text>
                        </TouchableOpacity>

                        {/* Add Quest Button */}
                        <TouchableOpacity
                            onPress={() => navigation.navigate('CustomizePath')}
                            className="flex-row items-center gap-1.5 bg-surface dark:bg-surface-dark px-3 py-2 rounded-full shadow-sm border border-primary/10 active:opacity-70">
                            <MaterialIcons name="add-circle" size={16} color="#6B8E23" />
                            <Text className="font-bold text-xs text-text-main dark:text-white">Add Quest</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Global Progress Bar */}
                <View className="w-full h-2 bg-surface dark:bg-surface-dark rounded-full overflow-hidden">
                    <View className="h-full bg-primary rounded-full" style={{ width: `${overallProgress}%` }} />
                </View>
            </View>

            {/* Main Content List */}
            <ScrollView className="flex-1 px-4 pt-6" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 130 }}>

                {quests.map((quest) => (
                    <QuestCard
                        key={quest.id}
                        quest={quest}
                        onToggleTask={handleTaskToggle}
                        onNavigateDetail={(id) => navigation.navigate('TopicDetail', { questId: id })}
                    />
                ))}

                {/* Empty State */}
                <View className="pt-6 pb-12 items-center justify-center opacity-60">
                    <View className="w-16 h-16 rounded-full bg-surface dark:bg-surface-dark border-2 border-dashed border-text-muted/30 items-center justify-center mb-3">
                        <MaterialIcons name="map" size={32} color="#95A5A6" />
                    </View>
                    <Text className="text-text-muted text-center font-medium text-sm">
                        Map out the rest of your semester{'\n'}to unlock more quests.
                    </Text>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}


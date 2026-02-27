import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, LayoutAnimation, Platform, UIManager } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';
import { useNavigation } from '@react-navigation/native';
import { useQuests, Quest } from '../context/QuestContext';



// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

// --- The Custom Accordion Component ---
const QuestCard = ({
    quest, onToggleTask
}: { quest: Quest, onToggleTask: (questId: string, taskIndex: number) => void }) => {
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
                            </View>

                            {/* Task Name */}
                            <Text className={`flex-1 text-sm ${task.completed ? 'text-text-muted line-through decoration-primary/50' : 'text-text-main dark:text-white font-bold'}`}>
                                {task.title}
                            </Text>

                            {/* XP Reward */}
                            <View className={task.completed ? 'opacity-50' : 'bg-gold/10 px-2 py-0.5 rounded-md'}>
                                <Text className="font-mono text-xs font-bold" style={{ color: task.completed ? '#95A5A6' : '#F1C40F' }}>
                                    +{task.xp} XP
                                </Text>
                            </View>
                        </TouchableOpacity>
                    ))}
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

    const overallProgress = quests.length > 0
        ? Math.round(quests.reduce((sum, q) => sum + getProgress(q), 0) / quests.length)
        : 0;

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

                    {/* Add Quest Button */}
                    <TouchableOpacity
                        onPress={() => navigation.navigate('AddQuest')}
                        className="flex-row items-center gap-2 bg-surface dark:bg-surface-dark px-4 py-2 rounded-full shadow-sm border border-primary/10 active:opacity-70">
                        <MaterialIcons name="add-circle" size={20} color="#6B8E23" />
                        <Text className="font-bold text-sm text-text-main dark:text-white">Add Quest</Text>
                    </TouchableOpacity>
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
                        onToggleTask={toggleTask}
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
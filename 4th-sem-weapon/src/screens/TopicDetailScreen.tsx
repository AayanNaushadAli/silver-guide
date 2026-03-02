import React from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useQuests } from '../context/QuestContext';

/**
 * TopicDetailScreen
 * Shows detailed breakdown of a single quest (subject) — all units/tasks,
 * progress, and action buttons.
 */
export default function TopicDetailScreen({ route, navigation }: any) {
    const { questId } = route.params || {};
    const { quests, toggleTask, getProgress } = useQuests();

    const quest = quests.find(q => q.id === questId);

    if (!quest) {
        return (
            <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark items-center justify-center">
                <MaterialIcons name="search-off" size={48} color="#95A5A6" />
                <Text className="text-text-muted mt-4">Quest not found</Text>
                <TouchableOpacity onPress={() => navigation.goBack()} className="mt-4 bg-primary px-6 py-3 rounded-xl">
                    <Text className="text-white font-bold">Go Back</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    const progress = getProgress(quest);
    const completedCount = quest.tasks.filter(t => t.completed).length;
    const totalXP = quest.tasks.reduce((s, t) => s + t.xp, 0);
    const earnedXP = quest.tasks.filter(t => t.completed).reduce((s, t) => s + t.xp, 0);

    return (
        <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
            {/* Header */}
            <View className="px-6 pt-6 pb-4 border-b border-primary/10">
                <View className="flex-row items-center gap-4 mb-4">
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <MaterialIcons name="arrow-back" size={24} color="#6B8E23" />
                    </TouchableOpacity>
                    <View className="flex-1">
                        <Text className="text-xl font-bold text-text-main dark:text-white">{quest.title}</Text>
                        <Text className="text-xs text-text-muted font-mono">{completedCount}/{quest.tasks.length} units complete</Text>
                    </View>
                    <View className="h-12 w-12 rounded-full items-center justify-center" style={{ backgroundColor: quest.iconColor + '15' }}>
                        <MaterialIcons name={quest.icon as any} size={24} color={quest.iconColor} />
                    </View>
                </View>

                {/* Progress Bar */}
                <View className="mb-2">
                    <View className="flex-row justify-between mb-1">
                        <Text className="text-[10px] text-text-muted font-mono">{progress}%</Text>
                        <Text className="text-[10px] text-gold font-mono font-bold">{earnedXP}/{totalXP} XP</Text>
                    </View>
                    <View className="h-3 bg-surface dark:bg-surface-dark rounded-full overflow-hidden border border-primary/5">
                        <View
                            className={`h-full rounded-full ${quest.progressColor}`}
                            style={{ width: `${progress}%` }}
                        />
                    </View>
                </View>
            </View>

            <ScrollView className="flex-1 px-6 pt-4" contentContainerStyle={{ paddingBottom: 40 }}>
                {/* Deadline Status */}
                <View className={`flex-row items-center gap-2 px-4 py-3 rounded-xl border mb-6 ${quest.deadlineBg}`}>
                    <MaterialIcons name={quest.deadlineIcon as any} size={16} color={quest.deadlineColor} />
                    <Text className="text-xs font-bold font-mono" style={{ color: quest.deadlineColor }}>{quest.deadline}</Text>
                </View>

                {/* Task List */}
                <Text className="text-lg font-bold text-text-main dark:text-white mb-4 px-1">Units / Tasks</Text>

                {quest.tasks.map((task, index) => (
                    <TouchableOpacity
                        key={index}
                        onPress={() => toggleTask(quest.id, index)}
                        className={`flex-row items-center gap-4 p-4 rounded-2xl border mb-3 ${task.completed
                                ? 'bg-primary/5 border-primary/20'
                                : 'bg-surface dark:bg-surface-dark border-primary/10'
                            }`}
                    >
                        {/* Checkbox */}
                        <View className={`h-8 w-8 rounded-full items-center justify-center border-2 ${task.completed
                                ? 'bg-primary border-primary'
                                : 'border-primary/30'
                            }`}>
                            {task.completed && <MaterialIcons name="check" size={18} color="white" />}
                        </View>

                        {/* Task Info */}
                        <View className="flex-1">
                            <Text className={`text-sm font-bold ${task.completed
                                    ? 'text-primary line-through opacity-70'
                                    : 'text-text-main dark:text-white'
                                }`}>{task.title}</Text>
                        </View>

                        {/* XP Badge */}
                        <View className={`px-3 py-1.5 rounded-full ${task.completed ? 'bg-primary/10' : 'bg-gold/10'
                            }`}>
                            <Text className={`text-xs font-bold font-mono ${task.completed ? 'text-primary' : 'text-gold'
                                }`}>
                                {task.completed ? '✓' : '+'}{task.xp} XP
                            </Text>
                        </View>
                    </TouchableOpacity>
                ))}

                {/* Completion Status */}
                {progress === 100 && (
                    <View className="bg-primary/10 border border-primary/20 rounded-2xl p-6 items-center mt-4">
                        <MaterialIcons name="emoji-events" size={40} color="#6B8E23" />
                        <Text className="text-lg font-bold text-primary mt-2">Quest Complete!</Text>
                        <Text className="text-xs text-text-muted text-center mt-1">
                            All units mastered. You earned {totalXP} XP from this quest.
                        </Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

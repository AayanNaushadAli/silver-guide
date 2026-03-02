import React, { useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useQuests, Quest, Task } from '../context/QuestContext';

/**
 * CustomizePathScreen
 * Allows users to manually add custom quests/tasks, rearrange priorities,
 * or add PYQ-based topics to their study path.
 */
export default function CustomizePathScreen({ navigation }: any) {
    const { quests, addQuest, removeQuest } = useQuests();

    const [showAddForm, setShowAddForm] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newTasks, setNewTasks] = useState<string[]>(['']);

    const ICON_OPTIONS = [
        { icon: 'menu-book', color: '#6366f1' },
        { icon: 'science', color: '#10b981' },
        { icon: 'code', color: '#f59e0b' },
        { icon: 'psychology', color: '#ec4899' },
        { icon: 'build', color: '#6B8E23' },
        { icon: 'calculate', color: '#3b82f6' },
    ];
    const [selectedIcon, setSelectedIcon] = useState(0);

    const handleAddTask = () => {
        setNewTasks(prev => [...prev, '']);
    };

    const handleUpdateTask = (index: number, text: string) => {
        setNewTasks(prev => {
            const updated = [...prev];
            updated[index] = text;
            return updated;
        });
    };

    const handleRemoveTask = (index: number) => {
        if (newTasks.length <= 1) return;
        setNewTasks(prev => prev.filter((_, i) => i !== index));
    };

    const handleCreateQuest = async () => {
        if (!newTitle.trim()) {
            Alert.alert('Missing Title', 'Please enter a quest title.');
            return;
        }
        const validTasks = newTasks.filter(t => t.trim());
        if (validTasks.length === 0) {
            Alert.alert('Missing Tasks', 'Add at least one task.');
            return;
        }

        const iconOpt = ICON_OPTIONS[selectedIcon];
        const quest: Quest = {
            id: `custom_${Date.now()}`,
            title: newTitle.trim(),
            icon: iconOpt.icon,
            iconColor: iconOpt.color,
            deadline: 'Custom',
            deadlineBg: 'bg-primary/10 border-primary/20',
            deadlineColor: '#6B8E23',
            deadlineIcon: 'edit',
            progressColor: 'bg-primary',
            tasks: validTasks.map(t => ({
                title: t.trim(),
                xp: 100,
                completed: false,
            })),
        };

        await addQuest(quest);
        setNewTitle('');
        setNewTasks(['']);
        setShowAddForm(false);
    };

    const handleDeleteQuest = (questId: string, questTitle: string) => {
        Alert.alert(
            'Remove Quest',
            `Are you sure you want to remove "${questTitle}"? This cannot be undone.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: () => removeQuest(questId),
                },
            ]
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
            {/* Header */}
            <View className="flex-row items-center px-6 pt-6 pb-4 border-b border-primary/10">
                <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
                    <MaterialIcons name="arrow-back" size={24} color="#6B8E23" />
                </TouchableOpacity>
                <View className="flex-1">
                    <Text className="text-xl font-bold text-text-main dark:text-white">Customize Path</Text>
                    <Text className="text-xs text-text-muted font-mono">Add or manage quests</Text>
                </View>
                <TouchableOpacity
                    onPress={() => setShowAddForm(prev => !prev)}
                    className="bg-primary h-10 w-10 rounded-full items-center justify-center"
                >
                    <MaterialIcons name={showAddForm ? 'close' : 'add'} size={24} color="white" />
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 px-6 pt-4" contentContainerStyle={{ paddingBottom: 40 }}>
                {/* Add Quest Form */}
                {showAddForm && (
                    <View className="bg-surface dark:bg-surface-dark rounded-2xl p-5 border border-primary/20 mb-6">
                        <Text className="text-sm font-bold text-text-main dark:text-white mb-3">New Custom Quest</Text>

                        <TextInput
                            placeholder="Quest Title (e.g. DBMS PYQ Practice)"
                            placeholderTextColor="#95A5A6"
                            value={newTitle}
                            onChangeText={setNewTitle}
                            className="bg-background-light dark:bg-background-dark text-text-main dark:text-white px-4 py-3 rounded-xl border border-primary/10 mb-3 text-sm"
                        />

                        {/* Icon Picker */}
                        <Text className="text-xs text-text-muted mb-2 px-1">Icon</Text>
                        <View className="flex-row gap-2 mb-4">
                            {ICON_OPTIONS.map((opt, i) => (
                                <TouchableOpacity
                                    key={i}
                                    onPress={() => setSelectedIcon(i)}
                                    className={`h-10 w-10 rounded-full items-center justify-center ${selectedIcon === i ? 'bg-primary' : 'bg-primary/10'
                                        }`}
                                >
                                    <MaterialIcons
                                        name={opt.icon as any}
                                        size={20}
                                        color={selectedIcon === i ? 'white' : opt.color}
                                    />
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Dynamic Tasks */}
                        <Text className="text-xs text-text-muted mb-2 px-1">Tasks</Text>
                        {newTasks.map((task, i) => (
                            <View key={i} className="flex-row items-center gap-2 mb-2">
                                <TextInput
                                    placeholder={`Task ${i + 1}`}
                                    placeholderTextColor="#95A5A6"
                                    value={task}
                                    onChangeText={(text) => handleUpdateTask(i, text)}
                                    className="flex-1 bg-background-light dark:bg-background-dark text-text-main dark:text-white px-4 py-2.5 rounded-xl border border-primary/10 text-sm"
                                />
                                {newTasks.length > 1 && (
                                    <TouchableOpacity onPress={() => handleRemoveTask(i)}>
                                        <MaterialIcons name="remove-circle-outline" size={22} color="#E53E3E" />
                                    </TouchableOpacity>
                                )}
                            </View>
                        ))}
                        <TouchableOpacity onPress={handleAddTask} className="flex-row items-center gap-2 mt-1 mb-4 px-1">
                            <MaterialIcons name="add-circle-outline" size={18} color="#6B8E23" />
                            <Text className="text-xs text-primary font-bold">Add Task</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={handleCreateQuest}
                            className="w-full bg-primary py-3.5 rounded-xl items-center flex-row justify-center gap-2"
                        >
                            <MaterialIcons name="check" size={18} color="white" />
                            <Text className="text-white font-bold">Create Quest</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Existing Quests */}
                <Text className="text-lg font-bold text-text-main dark:text-white mb-3 px-1">Your Quests</Text>

                {quests.length === 0 ? (
                    <View className="items-center py-8">
                        <MaterialIcons name="inbox" size={48} color="#95A5A6" />
                        <Text className="text-text-muted mt-2">No quests yet</Text>
                    </View>
                ) : (
                    quests.map(quest => {
                        const progress = quest.tasks.length > 0
                            ? Math.round((quest.tasks.filter(t => t.completed).length / quest.tasks.length) * 100)
                            : 0;
                        return (
                            <View
                                key={quest.id}
                                className="flex-row items-center gap-4 p-4 bg-surface dark:bg-surface-dark rounded-2xl border border-primary/10 mb-3"
                            >
                                <View className="h-10 w-10 rounded-full items-center justify-center" style={{ backgroundColor: quest.iconColor + '15' }}>
                                    <MaterialIcons name={quest.icon as any} size={20} color={quest.iconColor} />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-sm font-bold text-text-main dark:text-white">{quest.title}</Text>
                                    <View className="flex-row items-center gap-2 mt-1">
                                        <Text className="text-[10px] font-mono text-text-muted">{progress}%</Text>
                                        <Text className="text-[10px] font-mono text-gold">
                                            {quest.tasks.filter(t => t.completed).length}/{quest.tasks.length} tasks
                                        </Text>
                                    </View>
                                </View>

                                {/* Navigate to details */}
                                <TouchableOpacity
                                    onPress={() => navigation.navigate('TopicDetail', { questId: quest.id })}
                                    className="p-2"
                                >
                                    <MaterialIcons name="visibility" size={20} color="#6B8E23" />
                                </TouchableOpacity>

                                {/* Delete */}
                                <TouchableOpacity
                                    onPress={() => handleDeleteQuest(quest.id, quest.title)}
                                    className="p-2"
                                >
                                    <MaterialIcons name="delete-outline" size={20} color="#E53E3E" />
                                </TouchableOpacity>
                            </View>
                        );
                    })
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

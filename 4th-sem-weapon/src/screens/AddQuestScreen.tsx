import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';
import { useQuests } from '../context/QuestContext';

export default function AddQuestScreen({ navigation }: any) {
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';
    const { addQuest } = useQuests();

    const [title, setTitle] = useState('');
    const [deadline, setDeadline] = useState('');
    const [tasks, setTasks] = useState([{ title: '', xp: '100' }]);

    // Function to add a new empty task row
    const addTaskRow = () => {
        setTasks([...tasks, { title: '', xp: '100' }]);
    };

    // Function to update a specific task
    const updateTask = (text: string, index: number) => {
        const newTasks = [...tasks];
        newTasks[index].title = text;
        setTasks(newTasks);
    };

    const handleSave = () => {
        if (!title.trim()) return;

        addQuest({
            id: Date.now().toString(),
            title: title.trim(),
            icon: 'school',
            iconColor: '#6B8E23',
            deadline: deadline || 'No Deadline',
            deadlineBg: 'bg-primary/10 border-primary/20',
            deadlineColor: '#6B8E23',
            deadlineIcon: 'event-upcoming',
            progressColor: 'bg-primary',
            tasks: tasks
                .filter(t => t.title.trim())
                .map(t => ({ title: t.title.trim(), xp: parseInt(t.xp) || 100, completed: false })),
        });

        navigation.goBack();
    };

    const placeholderColor = isDark ? "#64748b" : "#CBD5E0";

    return (
        <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                {/* --- Header --- */}
                <View className="flex-row items-center justify-between px-6 py-4 border-b border-primary/10">
                    <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2">
                        <Text className="text-text-muted font-bold">Cancel</Text>
                    </TouchableOpacity>
                    <Text className="text-lg font-bold text-text-main dark:text-white">Forge New Quest</Text>
                    <TouchableOpacity onPress={handleSave} className="bg-primary/10 px-4 py-1.5 rounded-full">
                        <Text className="text-primary font-bold">Save</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>

                    {/* --- Quest Title --- */}
                    <View className="mb-6">
                        <Text className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Quest Title</Text>
                        <TextInput
                            value={title}
                            onChangeText={setTitle}
                            placeholder="e.g. Thermodynamics II"
                            placeholderTextColor={placeholderColor}
                            className="bg-surface dark:bg-surface-dark border border-primary/20 rounded-2xl px-4 py-4 text-lg font-bold text-text-main dark:text-white shadow-sm"
                        />
                    </View>

                    {/* --- Deadline & Subject Icons --- */}
                    <View className="flex-row gap-4 mb-8">
                        <View className="flex-1">
                            <Text className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Deadline</Text>
                            <View className="flex-row items-center bg-surface dark:bg-surface-dark border border-primary/20 rounded-2xl px-4 py-3.5 shadow-sm">
                                <MaterialIcons name="event" size={20} color={isDark ? "#95A5A6" : "#95A5A6"} />
                                <TextInput
                                    value={deadline}
                                    onChangeText={setDeadline}
                                    placeholder="e.g. Exam: 3 Days"
                                    placeholderTextColor={placeholderColor}
                                    className="flex-1 ml-2 text-sm font-bold text-text-main dark:text-white"
                                />
                            </View>
                        </View>

                        <View className="w-1/3">
                            <Text className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Icon</Text>
                            <TouchableOpacity className="flex-row items-center justify-center bg-surface dark:bg-surface-dark border border-primary/20 rounded-2xl py-3.5 shadow-sm">
                                <MaterialIcons name="local-fire-department" size={24} color={isDark ? "#fbd38d" : "#E67E22"} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* --- The Task Builder --- */}
                    <View className="mb-6">
                        <View className="flex-row items-center justify-between mb-3">
                            <Text className="text-xs font-bold text-text-muted uppercase tracking-wider">Quest Modules (Tasks)</Text>
                        </View>

                        {/* Map through tasks */}
                        {tasks.map((task, index) => (
                            <View key={index} className="flex-row items-center gap-3 mb-3">
                                <View className="w-8 h-8 rounded-full bg-background-light dark:bg-black/20 items-center justify-center border border-primary/10">
                                    <Text className="text-text-muted font-bold text-xs">{index + 1}</Text>
                                </View>
                                <TextInput
                                    value={task.title}
                                    onChangeText={(text) => updateTask(text, index)}
                                    placeholder="e.g. Ch 1: Energy Balance"
                                    placeholderTextColor={placeholderColor}
                                    className="flex-1 bg-surface dark:bg-surface-dark border border-primary/20 rounded-xl px-4 py-3 text-sm font-bold text-text-main dark:text-white shadow-sm"
                                />
                            </View>
                        ))}

                        {/* Add Task Button */}
                        <TouchableOpacity
                            onPress={addTaskRow}
                            className="flex-row items-center justify-center py-3 mt-2 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 active:bg-primary/10"
                        >
                            <MaterialIcons name="add" size={20} color="#6B8E23" />
                            <Text className="text-primary font-bold ml-1">Add Module</Text>
                        </TouchableOpacity>
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
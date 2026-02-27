import React, { useState, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, Image, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useUser } from '@clerk/clerk-expo';
import { useColorScheme } from 'nativewind';
import { sendMessageToOracle, parseQuestFromResponse, ChatMessage } from '../services/aiService';
import { useQuests } from '../context/QuestContext';

export default function ChatScreen({ navigation }: any) {
    const { user } = useUser();
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';
    const { addQuest } = useQuests();

    // Chat State
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            role: 'assistant',
            content: "Welcome, Warrior. I am The Oracle — your strategic advisor in this academic campaign. Tell me what subject you're tackling, and I'll forge a battle plan. ⚔️"
        }
    ]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollViewRef = useRef<ScrollView>(null);

    // Send a message
    const handleSend = async () => {
        const trimmed = inputText.trim();
        if (!trimmed || isLoading) return;

        // Add user message to the chat immediately
        const userMsg: ChatMessage = { role: 'user', content: trimmed };
        const updatedMessages = [...messages, userMsg];
        setMessages(updatedMessages);
        setInputText('');

        // Scroll to bottom
        setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);

        // Call The Oracle
        setIsLoading(true);
        try {
            const reply = await sendMessageToOracle(
                // Send last 20 messages as context to avoid token overflow
                updatedMessages.slice(-20),
                trimmed
            );

            // Check if the AI created a quest
            const { quest, cleanMessage } = parseQuestFromResponse(reply);

            if (quest) {
                // Auto-create the quest in the app
                addQuest({
                    id: Date.now().toString(),
                    title: quest.title,
                    icon: quest.icon || 'school',
                    iconColor: quest.iconColor || '#6B8E23',
                    deadline: quest.deadline || 'No Deadline',
                    deadlineBg: 'bg-primary/10 border-primary/20',
                    deadlineColor: '#6B8E23',
                    deadlineIcon: 'event-upcoming',
                    progressColor: 'bg-primary',
                    tasks: (quest.tasks || []).map((t: any) => ({
                        title: t.title,
                        xp: t.xp || 100,
                        completed: false,
                    })),
                });

                // Show a clean message + confirmation
                const confirmMsg = cleanMessage + '\n\n✅ Quest "' + quest.title + '" has been forged and added to your Quest Log!';
                const assistantMsg: ChatMessage = { role: 'assistant', content: confirmMsg };
                setMessages(prev => [...prev, assistantMsg]);
            } else {
                const assistantMsg: ChatMessage = { role: 'assistant', content: reply };
                setMessages(prev => [...prev, assistantMsg]);
            }
        } catch (error) {
            const errorMsg: ChatMessage = {
                role: 'assistant',
                content: "⚠️ The Oracle's connection was disrupted. Please try again."
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
            setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
        }
    };

    // Handle quick action chip press
    const handleChip = (text: string) => {
        setInputText(text);
    };

    return (
        <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                {/* --- Header --- */}
                <View className="flex-row items-center justify-between px-6 py-4 bg-background-light/90 dark:bg-background-dark/90 border-b border-primary/10 z-10">
                    <View className="flex-row items-center gap-3">
                        <TouchableOpacity onPress={() => navigation.navigate('Dojo')} className="p-2 bg-primary/10 rounded-full mr-1">
                            <MaterialIcons name="arrow-back" size={24} color="#6B8E23" />
                        </TouchableOpacity>
                        <View className="p-2 bg-primary/10 rounded-xl">
                            <MaterialIcons name="auto-awesome" size={24} color="#6B8E23" />
                        </View>
                        <View>
                            <Text className="text-lg font-bold text-text-main dark:text-white leading-tight">The Oracle</Text>
                            <View className="flex-row items-center gap-1.5">
                                <View className={`h-2 w-2 rounded-full ${isLoading ? 'bg-yellow-500' : 'bg-primary'}`} />
                                <Text className="text-[10px] font-bold text-primary uppercase tracking-wider">
                                    {isLoading ? 'Thinking...' : 'Online & Ready'}
                                </Text>
                            </View>
                        </View>
                    </View>
                    <TouchableOpacity className="p-2 rounded-full hover:bg-primary/5">
                        <MaterialIcons name="more-vert" size={24} color="#95A5A6" />
                    </TouchableOpacity>
                </View>

                {/* --- Chat Area --- */}
                <ScrollView
                    ref={scrollViewRef}
                    className="flex-1 px-4 pt-2"
                    showsVerticalScrollIndicator={false}
                    onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
                >

                    <View className="text-center py-4 items-center">
                        <Text className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em]">Powered by Groq • Llama 3</Text>
                    </View>

                    {/* Render all messages dynamically */}
                    {messages.map((msg, index) =>
                        msg.role === 'assistant' ? (
                            // AI Message
                            <View key={index} className="flex-row items-start gap-3 w-[85%] mb-6">
                                <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center border border-primary/20">
                                    <MaterialIcons name="psychology" size={20} color="#6B8E23" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-[11px] font-bold text-text-muted ml-1 mb-1">The Oracle</Text>
                                    <View className="bg-surface dark:bg-surface-dark p-4 rounded-2xl rounded-tl-none shadow-sm border border-primary/10">
                                        <Text className="text-text-main dark:text-white text-sm leading-relaxed">
                                            {msg.content}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        ) : (
                            // User Message
                            <View key={index} className="flex-row items-start justify-end gap-3 w-[85%] self-end mb-6">
                                <View className="flex-1 items-end">
                                    <Text className="text-[11px] font-bold text-text-muted mr-1 mb-1">You</Text>
                                    <View className="bg-primary p-4 rounded-2xl rounded-tr-none shadow-sm">
                                        <Text className="text-white text-sm leading-relaxed">
                                            {msg.content}
                                        </Text>
                                    </View>
                                </View>
                                <Image
                                    source={{ uri: user?.imageUrl || 'https://via.placeholder.com/150' }}
                                    className="w-10 h-10 rounded-full border-2 border-white dark:border-surface-dark bg-gray-200"
                                />
                            </View>
                        )
                    )}

                    {/* Typing indicator */}
                    {isLoading && (
                        <View className="flex-row items-start gap-3 w-[85%] mb-6">
                            <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center border border-primary/20">
                                <MaterialIcons name="psychology" size={20} color="#6B8E23" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-[11px] font-bold text-text-muted ml-1 mb-1">The Oracle</Text>
                                <View className="bg-surface dark:bg-surface-dark p-4 rounded-2xl rounded-tl-none shadow-sm border border-primary/10 flex-row items-center gap-2">
                                    <ActivityIndicator size="small" color="#6B8E23" />
                                    <Text className="text-text-muted text-sm italic">Consulting the scrolls...</Text>
                                </View>
                            </View>
                        </View>
                    )}

                    <View className="h-6" /> {/* Bottom padding */}
                </ScrollView>

                {/* --- Footer Area (Input & Chips) --- */}
                <View className="p-4 bg-background-light dark:bg-background-dark border-t border-primary/10">

                    {/* Action Chips */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3" contentContainerStyle={{ gap: 8 }}>
                        <TouchableOpacity onPress={() => handleChip("Summarize my weakest topic")} className="px-4 py-2 bg-surface dark:bg-surface-dark border border-primary/20 rounded-full flex-row items-center gap-2">
                            <MaterialIcons name="summarize" size={16} color="#6B8E23" />
                            <Text className="text-xs font-bold text-text-main dark:text-white">Summarize Topic</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleChip("Give me a study plan for this week")} className="px-4 py-2 bg-surface dark:bg-surface-dark border border-primary/20 rounded-full flex-row items-center gap-2">
                            <MaterialIcons name="flag" size={16} color="#6B8E23" />
                            <Text className="text-xs font-bold text-text-main dark:text-white">Study Plan</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleChip("Quiz me on my latest subject")} className="px-4 py-2 bg-surface dark:bg-surface-dark border border-primary/20 rounded-full flex-row items-center gap-2">
                            <MaterialIcons name="quiz" size={16} color="#6B8E23" />
                            <Text className="text-xs font-bold text-text-main dark:text-white">Quick Quiz</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleChip("Create a study quest for Cyber Security based on my syllabus")} className="px-4 py-2 bg-primary/10 border border-primary/30 rounded-full flex-row items-center gap-2">
                            <MaterialIcons name="add-circle" size={16} color="#6B8E23" />
                            <Text className="text-xs font-bold text-primary">Create Quest</Text>
                        </TouchableOpacity>
                    </ScrollView>

                    {/* Text Input */}
                    <View className="flex-row items-center gap-2">
                        <View className="flex-1 relative justify-center">
                            <TextInput
                                className="w-full bg-surface dark:bg-surface-dark border border-primary/20 rounded-xl pl-4 pr-10 py-3.5 text-sm text-text-main dark:text-white"
                                placeholder="Ask the Oracle anything..."
                                placeholderTextColor="#95A5A6"
                                value={inputText}
                                onChangeText={setInputText}
                                onSubmitEditing={handleSend}
                                returnKeyType="send"
                                editable={!isLoading}
                            />
                            <TouchableOpacity className="absolute right-3">
                                <MaterialIcons name="attach-file" size={20} color="#95A5A6" />
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity
                            onPress={handleSend}
                            disabled={isLoading || !inputText.trim()}
                            className={`p-3.5 rounded-xl items-center justify-center shadow-sm ${isLoading || !inputText.trim() ? 'bg-primary/50' : 'bg-primary'}`}
                        >
                            <MaterialIcons name="send" size={20} color="white" />
                        </TouchableOpacity>
                    </View>

                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
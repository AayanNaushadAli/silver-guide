import React, { useState } from 'react';
import { View, Text, SafeAreaView, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';
import { MentorService } from '../services/mentorService';

export default function UploadScreen({ navigation }: any) {
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';

    const [syllabusText, setSyllabusText] = useState('');
    const [pyqText, setPyqText] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<string | null>(null);

    const handleAnalyze = async () => {
        if (!pyqText.trim()) {
            Alert.alert('Missing Data', 'Please paste the PYQs to analyze.');
            return;
        }

        setIsAnalyzing(true);
        setAnalysisResult(null);

        try {
            const mentorService = new MentorService();
            const result = await mentorService.analyzePYQs(syllabusText, pyqText);
            setAnalysisResult(result);
        } catch (error: any) {
            console.error('Failed to analyze PYQs:', error);
            Alert.alert('Analysis Failed', 'The Oracle encountered an error while processing the documents.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
            {/* Header */}
            <View className="flex-row items-center px-6 pt-6 pb-4 border-b border-primary/10">
                <View className="flex-1">
                    <Text className="text-xl font-bold text-text-main dark:text-white">Upload & Analyze</Text>
                    <Text className="text-xs text-text-muted font-mono">Feed data to the Oracle</Text>
                </View>
                <View className="bg-primary/10 h-10 w-10 rounded-full items-center justify-center">
                    <MaterialIcons name="cloud-upload" size={24} color="#6B8E23" />
                </View>
            </View>

            <ScrollView className="flex-1 px-6 pt-4" contentContainerStyle={{ paddingBottom: 40 }}>

                {/* Intro Card */}
                {!analysisResult && (
                    <View className="bg-primary/5 border border-primary/20 rounded-2xl p-5 mb-6 shadow-sm">
                        <View className="flex-row items-center gap-3 mb-2">
                            <MaterialIcons name="insights" size={24} color="#6B8E23" />
                            <Text className="text-base font-bold text-primary">PYQ Pattern Analyzer</Text>
                        </View>
                        <Text className="text-xs text-text-muted leading-relaxed">
                            Paste your syllabus and previous year questions. The Oracle will analyze repeating patterns, weightage, and output a prioritized study roadmap.
                        </Text>
                    </View>
                )}

                {/* Input Form */}
                {!analysisResult && (
                    <View className="animate-fade-in">
                        <Text className="text-sm font-bold text-text-main dark:text-white mb-2 ml-1">Syllabus (Optional but recommended)</Text>
                        <TextInput
                            value={syllabusText}
                            onChangeText={setSyllabusText}
                            placeholder="Paste the course syllabus here..."
                            placeholderTextColor="#95A5A6"
                            multiline
                            textAlignVertical="top"
                            className="bg-surface dark:bg-surface-dark text-text-main dark:text-white p-4 rounded-xl border border-primary/10 mb-6 h-32 font-mono text-xs"
                        />

                        <Text className="text-sm font-bold text-text-main dark:text-white mb-2 ml-1">Previous Year Questions (PYQs) *</Text>
                        <TextInput
                            value={pyqText}
                            onChangeText={setPyqText}
                            placeholder="Paste the exams or questions here..."
                            placeholderTextColor="#95A5A6"
                            multiline
                            textAlignVertical="top"
                            className="bg-surface dark:bg-surface-dark text-text-main dark:text-white p-4 rounded-xl border border-primary/10 mb-8 h-48 font-mono text-xs"
                        />

                        <TouchableOpacity
                            onPress={handleAnalyze}
                            disabled={isAnalyzing}
                            className={`w-full py-4 rounded-xl items-center flex-row justify-center gap-2 shadow-lg shadow-primary/20 ${isAnalyzing ? 'bg-primary/50' : 'bg-primary'}`}
                        >
                            {isAnalyzing ? (
                                <ActivityIndicator size="small" color="#ffffff" />
                            ) : (
                                <MaterialIcons name="auto-awesome" size={20} color="white" />
                            )}
                            <Text className="text-white font-bold text-lg tracking-wide">
                                {isAnalyzing ? 'Analyzing Patterns...' : 'Analyze Data'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Loading State */}
                {isAnalyzing && (
                    <View className="items-center py-10 mt-10">
                        <MaterialIcons name="radar" size={48} color="#6B8E23" className="mb-4 opacity-50" />
                        <Text className="text-primary font-bold mb-2">The Oracle is consulting the archives...</Text>
                        <Text className="text-xs text-text-muted font-mono text-center px-10">
                            Extracting repeated topics, calculating chapter weightage, and finding hidden examiner intents.
                        </Text>
                    </View>
                )}

                {/* Analysis Result */}
                {analysisResult && !isAnalyzing && (
                    <View className="animate-fade-in">
                        <View className="flex-row items-center justify-between mb-4">
                            <Text className="text-lg font-bold text-text-main dark:text-white">Analysis Report</Text>
                            <TouchableOpacity onPress={() => setAnalysisResult(null)} className="bg-surface dark:bg-surface-dark px-3 py-1.5 rounded-full border border-primary/20">
                                <Text className="text-xs text-primary font-bold">New Scan</Text>
                            </TouchableOpacity>
                        </View>

                        <View className="bg-surface dark:bg-surface-dark rounded-2xl p-5 border border-primary/20 mb-6">
                            <Text className="text-text-main dark:text-white text-sm leading-relaxed">
                                {analysisResult}
                            </Text>
                        </View>

                        <TouchableOpacity
                            onPress={() => navigation.navigate('Dashboard')}
                            className="w-full py-4 rounded-xl items-center flex-row justify-center gap-2 bg-text-main dark:bg-white shadow-xl shadow-black/20"
                        >
                            <MaterialIcons name="home" size={20} color={isDark ? "#1c2111" : "#FDFCF5"} />
                            <Text className="text-background-light dark:text-background-dark font-bold text-base tracking-wide">
                                Return to Dojo
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

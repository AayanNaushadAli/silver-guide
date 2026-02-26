import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Svg, { Polygon, Line, Text as SvgText } from 'react-native-svg';
import { useUser } from '@clerk/clerk-expo';
import { useColorScheme } from 'nativewind';
import FloatingMenu from '../components/FloatingMenu';

export default function ProfileScreen({ navigation }: any) {
    const { user } = useUser();
    const { colorScheme } = useColorScheme();
    const isDarkMode = colorScheme === 'dark';

    // Radar Chart Colors
    const radarGridColor = isDarkMode ? '#2a3020' : '#E2E8F0';
    const radarDataFill = isDarkMode ? 'rgba(107, 142, 35, 0.2)' : 'rgba(107, 142, 35, 0.15)';
    const radarDataStroke = '#6B8E23';
    const radarTextColor = isDarkMode ? '#95A5A6' : '#2C3E50';

    // Navigation Icons Unfocused Color
    const navIconColor = isDarkMode ? '#95A5A6' : '#64748b';


    // Mock Badges Data for the grid
    const badges = [
        { id: 1, name: 'Derivative Master', icon: 'functions', color: 'text-blue-500', bg: 'bg-white dark:bg-background-dark', unlocked: true },
        { id: 2, name: 'Thermo Survivor', icon: 'local-fire-department', color: 'text-orange-500', bg: 'bg-white dark:bg-background-dark', unlocked: true },
        { id: 3, name: 'Early Bird', icon: 'alarm-on', color: 'text-yellow-500', bg: 'bg-white dark:bg-background-dark', unlocked: true },
        { id: 4, name: 'Deep Focus', icon: 'psychology', color: 'text-purple-500', bg: 'bg-white dark:bg-background-dark', unlocked: true },
        { id: 5, name: "Dean's List", icon: 'school', color: 'text-gray-400', bg: 'bg-surface dark:bg-surface-dark', unlocked: false },
        { id: 6, name: 'High Voltage', icon: 'bolt', color: 'text-gray-400', bg: 'bg-surface dark:bg-surface-dark', unlocked: false },
    ];

    return (
        <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
            {/* --- Sticky Header --- */}
            <View className="px-6 pt-4 pb-2 flex-row items-center justify-between border-b border-primary/10">
                <Text className="text-xl font-bold text-text-main dark:text-white font-display">Skill Tree</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Settings')} className="p-2">
                    <MaterialIcons name="settings" size={24} color={navIconColor} />
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

                {/* --- Profile Section --- */}
                <View className="items-center mb-6">
                    <View className="relative mb-3">
                        <Image
                            source={{ uri: user?.imageUrl || 'https://via.placeholder.com/150' }}
                            className="w-24 h-24 rounded-full border-4 border-surface dark:border-background-dark"
                        />
                        <View className="absolute -bottom-2 -right-2 bg-primary px-2 py-1 rounded-full border-2 border-surface dark:border-background-dark">
                            <Text className="text-white text-[10px] font-bold font-mono">LVL 12</Text>
                        </View>
                    </View>

                    <Text className="text-2xl font-bold text-text-main dark:text-white font-display">{user?.firstName || 'Seeker'} the Novice</Text>
                    <Text className="text-text-muted text-xs mb-4 font-body">Software Engineering • Semester 4</Text>

                    {/* XP Bar */}
                    <View className="w-full max-w-[200px]">
                        <View className="flex-row justify-between mb-1">
                            <Text className="text-[10px] text-primary font-bold font-mono">1,250 XP</Text>
                            <Text className="text-[10px] text-text-muted font-mono">2,000 XP</Text>
                        </View>
                        <View className="h-2 w-full bg-surface dark:bg-surface-dark rounded-full overflow-hidden border border-primary/5">
                            <View className="h-full bg-gold w-[62%] rounded-full" />
                        </View>
                    </View>
                </View>

                {/* --- Radar Chart Section --- */}
                <View className="items-center mb-6">
                    <Text className="text-xs font-bold text-text-muted uppercase tracking-widest mb-4 font-mono">Current Attributes</Text>
                    <View className="w-60 h-60 items-center justify-center">
                        <Svg height="100%" width="100%" viewBox="0 0 100 100">
                            {/* Background Grid */}
                            <Polygon points="50,10 90,80 10,80" fill="none" stroke={radarGridColor} strokeWidth="0.5" />
                            <Polygon points="50,30 70,65 30,65" fill="none" stroke={radarGridColor} strokeWidth="0.5" />
                            <Line x1="50" y1="50" x2="50" y2="10" stroke={radarGridColor} strokeWidth="0.5" />
                            <Line x1="50" y1="50" x2="90" y2="80" stroke={radarGridColor} strokeWidth="0.5" />
                            <Line x1="50" y1="50" x2="10" y2="80" stroke={radarGridColor} strokeWidth="0.5" />

                            {/* The Data Shape */}
                            <Polygon points="50,15 80,75 25,65" fill={radarDataFill} stroke={radarDataStroke} strokeWidth="2" />

                            {/* Labels */}
                            <SvgText x="50" y="8" fontSize="6" fill={radarTextColor} fontWeight="bold" textAnchor="middle">FOCUS</SvgText>
                            <SvgText x="98" y="85" fontSize="6" fill={radarTextColor} fontWeight="bold" textAnchor="end">WISDOM</SvgText>
                            <SvgText x="2" y="85" fontSize="6" fill={radarTextColor} fontWeight="bold" textAnchor="start">MANA</SvgText>
                        </Svg>
                    </View>
                </View>

                {/* --- Stats Row --- */}
                <View className="bg-surface dark:bg-surface-dark border border-primary/5 rounded-2xl p-4 flex-row justify-between mb-8 shadow-sm">
                    <View className="items-center flex-1 border-r border-primary/10">
                        <Text className="text-2xl font-bold text-text-main dark:text-white font-mono">124<Text className="text-sm font-normal text-text-muted">h</Text></Text>
                        <Text className="text-[10px] text-text-muted uppercase font-bold mt-1 tracking-wider font-mono">Total Focus</Text>
                    </View>
                    <View className="items-center flex-1 border-r border-primary/10">
                        <Text className="text-2xl font-bold text-text-main dark:text-white font-mono">42</Text>
                        <Text className="text-[10px] text-text-muted uppercase font-bold mt-1 tracking-wider font-mono">Quests</Text>
                    </View>
                    <View className="items-center flex-1">
                        <Text className="text-2xl font-bold text-accent font-mono">14<Text className="text-base">🔥</Text></Text>
                        <Text className="text-[10px] text-text-muted uppercase font-bold mt-1 tracking-wider font-mono">Streak</Text>
                    </View>
                </View>

                {/* --- Badges Grid --- */}
                <View className="flex-row justify-between items-center mb-4">
                    <Text className="text-lg font-bold text-text-main dark:text-white font-display">Badges</Text>
                    <View className="bg-surface dark:bg-surface-dark border border-primary/10 px-3 py-1 rounded-full">
                        <Text className="text-[10px] font-bold text-text-muted font-mono">5 / 24 Unlocked</Text>
                    </View>
                </View>

                <View className="flex-row flex-wrap justify-between">
                    {badges.map((badge) => (
                        <View key={badge.id} className={`w-[30%] items-center mb-6 ${!badge.unlocked && 'opacity-40 grayscale'}`}>
                            <View className={`w-20 h-20 rounded-2xl ${badge.bg} items-center justify-center mb-2 shadow-sm border border-primary/10`}>
                                <MaterialIcons name={badge.icon as any} size={36} className={badge.color} color={badge.unlocked ? undefined : navIconColor} />
                            </View>
                            <Text className="text-[10px] font-bold text-center text-text-main dark:text-white mt-1 font-body leading-tight">{badge.name}</Text>
                        </View>
                    ))}
                </View>

            </ScrollView>
            <FloatingMenu />
        </SafeAreaView>
    );
}
import React, { useRef, useState } from 'react';
import { View, TouchableOpacity, Animated, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function FloatingMenu() {
    const [isOpen, setIsOpen] = useState(false);
    const animation = useRef(new Animated.Value(0)).current;
    const navigation = useNavigation<any>();

    const toggleMenu = () => {
        const toValue = isOpen ? 0 : 1;
        Animated.spring(animation, {
            toValue,
            friction: 5,
            useNativeDriver: true,
        }).start();
        setIsOpen(!isOpen);
    };

    // Math to push the Leaderboard button up
    const leaderboardStyle: any = {
        transform: [
            { scale: animation },
            { translateY: animation.interpolate({ inputRange: [0, 1], outputRange: [0, -60] }) }
        ],
        opacity: animation,
    };

    // Math to push the Focus button even higher up
    const focusStyle: any = {
        transform: [
            { scale: animation },
            { translateY: animation.interpolate({ inputRange: [0, 1], outputRange: [0, -120] }) }
        ],
        opacity: animation,
    };

    // Spin the main button to turn it into an 'X'
    const rotation: any = {
        transform: [
            {
                rotate: animation.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "45deg"] })
            }
        ]
    };

    return (
        <View className="absolute bottom-6 right-6 items-center">

            {/* 🥈 Leaderboard Button (Popping out) */}
            <Animated.View style={[leaderboardStyle, { position: 'absolute' }]}>
                <TouchableOpacity
                    onPress={() => { toggleMenu(); console.log("Navigate to Leaderboard"); }}
                    className="w-12 h-12 bg-white rounded-full items-center justify-center shadow-lg border border-[#6B8E23]/10 flex-row"
                >
                    <MaterialIcons name="leaderboard" size={20} color="#E67E22" />
                </TouchableOpacity>
            </Animated.View>

            {/* ⏱️ Focus Timer Button (Popping out higher) */}
            <Animated.View style={[focusStyle, { position: 'absolute' }]}>
                <TouchableOpacity
                    onPress={() => { toggleMenu(); console.log("Navigate to Focus"); }}
                    className="w-12 h-12 bg-white rounded-full items-center justify-center shadow-lg border border-[#6B8E23]/10"
                >
                    <MaterialIcons name="timer" size={20} color="#3b82f6" />
                </TouchableOpacity>
            </Animated.View>

            {/* 🌟 Main Trigger Button */}
            <TouchableOpacity onPress={toggleMenu} activeOpacity={0.8}>
                <Animated.View style={[rotation]} className="w-14 h-14 bg-[#2C3E50] rounded-full items-center justify-center shadow-lg">
                    <MaterialIcons name="add" size={32} color="white" />
                </Animated.View>
            </TouchableOpacity>

        </View>
    );
}
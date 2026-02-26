import React, { useRef, useState, useEffect } from 'react';
import { View, TouchableOpacity, Animated, Text, Platform, Easing } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useColorScheme } from 'nativewind';

export default function FloatingMenu() {
    const [isOpen, setIsOpen] = useState(false);
    const animation = useRef(new Animated.Value(0)).current;
    const pulse = useRef(new Animated.Value(0)).current;
    const navigation = useNavigation<any>();
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';

    useEffect(() => {
        const pulseAnimation = Animated.loop(
            Animated.sequence([
                Animated.timing(pulse, {
                    toValue: 1,
                    duration: 2000,
                    easing: Easing.out(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(pulse, {
                    toValue: 0,
                    duration: 0,
                    useNativeDriver: true,
                }),
            ])
        );
        pulseAnimation.start();
        return () => pulseAnimation.stop();
    }, []);

    const toggleMenu = () => {
        const toValue = isOpen ? 0 : 1;
        Animated.spring(animation, {
            toValue,
            friction: 5,
            useNativeDriver: true,
        }).start();
        setIsOpen(!isOpen);
    };

    // Math for the aura rings
    const auraStyle = {
        transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.8] }) }],
        opacity: pulse.interpolate({ inputRange: [0, 0.8, 1], outputRange: [0.5, 0.1, 0] }),
    };

    const auraStyle2 = {
        transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.4] }) }],
        opacity: pulse.interpolate({ inputRange: [0, 0.8, 1], outputRange: [0.3, 0.1, 0] }),
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
        <View
            className="absolute bottom-3 right-6 items-center rounded-full shadow-lg border-4"
            style={{ borderColor: isDark ? 'rgba(107, 142, 35, 0.4)' : 'rgba(107, 142, 35, 0.2)' }}
        >

            {/* 🥈 Leaderboard Button (Popping out) */}
            <Animated.View style={[leaderboardStyle, { position: 'absolute' }]}>
                <TouchableOpacity
                    onPress={() => { toggleMenu(); console.log("Navigate to Leaderboard"); }}
                    className="w-12 h-12 bg-white dark:bg-surface-dark rounded-full items-center justify-center shadow-lg border border-primary/20"
                >
                    <MaterialIcons name="leaderboard" size={20} color="#E67E22" />
                </TouchableOpacity>
            </Animated.View>

            {/* ⏱️ Focus Timer Button (Popping out higher) */}
            <Animated.View style={[focusStyle, { position: 'absolute' }]}>
                <TouchableOpacity
                    onPress={() => { toggleMenu(); console.log("Navigate to Focus"); }}
                    className="w-12 h-12 bg-white dark:bg-surface-dark rounded-full items-center justify-center shadow-lg border border-primary/20"
                >
                    <MaterialIcons name="timer" size={20} color="#3b82f6" />
                </TouchableOpacity>
            </Animated.View>

            {/* Aura Filler Rings */}
            {!isOpen && (
                <>
                    <Animated.View style={[auraStyle, { position: 'absolute' }]} className="w-14 h-14 bg-primary/40 rounded-full" />
                    <Animated.View style={[auraStyle2, { position: 'absolute' }]} className="w-14 h-14 bg-primary/20 rounded-full" />
                </>
            )}

            {/* 🌟 Main Trigger Button */}
            <TouchableOpacity onPress={toggleMenu} activeOpacity={0.8}>
                <Animated.View
                    style={[rotation]}
                    className="w-14 h-14 bg-primary rounded-full items-center justify-center shadow-xl border-4 border-white/20"
                >
                    <MaterialIcons name="add" size={38} color="white" />
                </Animated.View>
            </TouchableOpacity>

        </View>
    );
}
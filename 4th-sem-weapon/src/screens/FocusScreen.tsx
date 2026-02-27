import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, useWindowDimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';
import { StatusBar } from 'expo-status-bar';
import Svg, { Circle, Path } from 'react-native-svg';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, { useAnimatedProps, useSharedValue, runOnJS } from 'react-native-reanimated';

// Animated SVG components
const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const MAX_MINUTES = 120; // 2 hours max

export default function FocusScreen({ navigation }: any) {
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';
    const { width: windowWidth } = useWindowDimensions();

    const SLIDER_SIZE = Math.min(windowWidth * 0.85, 400); // Capped at 400px for PC
    const RADIUS = SLIDER_SIZE * 0.42;
    const STROKE_WIDTH = 24;
    const CENTER = SLIDER_SIZE / 2;

    // Theme Colors
    const primaryColor = isDark ? '#bbf7d0' : '#6B8E23';
    const trackColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(107, 142, 35, 0.1)';
    const knobColor = isDark ? '#ffffff' : '#2C3E50';

    // Timer State
    const [presetMinutes, setPresetMinutes] = useState(25);
    const [secondsLeft, setSecondsLeft] = useState(25 * 60);
    const [isActive, setIsActive] = useState(false);

    // Initial angle based on default 25 minutes
    const initialAngle = (25 / MAX_MINUTES) * 2 * Math.PI;
    const angle = useSharedValue(initialAngle);

    // The Engine that runs the countdown
    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;

        if (isActive && secondsLeft > 0) {
            interval = setInterval(() => {
                setSecondsLeft(seconds => seconds - 1);
            }, 1000);
        } else if (secondsLeft === 0 && isActive) {
            setIsActive(false);
            console.log("🟢 POMODORO COMPLETE! Granting XP...");
            // TODO: Trigger victory sound and grant Supabase XP here!
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isActive, secondsLeft]);

    // Format the time into MM:SS
    const minutes = Math.floor(secondsLeft / 60);
    const seconds = secondsLeft % 60;
    const displayTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    // Controls
    const toggleTimer = () => setIsActive(!isActive);
    const resetTimer = () => {
        setIsActive(false);
        setSecondsLeft(presetMinutes * 60);
    };

    // --- Circular Slider Logic ---
    const updatePreset = (newAngle: number) => {
        // Map angle (0 to 2PI) to minutes (0 to MAX_MINUTES)
        // Adjust angle so 0 is at the top (12 o'clock)
        let normalizedAngle = newAngle;
        if (normalizedAngle < 0) normalizedAngle += 2 * Math.PI;

        let calculatedMinutes = Math.round((normalizedAngle / (2 * Math.PI)) * MAX_MINUTES);
        // Minimum 1 minute
        if (calculatedMinutes < 1) calculatedMinutes = 1;
        if (calculatedMinutes > MAX_MINUTES) calculatedMinutes = MAX_MINUTES;

        setPresetMinutes(calculatedMinutes);
        setSecondsLeft(calculatedMinutes * 60);
    };

    const panGesture = Gesture.Pan()
        .onUpdate((event) => {
            // Calculate angle relative to center using relative coordinates
            const x = event.x - CENTER;
            const y = event.y - CENTER;

            // Math.atan2 returns angle from -PI to PI. We want 0 at the top, going clockwise.
            let a = Math.atan2(y, x) + Math.PI / 2;
            if (a < 0) a += 2 * Math.PI;

            angle.value = a;
            runOnJS(updatePreset)(a);
        });

    const animatedProps = useAnimatedProps(() => {
        // Calculate the SVG path for the progress arc
        const largeArcFlag = angle.value > Math.PI ? 1 : 0;

        // Calculate end coordinates based on angle (0 is top)
        const endX = CENTER + RADIUS * Math.sin(angle.value);
        const endY = CENTER - RADIUS * Math.cos(angle.value);

        // Path: Move to top center, draw arc to end coordinates
        const d = `M ${CENTER} ${CENTER - RADIUS} A ${RADIUS} ${RADIUS} 0 ${largeArcFlag} 1 ${endX} ${endY}`;

        return { d };
    });

    const animatedKnobProps = useAnimatedProps(() => {
        const cx = CENTER + RADIUS * Math.sin(angle.value);
        const cy = CENTER - RADIUS * Math.cos(angle.value);
        return { cx, cy };
    });

    return (
        <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
            <StatusBar style={isDark ? "light" : "dark"} />

            {/* --- Minimal Header --- */}
            <View className="flex-row items-center justify-between px-6 py-4">
                <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 bg-surface dark:bg-surface-dark rounded-full items-center justify-center shadow-sm border border-primary/10">
                    <MaterialIcons name="close" size={24} color={isDark ? "#fff" : "#2C3E50"} />
                </TouchableOpacity>
                <View className="flex-row items-center gap-2 bg-surface dark:bg-surface-dark px-4 py-2 rounded-full border border-primary/20">
                    <MaterialIcons name="local-fire-department" size={16} color={isDark ? "#fbd38d" : "#E67E22"} />
                    <Text className="text-text-main dark:text-white font-bold text-xs uppercase tracking-wider">Thermodynamics II</Text>
                </View>
            </View>

            {/* --- Main Timer Interface --- */}
            <View className="flex-1 items-center justify-center">

                {/* The Circular Slider */}
                <View className="relative items-center justify-center" style={{ width: SLIDER_SIZE, height: SLIDER_SIZE }}>

                    {/* The Interactive Ring */}
                    <GestureDetector gesture={isActive ? Gesture.Native() : panGesture}>
                        <Animated.View style={{ position: 'absolute', width: SLIDER_SIZE, height: SLIDER_SIZE }}>
                            <Svg width={SLIDER_SIZE} height={SLIDER_SIZE}>
                                {/* Background Track */}
                                <Circle
                                    cx={CENTER}
                                    cy={CENTER}
                                    r={RADIUS}
                                    stroke={trackColor}
                                    strokeWidth={STROKE_WIDTH}
                                    fill="none"
                                />

                                {/* Progress Arc */}
                                <AnimatedPath
                                    animatedProps={animatedProps}
                                    stroke={primaryColor}
                                    strokeWidth={STROKE_WIDTH}
                                    strokeLinecap="round"
                                    fill="none"
                                />

                                {/* Draggable Knob */}
                                {!isActive && (
                                    <AnimatedCircle
                                        animatedProps={animatedKnobProps}
                                        r={16}
                                        fill={knobColor}
                                    />
                                )}
                            </Svg>
                        </Animated.View>
                    </GestureDetector>

                    {/* The Clock Text (Inside the Ring) */}
                    <View className="absolute items-center justify-center pointer-events-none">
                        <Text
                            className="font-bold text-text-main dark:text-white tracking-tighter tabular-nums"
                            style={{ fontSize: isActive ? 80 : 64, marginTop: isActive ? 0 : 20 }}
                        >
                            {displayTime}
                        </Text>
                        {!isActive && (
                            <Text className="text-primary font-bold tracking-widest uppercase mt-2 text-xs">
                                Drag to Set Time
                            </Text>
                        )}
                    </View>

                </View>


                <Text className="text-text-muted font-bold tracking-[0.3em] uppercase mt-12 mb-8">
                    {isActive ? "Deep Work Engaged" : "Ready to Focus"}
                </Text>

                {/* Control Buttons */}
                <View className="flex-row items-center gap-8">
                    {/* Reset Button (Only visible if paused and time has passed) */}
                    <TouchableOpacity
                        onPress={resetTimer}
                        className={`w-14 h-14 rounded-full items-center justify-center border-2 border-text-muted/20 ${(!isActive && secondsLeft < presetMinutes * 60) ? 'opacity-100' : 'opacity-0'}`}
                        disabled={isActive || secondsLeft === presetMinutes * 60}
                    >
                        <MaterialIcons name="replay" size={24} color="#95A5A6" />
                    </TouchableOpacity>

                    {/* Main Play/Pause Button */}
                    <TouchableOpacity
                        onPress={toggleTimer}
                        className={`w-24 h-24 rounded-full items-center justify-center shadow-lg border-4 ${isActive ? 'bg-surface dark:bg-surface-dark border-red-500' : 'bg-primary border-[#8FA954] dark:border-[#5a761e]'}`}
                    >
                        <MaterialIcons
                            name={isActive ? "pause" : "play-arrow"}
                            size={48}
                            color={isActive ? "#E53E3E" : "white"}
                            style={isActive ? {} : { marginLeft: 4 }} // visually center the play triangle
                        />
                    </TouchableOpacity>

                    {/* Skip/Forward Button */}
                    <TouchableOpacity
                        onPress={() => { if (isActive) setSecondsLeft(0); }}
                        className={`w-14 h-14 rounded-full items-center justify-center border-2 border-text-muted/20 ${isActive ? 'opacity-100' : 'opacity-50'}`}
                        disabled={!isActive}
                    >
                        <MaterialIcons name="skip-next" size={24} color="#95A5A6" />
                    </TouchableOpacity>
                </View>

            </View>

            {/* --- Footer Motivation --- */}
            <View className="pb-12 items-center">
                <Text className="text-text-muted text-xs font-medium italic opacity-60">
                    "Discipline is the bridge between goals and accomplishment."
                </Text>
            </View>

        </SafeAreaView>
    );
}
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { createClerkSupabaseClient } from '../database/supabaseClient';

export interface Task {
    title: string;
    xp: number;
    completed: boolean;
}

export interface Quest {
    id: string;
    title: string;
    icon: string;
    iconColor: string;
    deadline: string;
    deadlineBg: string;
    deadlineColor: string;
    deadlineIcon: string;
    progressColor: string;
    tasks: Task[];
}

interface QuestContextType {
    quests: Quest[];
    addQuest: (quest: Quest) => void;
    toggleTask: (questId: string, taskIndex: number) => void;
    getProgress: (quest: Quest) => number;
    totalXP: number;
    isLoading: boolean;
}

const QuestContext = createContext<QuestContextType | undefined>(undefined);

const DEFAULT_QUESTS: Quest[] = [
    {
        id: '1',
        title: 'Cyber Security',
        icon: 'security',
        iconColor: '#E53E3E',
        deadline: 'Exam: 5 Days',
        deadlineBg: 'bg-red-100 dark:bg-red-900/20 border-red-200 dark:border-red-900/40',
        deadlineColor: '#E53E3E',
        deadlineIcon: 'warning',
        progressColor: 'bg-red-500',
        tasks: [
            { title: 'Unit 1: Intro to Cybercrime', xp: 150, completed: true },
            { title: 'Unit 2: Mobile & Wireless Security', xp: 200, completed: false },
            { title: 'Unit 3: Tools & Methods', xp: 250, completed: false },
            { title: 'Unit 4: Computer Forensics', xp: 200, completed: false },
            { title: 'Unit 5: Policies & Cyber Laws', xp: 150, completed: false },
        ],
    },
    {
        id: '2',
        title: 'Operating Systems',
        icon: 'memory',
        iconColor: '#3b82f6',
        deadline: 'Safe',
        deadlineBg: 'bg-primary/10 border-primary/20',
        deadlineColor: '#6B8E23',
        deadlineIcon: 'event-upcoming',
        progressColor: 'bg-primary',
        tasks: [
            { title: 'Process Management', xp: 200, completed: false },
            { title: 'CPU Scheduling', xp: 250, completed: false },
            { title: 'Memory Management', xp: 300, completed: false },
        ],
    },
    {
        id: '3',
        title: 'Theory of Automata',
        icon: 'account-tree',
        iconColor: '#a855f7',
        deadline: 'Exam: 7 Days',
        deadlineBg: 'bg-orange-100 dark:bg-orange-900/20 border-orange-200 dark:border-orange-900/40',
        deadlineColor: '#E67E22',
        deadlineIcon: 'timer',
        progressColor: 'bg-orange-500',
        tasks: [
            { title: 'Finite Automata (DFA/NFA)', xp: 200, completed: false },
            { title: 'Regular Expressions', xp: 150, completed: false },
            { title: 'Context-Free Grammars', xp: 250, completed: false },
        ],
    },
];

export function QuestProvider({ children }: { children: ReactNode }) {
    const [quests, setQuests] = useState<Quest[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const { getToken } = useAuth();
    const { user } = useUser();

    // 1. Fetch data from Supabase on Load
    useEffect(() => {
        async function loadQuests() {
            if (!user) return;
            try {
                const token = await getToken({ template: 'supabase' });
                if (!token) return;
                const supabase = createClerkSupabaseClient(token);

                const { data, error } = await supabase
                    .from('quests')
                    .select('*')
                    .eq('clerk_user_id', user.id);

                if (error) throw error;

                if (data && data.length > 0) {
                    // Load existing quests from the cloud
                    setQuests(data);
                } else {
                    // First time login! Push DEFAULT_QUESTS to Supabase
                    setQuests(DEFAULT_QUESTS);
                    const defaultQuestsWithUser = DEFAULT_QUESTS.map(q => ({
                        ...q,
                        clerk_user_id: user.id
                    }));
                    await supabase.from('quests').insert(defaultQuestsWithUser);
                }
            } catch (err) {
                console.error("Error loading quests:", err);
            } finally {
                setIsLoading(false);
            }
        }
        loadQuests();
    }, [user]);

    // 2. Add Quest & Sync to Cloud
    const addQuest = async (quest: Quest) => {
        // Optimistic UI Update
        setQuests(prev => [...prev, quest]);

        // Background Sync
        if (!user) return;
        const token = await getToken({ template: 'supabase' });
        if (!token) return;
        const supabase = createClerkSupabaseClient(token);

        await supabase.from('quests').insert([{ ...quest, clerk_user_id: user.id }]);
    };

    // 3. Toggle Task & Sync to Cloud
    const toggleTask = async (questId: string, taskIndex: number) => {
        // Compute the updated quest BEFORE setting state (avoids async race)
        const currentQuest = quests.find(q => q.id === questId);
        if (!currentQuest) return;

        const updatedTasks = [...currentQuest.tasks];
        updatedTasks[taskIndex] = {
            ...updatedTasks[taskIndex],
            completed: !updatedTasks[taskIndex].completed,
        };
        const modifiedQuest = { ...currentQuest, tasks: updatedTasks };

        // Optimistic UI Update
        setQuests(prev => prev.map(q => q.id === questId ? modifiedQuest : q));

        // Background Sync to Supabase
        if (!user) return;
        try {
            const token = await getToken({ template: 'supabase' });
            if (!token) return;
            const supabase = createClerkSupabaseClient(token);

            await supabase
                .from('quests')
                .update({ tasks: modifiedQuest.tasks })
                .eq('id', questId)
                .eq('clerk_user_id', user.id);

        } catch (err) {
            console.error("Failed to sync task toggle:", err);
        }
    };

    const getProgress = (quest: Quest): number => {
        if (quest.tasks.length === 0) return 0;
        const completed = quest.tasks.filter(t => t.completed).length;
        return Math.round((completed / quest.tasks.length) * 100);
    };

    const totalXP = quests.reduce(
        (sum, q) => sum + q.tasks.filter(t => t.completed).reduce((s, t) => s + t.xp, 0),
        0
    );

    return (
        <QuestContext.Provider value={{ quests, addQuest, toggleTask, getProgress, totalXP, isLoading }}>
            {children}
        </QuestContext.Provider>
    );
}

export function useQuests() {
    const context = useContext(QuestContext);
    if (!context) throw new Error('useQuests must be used within a QuestProvider');
    return context;
}
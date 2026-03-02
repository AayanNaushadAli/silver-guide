// src/context/MentorContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { MentorService, MentorUpdate } from '../services/mentorService';
import { useQuests, Quest } from './QuestContext';
import { createClerkSupabaseClient } from '../database/supabaseClient';

interface MentorContextType {
    mentorState: MentorUpdate | null;
    isLoading: boolean;
    refreshBriefing: () => Promise<void>;
    reviewTaskCompletion: (questId: string, taskIndex: number) => Promise<string | null>;
}

const MentorContext = createContext<MentorContextType | undefined>(undefined);

export function MentorProvider({ children }: { children: ReactNode }) {
    const [mentorState, setMentorState] = useState<MentorUpdate | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const mentorService = new MentorService();

    const { user } = useUser();
    const { getToken } = useAuth();
    const { quests } = useQuests();

    // 1. Initial Briefing Load
    useEffect(() => {
        if (user && quests.length > 0 && !mentorState) {
            refreshBriefing();
        }
    }, [user, quests]);

    const refreshBriefing = async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            // Check for cached session in DB first
            const token = await getToken({ template: 'Supabase' });
            if (!token) return;
            const supabase = createClerkSupabaseClient(token);

            const { data: cached } = await supabase
                .from('mentor_sessions')
                .select('*')
                .eq('clerk_user_id', user.id)
                .eq('session_type', 'daily_briefing')
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            // If cached session is from today, use it to save API credits
            const today = new Date().toISOString().split('T')[0];
            if (cached && cached.created_at.startsWith(today)) {
                console.log('📦 MentorContext: Using cached daily briefing');
                setMentorState(cached.ai_response);
            } else {
                // Otherwise, generate new one
                const briefing = await mentorService.generateDailyBriefing(quests, { level: 1, total_xp: 0 });
                setMentorState(briefing);

                // Save to DB for caching
                await supabase.from('mentor_sessions').insert({
                    clerk_user_id: user.id,
                    session_type: 'daily_briefing',
                    ai_response: briefing
                });
            }
        } catch (e) {
            console.error('❌ MentorContext: Refresh failed:', e);
        } finally {
            setIsLoading(false);
        }
    };

    const reviewTaskCompletion = async (questId: string, taskIndex: number): Promise<string | null> => {
        const quest = quests.find(q => q.id === questId);
        if (!quest) return null;

        try {
            const praise = await mentorService.reviewTaskCompletion(quest, taskIndex);
            // After completion, we might want to refresh the briefing to get the next priority
            await refreshBriefing();
            return praise;
        } catch (e) {
            console.error('❌ MentorContext: Task review failed:', e);
            return null;
        }
    };

    return (
        <MentorContext.Provider value={{ mentorState, isLoading, refreshBriefing, reviewTaskCompletion }}>
            {children}
        </MentorContext.Provider>
    );
}

export function useMentor() {
    const context = useContext(MentorContext);
    if (!context) throw new Error('useMentor must be used within a MentorProvider');
    return context;
}

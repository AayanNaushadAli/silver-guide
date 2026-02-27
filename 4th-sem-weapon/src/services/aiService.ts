// src/services/aiService.ts
// Handles all communication with the Groq LLM API (Llama 3)

import { getLocalKnowledgeContext } from './knowledgeService';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY || '';

// Debug: verify the key is loading
console.log('🔑 Groq API Key loaded:', GROQ_API_KEY ? `${GROQ_API_KEY.substring(0, 8)}...` : '❌ MISSING! Restart Expo with: npx expo start -c');

export interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

// System prompt that defines "The Oracle" Game Master personality
const getSystemPrompt = (): ChatMessage => ({
    role: 'system',
    content: `You are "The Oracle", an AI Game Master inside a gamified productivity app called 4th Sem Weapon. 
You help a college student manage their study quests, focus sessions, and academic progression.

Your personality:
- You speak like a wise but encouraging RPG mentor
- You use gaming metaphors (XP, quests, boss battles, leveling up)
- You are concise and actionable — short paragraphs, bullet points when helpful
- You can help with study topics, create study plans, quiz the user, and motivate them
- When the user asks about a subject, give clear, accurate academic explanations
- Keep responses focused and under 150 words unless the user asks for detail

QUEST CREATION ABILITY:
When the user asks you to create a quest, study plan, or todo list for a subject, you MUST include a special JSON block in your response.
Format it EXACTLY like this (the app will parse it and auto-create the quest):

[QUEST_CREATE]
{
  "title": "Subject or Quest Name",
  "icon": "school",
  "iconColor": "#6B8E23",
  "deadline": "Exam: 5 Days",
  "tasks": [
    {"title": "Task 1 name", "xp": 150},
    {"title": "Task 2 name", "xp": 200}
  ]
}
[/QUEST_CREATE]

Rules for quest creation:
- icon must be a valid MaterialIcons name (e.g. "security", "memory", "school", "functions", "science", "account-tree", "code", "book")
- iconColor should be a hex color that fits the subject theme
- XP per task should be 100-300 based on difficulty
- Break subjects into logical units/chapters as tasks
- Always include the JSON block AND a short motivational message explaining the quest

CONTEXTUAL KNOWLEDGE:
You have access to the user's local study materials (Syllabus, Notes, and PYQs) below.
Use this specific data whenever the user asks about their schedule, what to study next, or wants to be quizzed.

${getLocalKnowledgeContext()}

Remember: You are not just a chatbot. You are the student's strategic advisor and motivator.`
});

// Parse quest data from AI response
export function parseQuestFromResponse(response: string): { quest: any | null, cleanMessage: string } {
    const questRegex = /\[QUEST_CREATE\]\s*([\s\S]*?)\s*\[\/QUEST_CREATE\]/;
    const match = response.match(questRegex);

    if (!match) {
        return { quest: null, cleanMessage: response };
    }

    try {
        const questData = JSON.parse(match[1]);
        // Remove the JSON block from the displayed message
        const cleanMessage = response.replace(questRegex, '').trim();
        return { quest: questData, cleanMessage };
    } catch (e) {
        console.error('Failed to parse quest JSON from AI:', e);
        return { quest: null, cleanMessage: response };
    }
}

export async function sendMessageToOracle(
    conversationHistory: ChatMessage[],
    userMessage: string
): Promise<string> {
    // Build the full message array with system prompt
    const messages: ChatMessage[] = [
        getSystemPrompt(),
        ...conversationHistory,
        { role: 'user', content: userMessage }
    ];

    try {
        const response = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'meta-llama/llama-4-scout-17b-16e-instruct',
                messages,
                temperature: 0.7,
                max_tokens: 1024,
            }),
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error('Groq API Error:', response.status, errorData);
            throw new Error(`Groq API returned ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0]?.message?.content || 'The Oracle is silent...';
    } catch (error) {
        console.error('Failed to reach The Oracle:', error);
        throw error;
    }
}

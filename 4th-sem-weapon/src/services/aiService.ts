// src/services/aiService.ts
// Handles all communication with the Groq LLM API (Llama 3)

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY || '';

// Debug: verify the key is loading
console.log('🔑 Groq API Key loaded:', GROQ_API_KEY ? `${GROQ_API_KEY.substring(0, 8)}...` : '❌ MISSING! Restart Expo with: npx expo start -c');

export interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

// System prompt that defines "The Oracle" Game Master personality
const SYSTEM_PROMPT: ChatMessage = {
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

Remember: You are not just a chatbot. You are the student's strategic advisor and motivator.`
};

export async function sendMessageToOracle(
    conversationHistory: ChatMessage[],
    userMessage: string
): Promise<string> {
    // Build the full message array with system prompt
    const messages: ChatMessage[] = [
        SYSTEM_PROMPT,
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

// src/services/aiService.ts
// Handles all communication with the Groq LLM API (Llama 3)

import { getLocalKnowledgeContext } from './knowledgeService';
import { GROQ_API_URL, GROQ_API_KEY, GROQ_MODEL } from './aiConfig';
import { createClerkSupabaseClient } from '../database/supabaseClient';

export interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

// System prompt that defines "The Oracle" Game Master personality
const getSystemPrompt = (activeQuestsContext: string = ""): ChatMessage => ({
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

[CRITICAL RULE: DO NOT GENERATE [QUEST_CREATE] UNLESS THE USER EXPLICITLY ASKS FOR A NEW STUDY PLAN OR QUEST]

[MARK_TASK_DONE] COMMAND:
When the user asks you to quiz them on a specific unit/task that exists in their active quests, you must test their knowledge.
If they answer correctly (or partially correctly), you MUST include a special JSON block in your response to award them XP and mark the task as done.
The JSON block must look exactly like this:
[MARK_TASK_DONE]
{
  "questId": "x",
  "taskIndex": 1,
  "xpEarned": 150
}
[/MARK_TASK_DONE]
Rules:
- Give partial XP if their answer is partially correct (e.g. 75 out of 150 max). Give 0 XP if completely wrong.
- Only output this block if they successfully answered a quiz question. DO NOT output it randomly.

CURRENT QUEST LOG STATE (for Quizzes or Deletion):
The user currently has these quests. Quizzable tasks are labeled with "requiresQuiz": true.
${activeQuestsContext ? activeQuestsContext : "No active quests at the moment."}

QUEST CREATION ABILITY:
When the user EXPLICITLY asks you to create a quest, study plan, or todo list for a subject, include this block:

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

ELITE PYQ MOCK EXAMS & BONUS XP:
When the user asks for a "PYQ Mock Exam", you must test their knowledge using the Previous Year Questions available in your CONTEXTUAL KNOWLEDGE below.
Ask them ONE hard question at a time. Do not ask all questions at once.
If they successfully answer the questions and demonstrate mastery, you have the power to award them a massive "Elite" XP bonus (e.g., 1000 XP) by outputting this exact block:
[GRANT_XP]
{
  "amount": 1000,
  "reason": "Passed the Cyber Security PYQ Mock Exam!"
}
[/GRANT_XP]

QUEST DELETION ABILITY:
If the user asks to "delete a quest", "remove a subject", or "clear the log", use these commands:
- [QUEST_DELETE] {"questId": "id_here"} [/QUEST_DELETE]
- [QUEST_CLEAR_ALL] {} [/QUEST_CLEAR_ALL]

CRITICAL: Notice the "source" field in the quest log state.
- Quests with source "syllabus" are high-priority core subjects. DO NOT delete them unless the user is EXPLICITLY asking to remove a core subject they no longer study.
- Quests with source "ai-chat" are temporary or extra study plans created during conversation. These are "safe" to delete if the user wants to clean up duplicates.
- If you see multiple quests with the same name, compare their IDs and help the user remove the duplicates by outputting multiple [QUEST_DELETE] blocks.

CONTEXTUAL KNOWLEDGE:
You have access to the user's local study materials (Syllabus, Notes, and PYQs) below.
Use this specific data whenever the user asks about their schedule, what to study next, or wants to be quizzed.

${getLocalKnowledgeContext()}

Remember: You are not just a chatbot. You are the student's strategic advisor and motivator.`
});

// Parse actions from AI response
export function parseActionsFromResponse(response: string): {
    quest: any | null,
    markedTasks: { questId: string, taskIndex: number, xpEarned: number }[],
    deletedQuestIds: string[],
    clearAll: boolean,
    grantedBonusXp: { amount: number, reason: string }[],
    cleanMessage: string
} {
    let cleanMessage = response;
    let quest = null;
    let markedTasks: any[] = [];
    let deletedQuestIds: string[] = [];
    let clearAll = false;
    let grantedBonusXp: any[] = [];

    // 1. Extract [QUEST_CREATE]
    const questRegex = /\[QUEST_CREATE\]\s*([\s\S]*?)\s*\[\/QUEST_CREATE\]/g;
    let questMatch;
    while ((questMatch = questRegex.exec(response)) !== null) {
        try {
            let jsonStr = questMatch[1].replace(/```json\s*/g, '').replace(/```\s*/g, '').replace(/\*\*/g, '').trim();
            quest = JSON.parse(jsonStr);
            cleanMessage = cleanMessage.replace(questMatch[0], '');
        } catch (e) {
            console.error('Failed to parse QUEST JSON from AI:', e);
        }
    }

    // 2. Extract [MARK_TASK_DONE]
    const taskRegex = /\[MARK_TASK_DONE\]\s*([\s\S]*?)\s*\[\/MARK_TASK_DONE\]/g;
    let taskMatch;
    while ((taskMatch = taskRegex.exec(response)) !== null) {
        try {
            let jsonStr = taskMatch[1].replace(/```json\s*/g, '').replace(/```\s*/g, '').replace(/\*\*/g, '').trim();
            const taskObj = JSON.parse(jsonStr);
            if (taskObj.questId && typeof taskObj.taskIndex === 'number') {
                markedTasks.push({
                    questId: taskObj.questId,
                    taskIndex: taskObj.taskIndex,
                    xpEarned: typeof taskObj.xpEarned === 'number' ? taskObj.xpEarned : 150
                });
            }
            cleanMessage = cleanMessage.replace(taskMatch[0], '');
        } catch (e) {
            console.error('Failed to parse MARK_TASK JSON from AI:', e);
        }
    }

    // 3. Extract [QUEST_DELETE]
    const deleteRegex = /\[QUEST_DELETE\]\s*([\s\S]*?)\s*\[\/QUEST_DELETE\]/g;
    let deleteMatch;
    while ((deleteMatch = deleteRegex.exec(response)) !== null) {
        try {
            let jsonStr = deleteMatch[1].replace(/```json\s*/g, '').replace(/```\s*/g, '').replace(/\*\*/g, '').trim();
            const delObj = JSON.parse(jsonStr);
            if (delObj.questId) deletedQuestIds.push(delObj.questId);
            cleanMessage = cleanMessage.replace(deleteMatch[0], '');
        } catch (e) {
            console.error('Failed to parse DELETE_QUEST JSON from AI:', e);
        }
    }

    // 4. Extract [QUEST_CLEAR_ALL]
    if (response.includes('[QUEST_CLEAR_ALL]')) {
        clearAll = true;
        cleanMessage = cleanMessage.replace(/\[QUEST_CLEAR_ALL\][\s\S]*?\[\/QUEST_CLEAR_ALL\]/g, '');
    }

    // 5. Extract [GRANT_XP]
    const grantXpRegex = /\[GRANT_XP\]\s*([\s\S]*?)\s*\[\/GRANT_XP\]/g;
    let grantMatch;
    while ((grantMatch = grantXpRegex.exec(response)) !== null) {
        try {
            let jsonStr = grantMatch[1].replace(/```json\s*/g, '').replace(/```\s*/g, '').replace(/\*\*/g, '').trim();
            const xpObj = JSON.parse(jsonStr);
            if (xpObj.amount) {
                grantedBonusXp.push({
                    amount: xpObj.amount,
                    reason: xpObj.reason || "Elite Bonus"
                });
            }
            cleanMessage = cleanMessage.replace(grantMatch[0], '');
        } catch (e) {
            console.error('Failed to parse GRANT_XP JSON from AI:', e);
        }
    }

    return { quest, markedTasks, deletedQuestIds, clearAll, grantedBonusXp, cleanMessage: cleanMessage.trim() };
}

export async function sendMessageToOracle(
    conversationHistory: ChatMessage[],
    userMessage: string,
    activeQuestsContext: string = ""
): Promise<string> {
    // Build the full message array with system prompt
    const messages: ChatMessage[] = [
        getSystemPrompt(activeQuestsContext),
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
                model: GROQ_MODEL,
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

/**
 * Fetches chat history for the user from Supabase.
 */
export async function fetchChatHistory(clerkToken: string): Promise<ChatMessage[]> {
    const supabase = createClerkSupabaseClient(clerkToken);

    const { data, error } = await supabase
        .from('chat_messages')
        .select('role, content')
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Error fetching chat history:', error);
        return [];
    }

    // Explicitly cast roles to ensure compatibility
    return (data || []).map(msg => ({
        role: msg.role as 'system' | 'user' | 'assistant',
        content: msg.content
    }));
}

/**
 * Saves a new chat message to Supabase.
 */
export async function saveChatMessage(clerkToken: string, userId: string, role: string, content: string) {
    const supabase = createClerkSupabaseClient(clerkToken);

    const { error } = await supabase
        .from('chat_messages')
        .insert([{
            clerk_user_id: userId,
            role,
            content,
        }]);

    if (error) {
        console.error('Error saving chat message:', error);
    }
}

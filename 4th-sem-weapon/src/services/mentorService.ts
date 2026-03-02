// src/services/mentorService.ts
import { getLocalKnowledgeContext } from './knowledgeService';
import { createClerkSupabaseClient } from '../database/supabaseClient';
import { Quest, Task } from '../context/QuestContext';
import { SubjectData } from './knowledgeService';
import { GROQ_API_URL, GROQ_API_KEY, GROQ_MODEL } from './aiConfig';

export interface DailyInsight {
    title: string;
    message: string;
}

export interface MentorUpdate {
    dailyMission: Quest | null;
    todaysPlan: Task[];
    insight: DailyInsight;
    mentorMessage: string;
}

// Icon/color palettes for AI-generated quests
const QUEST_STYLES = [
    { icon: 'security', iconColor: '#E53E3E', progressColor: 'bg-red-500', deadlineColor: '#E53E3E' },
    { icon: 'memory', iconColor: '#3b82f6', progressColor: 'bg-blue-500', deadlineColor: '#3b82f6' },
    { icon: 'account-tree', iconColor: '#a855f7', progressColor: 'bg-purple-500', deadlineColor: '#a855f7' },
    { icon: 'code', iconColor: '#f59e0b', progressColor: 'bg-amber-500', deadlineColor: '#f59e0b' },
    { icon: 'science', iconColor: '#10b981', progressColor: 'bg-emerald-500', deadlineColor: '#10b981' },
    { icon: 'psychology', iconColor: '#ec4899', progressColor: 'bg-pink-500', deadlineColor: '#ec4899' },
];

/**
 * The MentorService is the proactive brain of the app.
 * Unlike aiService which is reactive (chatbot), this drives the actual state.
 */
export class MentorService {
    /**
     * Generates a full set of quests from syllabus data.
     * Called during onboarding after the user selects their subjects.
     */
    async generateQuestsFromSyllabus(
        syllabusContext: string,
        subjects: SubjectData[],
        focusMode: string,
        targetCGPA: number
    ): Promise<Quest[]> {
        console.log('🤖 AI Mentor: Generating quests from syllabus...');

        const prompt = `You are "The Oracle", an AI academic mentor.
Given the syllabus below, generate a quest (subject) for each subject. Each quest has tasks (one per unit).
Focus mode: ${focusMode}, Target CGPA: ${targetCGPA}.

SYLLABUS:
${syllabusContext}

Return ONLY a JSON object with a "quests" array. Each quest object:
{
  "title": "Subject Name",
  "subjectCode": "BCS401",
  "tasks": [
    { "title": "Unit 1: Topic Name", "xp": 150, "completed": false, "requiresQuiz": true },
    ...
  ]
}
Assign XP based on unit difficulty (100-300). Order tasks by priority for the focus mode.`;

        try {
            const resp = await this.callGroq(prompt, 'Generate quests now.', 0.3);
            const parsed = JSON.parse(resp);
            const questArray = Array.isArray(parsed) ? parsed : parsed.quests || [];

            // Enrich with UI styling
            return questArray.map((q: any, i: number) => {
                const style = QUEST_STYLES[i % QUEST_STYLES.length];
                const subj = subjects.find(s => s.code === q.subjectCode);
                return {
                    id: `quest_${Date.now()}_${i}`,
                    title: q.title || subj?.title || `Quest ${i + 1}`,
                    icon: subj?.icon || style.icon,
                    iconColor: subj?.iconColor || style.iconColor,
                    deadline: 'Safe',
                    deadlineBg: 'bg-primary/10 border-primary/20',
                    deadlineColor: style.deadlineColor,
                    deadlineIcon: 'event',
                    progressColor: style.progressColor,
                    tasks: (q.tasks || []).map((t: any) => ({
                        title: t.title,
                        xp: t.xp || 150,
                        completed: false,
                        requiresQuiz: true,
                    })),
                    source: 'syllabus',
                };
            });
        } catch (e) {
            console.error('❌ AI Mentor: Quest generation failed:', e);
            // Fallback: generate quests directly from subject data
            return subjects.map((subj, i) => {
                const style = QUEST_STYLES[i % QUEST_STYLES.length];
                return {
                    id: `quest_${Date.now()}_${i}`,
                    title: subj.title,
                    icon: subj.icon,
                    iconColor: subj.iconColor,
                    deadline: 'Safe',
                    deadlineBg: 'bg-primary/10 border-primary/20',
                    deadlineColor: style.deadlineColor,
                    deadlineIcon: 'event',
                    progressColor: style.progressColor,
                    tasks: subj.units.map((u, ui) => ({
                        title: `Unit ${ui + 1}: ${u.name}`,
                        xp: 150 + (ui * 25),
                        completed: false,
                        requiresQuiz: true,
                    })),
                    source: 'syllabus',
                };
            });
        }
    }

    /**
     * Generates a daily plan and insight based on current quests and progress.
     */
    async generateDailyBriefing(quests: Quest[], playerStats: any): Promise<MentorUpdate> {
        console.log('🤖 AI Mentor: Generating daily briefing...');

        const context = `
Current Quests: ${JSON.stringify(quests)}
Player Stats: ${JSON.stringify(playerStats)}
Syllabus Context: ${getLocalKnowledgeContext()}
    `;

        const prompt = `
You are "The Oracle", the AI Sensei. Your job is to review the student's progress and decide their #1 priority for TODAY.
Return your response ONLY as a clean JSON object in this format:
{
  "dailyMissionId": "id_of_recommended_quest",
  "recommendedTaskIndex": 0,
  "insight": {
    "title": "Short catchy title",
    "message": "Actionable strategic tip (e.g. 'Unit 3 is high-weightage, do it now')"
  },
  "mentorMessage": "Motivational 1-sentence greeting"
}
`;

        try {
            const resp = await this.callGroq(prompt, context);
            const data = JSON.parse(resp);

            const dailyMission = quests.find(q => q.id === data.dailyMissionId) || quests[0] || null;
            const todaysPlan = dailyMission ? dailyMission.tasks.filter(t => !t.completed) : [];

            return {
                dailyMission,
                todaysPlan,
                insight: data.insight,
                mentorMessage: data.mentorMessage
            };
        } catch (e) {
            console.error('❌ AI Mentor: Failed to generate briefing:', e);
            return this.fallbackBriefing(quests);
        }
    }

    /**
     * Reviews a task completion and suggests next move.
     */
    async reviewTaskCompletion(completedQuest: Quest, completedTaskIndex: number): Promise<string> {
        const taskName = completedQuest.tasks[completedTaskIndex].title;
        const prompt = `The user just completed the task: "${taskName}" in the quest "${completedQuest.title}". 
    Give a very short (max 10 words) encouraging RPG-style praise and mention what they should look toward next.
    Return as JSON: { "message": "your praise here" }`;

        try {
            const resp = await this.callGroq(prompt, "", 0.9);
            const data = JSON.parse(resp);
            return data.message || "Task complete! Leveling up...";
        } catch (e) {
            return "Task complete! Leveling up...";
        }
    }

    /**
     * Internal helper to talk to Groq API
     */
    async callGroq(systemPrompt: string, userMessage: string, temperature = 0.5, requireJson = true): Promise<string> {
        const messages = [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage || "Review state and respond." }
        ];

        const body: any = {
            model: GROQ_MODEL,
            messages,
            temperature,
            max_tokens: 2500,
        };

        if (requireJson) {
            body.response_format = { type: "json_object" };
        }

        const response = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) throw new Error('Groq API Error');
        const data = await response.json();
        return data.choices[0]?.message?.content || (requireJson ? '{}' : '');
    }

    /**
     * Analyzes Previous Year Questions (PYQs) and Syllabus to extract critical insights.
     */
    async analyzePYQs(syllabusText: string, pyqText: string): Promise<string> {
        console.log('🤖 AI Mentor: Analyzing PYQs vis-a-vis Syllabus...');

        const systemPrompt = `You are a professional academic examiner and AI mentor. 
Your goal is to extract crystal-clear insights to help the student in their exam preparation.
Be highly accurate, fully detailed, and structured like a professional academic analysis. 
Use clear language, bullet points, and avoid unnecessary explanation. DO NOT output JSON. Use Markdown.`;

        const userPrompt = `
I am providing previous 5 years exam papers (PYQs) and optionally the syllabus. Analyze every question in detail.

SYLLABUS (Context):
${syllabusText || 'Not provided'}

PYQs to Analyze:
${pyqText}

Deliver the analysis EXACTLY in this Markdown structure:

1️⃣ Repeated Questions Analysis
* Identify all questions that repeat across the years.
* Mention frequency (kitni baar poocha gaya).
* Highlight repeated topics + exact years.

2️⃣ Important Topics Priority List
* Categorize every question topic-wise based on the syllabus.
* Identify high-weightage topics (frequent + marks-heavy).
* Give a prioritized study roadmap.

3️⃣ Chapter-wise Weightage
* Calculate which chapters have the highest number of questions overall.
* Present a percentage distribution.

4️⃣ Question Type Classification
* Theory questions
* Numerical/derivations
* Short notes / definitions
* Diagrams / case studies (if any)

5️⃣ Difficulty Assessment
* Mark each question/topic as Easy / Moderate / Hard
* Give basis of repetition, conceptual depth, marks allocation.

6️⃣ Hidden Patterns & Examiner Intent
* Which concepts do examiners love repeating?
* Any shift in pattern in the last 2–3 years?

7️⃣ Final Output Summary
* Top 10 most expected questions
* Top 5 must-study chapters
* Smart last-minute study plan
`;

        try {
            // requireJson is false for this call to get raw beautifully formatted Markdown
            const resp = await this.callGroq(systemPrompt, userPrompt, 0.4, false);
            return resp;
        } catch (e) {
            console.error('❌ AI Mentor: Failed to analyze PYQs:', e);
            throw e;
        }
    }
    fallbackBriefing(quests: Quest[]): MentorUpdate {
        return {
            dailyMission: quests[0] || null,
            todaysPlan: quests[0]?.tasks.filter(t => !t.completed) || [],
            insight: {
                title: "Focus on Consistency",
                message: "Your path is clear. Complete today's primary mission to stay on track."
            },
            mentorMessage: "Welcome back, Seeker. The Dojo awaits."
        };
    }
}

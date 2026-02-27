# AI Integration Changelog

All changes made during the AI integration phase, from API key setup to full knowledge-aware chat.

---

## 1. Environment Configuration
**File:** `.env`
- Added `EXPO_PUBLIC_GROQ_API_KEY` — stores the Groq API key securely via Expo's env system.

---

## 2. AI Service Layer (NEW)
**File:** `src/services/aiService.ts`
- Created the core AI communication service.
- Uses **Groq REST API** via `fetch` (no SDK needed — works natively in React Native).
- **Model:** `meta-llama/llama-4-scout-17b-16e-instruct` (free tier, 500K tokens/day).
- Implements "The Oracle" Game Master persona via a system prompt.
- Includes debug logging for API key verification on startup.
- Dynamically injects local knowledge context (syllabus, notes, PYQs) into every request.

---

## 3. Knowledge Service (NEW)
**File:** `src/services/knowledgeService.ts`
- Acts as a local "brain" — stores condensed versions of:
  - **Cyber Security Syllabus** (all 5 units)
  - **Unit 1 Notes** (CIA Triad, Threats vs Attacks)
  - **2023-24 PYQ Questions** (key questions extracted from PDF)
- Exports `getLocalKnowledgeContext()` which returns a single string injected into the AI prompt.
- Designed to be easily expanded as more subjects are added.

---

## 4. ChatScreen Rewrite
**File:** `src/screens/ChatScreen.tsx`
- **Before:** Static mockup with hardcoded messages.
- **After:** Fully functional live AI chat.
- **Features added:**
  - Dynamic message rendering (user on right, Oracle on left)
  - `ActivityIndicator` with "Consulting the scrolls..." loading state
  - Auto-scroll to latest message via `ScrollView` ref
  - Quick-action chips ("Summarize Topic", "Study Plan", "Quick Quiz") that pre-fill input
  - Send button disables while AI is thinking
  - Header status dot changes color during loading (green → yellow)
  - Rolling 20-message context window to prevent token overflow

---

## 5. Quest System Connected (NEW)
**File:** `src/context/QuestContext.tsx`
- Created a shared React Context for quest state management.
- Provides: `quests`, `addQuest()`, `toggleTask()`, `getProgress()`, `totalXP`.
- Default quests match user's actual 4th-sem subjects (Cyber Security, OS, Automata).

**File:** `App.tsx`
- Wrapped the entire app in `<QuestProvider>`.

**File:** `src/screens/DashboardScreen.tsx`
- XP bar now reflects **real completed task XP** (was hardcoded to 1450).
- Daily Mission dynamically shows the first quest's next incomplete task.
- Side Quests dynamically render from context with live progress percentages.
- Tapping quests navigates to the Quest Log.

**File:** `src/screens/QuestLogScreen.tsx`
- QuestCard component refactored to accept a `Quest` object from context.
- Task toggling now uses `toggleTask()` from context (was local state only).
- Overall semester progress calculated dynamically.

**File:** `src/screens/AddQuestScreen.tsx`
- Save button now calls `addQuest()` from context.
- New quests instantly appear on both Dashboard and Quest Log.

---

## 6. Supporting Files
**File:** `paper/extracted/Cyber Security 2023-24.md`
- Extracted from PDF to Markdown for AI consumption.

**File:** `notes/Cyber Security Notes.md`
- Demo notes file created for testing AI context awareness.

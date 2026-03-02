// src/services/aiConfig.ts
// Shared AI configuration — single source of truth

export const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
export const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY || '';
export const GROQ_MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct';

// Log key status (redacted) only in dev
if (__DEV__) {
    console.log('🔑 Groq API Key:', GROQ_API_KEY ? 'loaded' : '❌ MISSING');
}

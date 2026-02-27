// src/services/knowledgeService.ts
// A local mock database of study materials for testing context-aware AI

export const LOCAL_KNOWLEDGE_BASE = {
    syllabus: {
        cyber_security: `
# BCC401: Cyber Security Syllabus
Units:
1. Introduction to Cybercrime: Origins, classifications, cybercriminals, social engineering, stalking, botnets.
2. Mobile/Wireless Security: Proliferation, trends, credit card fraud, mobile authentication, organizational policies.
3. Tools & Methods: Proxy servers, phishing, password cracking, keyloggers, viruses/worms, steganography, DoS/DDoS, SQL Injection.
4. Computer Forensics: Digital forensics science, life cycle, chain of custody, network forensics, social media threats.
5. Policies & Laws: Indian Cyber Law, Digital Personal Data Protection Act 2023, Intellectual Property (Patent, Copyright, Trademarks).
        `,
    },
    notes: {
        cyber_security_unit_1: `
# Unit 1 Notes: Introduction to Information Security
- Confidentiality: Only authorized access.
- Integrity: Accuracy and completeness of data.
- Availability: Services available when needed.
- CIA Triad: Model for security policies.
- Threat vs Attack: Threat is potential danger; Attack is active exploitation.
        `,
    },
    papers: {
        cyber_security_2023_24: `
# PYQ: Cyber Security (2023-24)
Key Questions:
- Difference between cybercrime and traditional crime.
- Registry settings in Android vs iOS.
- Keyloggers and keystroke capture.
- Tools for protecting against cybercrime.
- Steganography for concealing information.
- Stages of a cyber-attack.
- Phishing detection on mobile.
- Difference between DoS and DDoS.
- SQL injection exploitation.
        `
    }
};

/**
 * Returns a consolidated string of all relevant local knowledge to inject into the AI prompt.
 */
export function getLocalKnowledgeContext(): string {
    return `
--- LOCAL KNOWLEDGE BASE ---
${LOCAL_KNOWLEDGE_BASE.syllabus.cyber_security}
${LOCAL_KNOWLEDGE_BASE.notes.cyber_security_unit_1}
${LOCAL_KNOWLEDGE_BASE.papers.cyber_security_2023_24}
-----------------------------
    `;
}

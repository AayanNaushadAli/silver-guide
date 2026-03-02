// src/services/knowledgeService.ts
// Pre-loaded syllabus data for 4th Sem CSE (AI-ML)
// This is the knowledge base that feeds the AI Mentor when generating quests.

export interface SubjectData {
    code: string;
    title: string;
    icon: string;
    iconColor: string;
    units: { name: string; topics: string }[];
}

export const SEMESTER_DATA: Record<string, SubjectData[]> = {
    '4_cs': [
        {
            code: 'BCC401',
            title: 'Cyber Security',
            icon: 'security',
            iconColor: '#E53E3E',
            units: [
                { name: 'Introduction to Cyber Crime', topics: 'Cybercrime definition, origins, cybercriminals, classifications, social engineering, cyber stalking, botnets, attack vectors' },
                { name: 'Mobile & Wireless Security', topics: 'Mobile device proliferation, credit card fraud, security challenges, registry settings, authentication, attacks on mobile phones, organizational policies' },
                { name: 'Tools & Methods', topics: 'Proxy servers, anonymizers, phishing, password cracking, keyloggers, spyware, viruses, worms, trojans, steganography, DoS/DDoS, SQL injection, buffer overflow' },
                { name: 'Computer Forensics', topics: 'Digital forensics science, forensics life cycle, chain of custody, network forensics, email forensics, social networking threats' },
                { name: 'Security Policies & Cyber Laws', topics: 'Information security policy, Indian Cyber Law, Digital Personal Data Protection Act 2023, intellectual property, patents, copyright, trademarks' },
            ],
        },
        {
            code: 'BCS401',
            title: 'Operating Systems',
            icon: 'memory',
            iconColor: '#3b82f6',
            units: [
                { name: 'Introduction to OS', topics: 'OS functions, classification (batch, interactive, time sharing, real-time, multiprocessor), OS structure (layered, monolithic, microkernel), system components, services' },
                { name: 'Concurrent Processes', topics: 'Process concept, concurrency, producer-consumer problem, mutual exclusion, critical section, Dekker/Peterson solution, semaphores, dining philosophers, sleeping barber, IPC' },
                { name: 'CPU Scheduling & Deadlock', topics: 'Scheduling concepts, performance criteria, process states, PCB, threads, scheduling algorithms (FCFS, SJF, RR, priority), multiprocessor scheduling, deadlock prevention/avoidance/detection/recovery' },
                { name: 'Memory Management', topics: 'Multiprogramming, fixed/variable partitions, paging, segmentation, virtual memory, demand paging, page replacement algorithms (FIFO, LRU, optimal), thrashing, cache, locality of reference' },
                { name: 'I/O Management & File System', topics: 'I/O devices, subsystems, buffering, disk scheduling (FCFS, SSTF, SCAN, C-SCAN), RAID, file concepts, organization, directories, sharing, implementation, protection' },
            ],
        },
        {
            code: 'BCS402',
            title: 'Theory of Automata',
            icon: 'account-tree',
            iconColor: '#a855f7',
            units: [
                { name: 'Basic Concepts & Automata', topics: 'Automata, computability, complexity, alphabet, symbols, strings, formal languages, DFA, NFA, equivalence, epsilon transitions, Moore/Mealy machines, FA minimization' },
                { name: 'Regular Expressions', topics: 'Regular expressions, transition graphs, Kleene theorem, Arden theorem, algebraic method, closure properties, pigeonhole principle, pumping lemma, decidability' },
                { name: 'Context-Free Grammars', topics: 'CFG definition, derivations, derivation trees, ambiguity, regular grammars (right/left linear), FA to CFG conversion, CFG simplification, CNF, GNF, Chomsky hierarchy' },
                { name: 'Pushdown Automata', topics: 'NPDA definition, moves, language acceptance, DPDA, DCFL, PDA for CFLs, CFGs for PDAs, two-stack PDA, pumping lemma for CFL, closure properties, decision problems' },
                { name: 'Turing Machines', topics: 'TM model, representation, language acceptability, TM construction, modifications, TM as integer function computer, universal TM, LBA, Church thesis, recursive languages, halting problem, PCP' },
            ],
        },
        {
            code: 'BCS403',
            title: 'OOP with Java',
            icon: 'code',
            iconColor: '#f59e0b',
            units: [
                { name: 'Introduction & OOP Concepts', topics: 'Java history, JVM, JRE, classes, constructors, methods, access specifiers, static/final members, data types, operators, control flow, arrays, strings, inheritance, polymorphism, abstraction, interfaces' },
                { name: 'Packages & Exception Handling', topics: 'Packages, CLASSPATH, JAR files, import/static import, exceptions vs errors, try-catch-finally, throw/throws, checked/unchecked exceptions, user-defined exceptions, byte/character streams, file I/O' },
                { name: 'Multithreading & New Features', topics: 'Thread lifecycle, creating threads, priorities, synchronization, inter-thread communication, lambda expressions, Stream API, method references, functional interfaces, modules, records, sealed classes' },
                { name: 'Java Collections Framework', topics: 'Collection hierarchy, Iterator, List (ArrayList, LinkedList, Vector, Stack), Queue, Set (HashSet, LinkedHashSet, TreeSet), Map (HashMap, LinkedHashMap, TreeMap, Hashtable), sorting, Comparable, Comparator' },
                { name: 'Spring Framework & Boot', topics: 'Spring DI, IoC, AOP, bean scopes, autowiring, annotations, lifecycle callbacks, Spring Boot structure, runners, logger, RESTful web services, REST controller, request mapping, CRUD APIs' },
            ],
        },
    ],
};

/**
 * Get subjects for a given semester and branch
 */
export function getSubjectsForSemester(semester: number, branch: string = 'cs'): SubjectData[] {
    const key = `${semester}_${branch}`;
    return SEMESTER_DATA[key] || [];
}

/**
 * Build AI context string from selected subjects
 */
export function buildSyllabusContext(subjects: SubjectData[]): string {
    return subjects.map(s => {
        const unitList = s.units.map((u, i) => `  Unit ${i + 1}: ${u.name} — ${u.topics}`).join('\n');
        return `Subject: ${s.title} (${s.code})\n${unitList}`;
    }).join('\n\n');
}

/**
 * Legacy function — returns all available knowledge for AI context
 */
export function getLocalKnowledgeContext(): string {
    const allSubjects = SEMESTER_DATA['4_cs'] || [];
    return `--- SYLLABUS KNOWLEDGE BASE ---\n${buildSyllabusContext(allSubjects)}\n-------------------------------`;
}

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
                { name: 'Introduction to Cyber Crime', topics: 'Cybercrime- Definition and Origins of the word Cybercrime and Information Security, Who are Cybercriminals? Classifications of Cybercrimes, A Global Perspective on Cybercrimes, Cybercrime Era: Survival Mantra for the Netizens. Cyber offenses: How Criminals Plan the Attacks, Social Engineering, Cyber stalking, Cybercafe and Cybercrimes, Botnets: The Fuel for Cybercrime, Attack Vector.' },
                { name: 'Mobile & Wireless Security', topics: 'Mobile and Wireless Devices-Introduction, Proliferation of Mobile and Wireless Devices, Trends in Mobility, Credit Card Frauds in Mobile and Wireless Computing Era, Security Challenges Posed by Mobile Devices, Registry Settings for Mobile Devices, Authentication Service Security, Attacks on Mobile/Cell Phones, Mobile Devices: Security Implications for organizations, Organizational Measures for Handling Mobile, Organizational Security Policies and Measures in Mobile Computing Era.' },
                { name: 'Tools & Methods', topics: 'Introduction, Proxy Servers and Anonymizers, Phishing, Password Cracking, Keyloggers and Spywares, Virus and Worms, Trojan-horses and Backdoors, Steganography, DoS and DDoS Attacks, SQL Injection, Buffer Overflow, Attacks on Wireless Networks. Phishing and Identity Theft: Introduction to Phishing, Identity Theft (ID Theft).' },
                { name: 'Computer Forensics', topics: 'Introduction, Digital Forensics Science, The Need for Computer Forensics, Cyber forensics and Digital Evidence, Forensics Analysis of E-Mail, Digital Forensics Life Cycle, Chain of Custody Concept, Network Forensics, Approaching a Computer Forensics Investigation. Forensics and Social Networking Sites: The Security/Privacy Threats, Challenges in Computer Forensics.' },
                { name: 'Security Policies & Cyber Laws', topics: 'Need for An Information Security Policy, Introduction to Indian Cyber Law, Objective and Scope of the Digital Personal Data Protection Act 2023, Intellectual Property Issues, Overview of Intellectual Property Related Legislation in India, Patent, Copyright, Trademarks.' },
            ],
        },
        {
            code: 'BCS401',
            title: 'Operating Systems',
            icon: 'memory',
            iconColor: '#3b82f6',
            units: [
                { name: 'Introduction to OS', topics: 'Operating system and functions, Classification of Operating systems (Batch, Interactive, Time sharing, Real Time System, Multiprocessor Systems, Multiuser Systems, Multiprocess Systems, Multithreaded Systems). Operating System Structure (Layered structure, System Components, Operating System services, Reentrant Kernels, Monolithic and Microkernel Systems).' },
                { name: 'Concurrent Processes', topics: 'Process Concept, Principle of Concurrency, Producer / Consumer Problem, Mutual Exclusion, Critical Section Problem, Dekker\'s solution, Peterson\'s solution, Semaphores, Test and Set operation. Classical Problem in Concurrency (Dining Philosopher Problem, Sleeping Barber Problem); Inter Process Communication models and Schemes, Process generation.' },
                { name: 'CPU Scheduling & Deadlock', topics: 'Scheduling Concepts, Performance Criteria, Process States, Process Transition Diagram, Schedulers, Process Control Block (PCB), Process address space, Process identification information, Threads and their management, Scheduling Algorithms, Multiprocessor Scheduling. Deadlock: System model, Deadlock characterization, Prevention, Avoidance and detection, Recovery from deadlock.' },
                { name: 'Memory Management', topics: 'Basic bare machine, Resident monitor, Multiprogramming with fixed partitions, Multiprogramming with variable partitions, Protection schemes, Paging, Segmentation, Paged segmentation, Virtual memory concepts, Demand paging, Performance of demand paging, Page replacement algorithms, Thrashing, Cache memory organization, Locality of reference.' },
                { name: 'I/O Management & File System', topics: 'I/O devices, and I/O subsystems, I/O buffering, Disk storage and disk scheduling, RAID. File System: File concept, File organization and access mechanism, File directories, and File sharing, File system implementation issues, File system protection and security.' },
            ],
        },
        {
            code: 'BCS402',
            title: 'Theory of Automata',
            icon: 'account-tree',
            iconColor: '#a855f7',
            units: [
                { name: 'Basic Concepts & Automata', topics: 'Introduction to Theory of Computation (Automata, Computability and Complexity), Alphabet, Symbol, String, Formal Languages. Deterministic Finite Automaton (DFA) Definition, Representation, Acceptability of a String and Language. Non Deterministic Finite Automaton (NFA), Equivalence of DFA and NFA, NFA with ε-Transition, Equivalence of NFA\'s with and without ε-Transition. Finite Automata with output (Moore Machine, Mealy Machine), Equivalence of Moore and Mealy Machine, Minimization of Finite Automata.' },
                { name: 'Regular Expressions', topics: 'Regular Expressions, Transition Graph, Kleen\'s Theorem, Finite Automata and Regular Expression (Arden\'s theorem, Algebraic Method Using Arden\'s Theorem). Regular and Non-Regular Languages (Closure properties of Regular Languages, Pigeonhole Principle, Pumping Lemma, Application of Pumping Lemma). Decidability (Decision properties, Finite Automata and Regular Languages).' },
                { name: 'Context-Free Grammars', topics: 'Context Free Grammar (CFG) Definition, Derivations, Languages, Derivation Trees and Ambiguity. Regular Grammars (Right Linear and Left Linear grammars), Conversion of FA into CFG and Regular grammar into FA, Simplification of CFG. Normal Forms (Chomsky Normal Form, Greibach Normal Form), Chomsky Hierarchy, Programming problems based on the properties of CFGs.' },
                { name: 'Pushdown Automata', topics: 'Nondeterministic Pushdown Automata (NPDA) Definition, Moves, A Language Accepted by NPDA. Deterministic Pushdown Automata (DPDA) and Deterministic Context free Languages (DCFL), Pushdown Automata for Context Free Languages, Context Free grammars for Pushdown Automata, Two stack Pushdown Automata. Pumping Lemma for CFL, Closure properties of CFL, Decision Problems of CFL, Programming problems based on the properties of CFLs.' },
                { name: 'Turing Machines', topics: 'Basic Turing Machine Model, Representation of Turing Machines, Language Acceptability of Turing Machines, Techniques for Turing Machine Construction, Modifications of Turing Machine, Turing Machine as Computer of Integer Functions, Universal Turing machine, Linear Bounded Automata. Church\'s Thesis, Recursive and Recursively Enumerable language, Halting Problem, Post\'s Correspondance Problem, Introduction to Recursive Function Theory.' },
            ],
        },
        {
            code: 'BCS403',
            title: 'OOP with Java',
            icon: 'code',
            iconColor: '#f59e0b',
            units: [
                { name: 'Introduction & OOP Concepts', topics: 'History of Java, JVM, JRE, Java Environment, Java Source File Structure, and Compilation. Defining Classes in Java, Constructors, Methods, Access Specifies, Static Members, Final Members, Comments, Data types, Variables, Operators, Control Flow, Arrays & String. Class, Object, Inheritance Super Class, Sub Class, Overriding, Overloading, Encapsulation, Polymorphism, Abstraction, Interfaces, and Abstract Class.' },
                { name: 'Packages & Exception Handling', topics: 'Defining Package, CLASSPATH Setting for Packages, Making JAR Files for Library Packages, Import and Static Import Naming Convention For Packages. Exceptions & Errors, Types of Exception, Control Flow in Exceptions, JVM Reaction to Exceptions, Use of try, catch, finally, throw, throws in Exception Handling, In-built and User Defined Exceptions, Checked and Un-Checked Exceptions. Byte Streams and Character Streams, Reading and Writing File in Java.' },
                { name: 'Multithreading & New Features', topics: 'Thread, Thread Life Cycle, Creating Threads, Thread Priorities, Synchronizing Threads, Inter-thread Communication. Functional Interfaces, Lambda Expression, Method References, Stream API, Default Methods, Static Method, Base64 Encode and Decode, ForEach Method, Try-with-resources, Type Annotations, Repeating Annotations, Java Module System, Diamond Syntax with Inner Anonymous Class, Local Variable Type Inference, Switch Expressions, Yield Keyword, Text Blocks, Records, Sealed Classes.' },
                { name: 'Java Collections Framework', topics: 'Collection in Java, Collection Framework in Java, Hierarchy of Collection Framework, Iterator Interface, Collection Interface, List Interface, ArrayList, LinkedList, Vector, Stack, Queue Interface, Set Interface, HashSet, LinkedHashSet, SortedSet Interface, TreeSet, Map Interface, HashMap Class, LinkedHashMap Class, TreeMap Class, Hashtable Class. Sorting, Comparable Interface, Comparator Interface, Properties Class in Java.' },
                { name: 'Spring Framework & Boot', topics: 'Spring Core Basics (Spring Dependency Injection concepts, Spring Inversion of Control, AOP), Bean Scopes (Singleton, Prototype, Request, Session, Application, Web Socket), Auto wiring, Annotations, Life Cycle Call backs, Bean Configuration styles. Spring Boot Build Systems, Spring Boot Code Structure, Spring Boot Runners, Logger, Building RESTful Web Services, Rest Controller, Request Mapping, Request Body, Path Variable, Request Parameter, GET, POST, PUT, DELETE APIs, Build Web Applications.' },
            ],
        },
    ],
};

export const PYQ_DATA = `
--- PAST YEAR QUESTIONS (2023-24) ---
Subject: Cyber Security
1. How does cybercrime differ from traditional crime?
2. What are the common profiles of cybercriminals?
3. How do registry settings differ between mobile OS (Android/iOS)?
4. What is a keylogger, and how does it capture keystrokes?
5. What is digital forensics vs traditional forensic science?
6. What tools and technologies are essential against cybercrime?
7. How do multi-factor authentication (MFA) systems work on mobile?
8. What is steganography?
9. What are the technical challenges in computer forensics?
10. What are the typical stages of a cyber-attack?
11. How can users detect phishing attacks on mobile devices?
12. Difference between DoS and DDoS attack?
13. What is an SQL injection attack?
14. What are the stages of the digital forensics life cycle?
15. What are the legal consequences for cybercrimes under Indian law?
-------------------------------------
`;

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
    return `--- SYLLABUS KNOWLEDGE BASE ---\n${buildSyllabusContext(allSubjects)}\n-------------------------------\n\n${PYQ_DATA}`;
}

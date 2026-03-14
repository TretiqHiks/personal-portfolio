export interface Project {
  id: string;
  title: string;
  summary: string;
  description: string;
  techStack: string[];
  features: string[];
  challenges: string[];
  github?: string;
  demo?: string;
  image?: string;
  status: "active" | "past";
}

export interface ExperienceEntry {
  id: string;
  role: string;
  company: string;
  period: string;
  description: string;
  skills: string[];
}

export interface SkillCategory {
  name: string;
  skills: string[];
}

export const experiences: ExperienceEntry[] = [
  {
    id: "exp-1",
    role: "Senior Software Engineer",
    company: "Nexus Technologies",
    period: "2022 — Present",
    description: "Leading development of cloud-native microservices powering real-time analytics for 2M+ users. Architected event-driven systems reducing latency by 40%.",
    skills: ["TypeScript", "Go", "Kubernetes", "AWS", "PostgreSQL", "Kafka"],
  },
  {
    id: "exp-2",
    role: "Software Engineer",
    company: "Aether Systems",
    period: "2020 — 2022",
    description: "Built scalable APIs and internal tooling for a fintech platform processing $500M+ monthly. Led migration from monolith to microservices architecture.",
    skills: ["Python", "Node.js", "Docker", "Redis", "MongoDB", "React"],
  },
  {
    id: "exp-3",
    role: "Full Stack Developer",
    company: "Orbital Labs",
    period: "2018 — 2020",
    description: "Developed customer-facing dashboards and data visualization tools. Implemented CI/CD pipelines and improved deployment frequency by 3x.",
    skills: ["React", "TypeScript", "Node.js", "PostgreSQL", "AWS", "Terraform"],
  },
  {
    id: "exp-4",
    role: "Junior Developer",
    company: "CodeForge Inc.",
    period: "2017 — 2018",
    description: "Contributed to front-end features and automated testing infrastructure. Reduced bug count by 35% through comprehensive test coverage.",
    skills: ["JavaScript", "React", "Jest", "CSS", "Git"],
  },
];

export const skillCategories: SkillCategory[] = [
  {
    name: "Languages",
    skills: ["TypeScript", "JavaScript", "Go", "Python", "Rust", "SQL"],
  },
  {
    name: "Frameworks",
    skills: ["React", "Next.js", "Node.js", "Express", "FastAPI", "Tailwind CSS"],
  },
  {
    name: "Cloud & DevOps",
    skills: ["AWS", "Docker", "Kubernetes", "Terraform", "GitHub Actions", "Vercel"],
  },
  {
    name: "Databases",
    skills: ["PostgreSQL", "MongoDB", "Redis", "DynamoDB", "Elasticsearch"],
  },
  {
    name: "Tools & Platforms",
    skills: ["Git", "Kafka", "GraphQL", "Figma", "Datadog", "Jira"],
  },
];

export const projects: Project[] = [
  {
    id: "pulse-analytics",
    title: "Pulse Analytics",
    summary: "Real-time analytics dashboard processing millions of events per second with sub-100ms latency.",
    description: "A high-performance analytics platform designed for enterprise clients who need real-time insights into user behavior, system performance, and business metrics. Built from the ground up to handle massive scale while maintaining responsiveness.",
    techStack: ["TypeScript", "React", "Go", "Kafka", "ClickHouse", "Kubernetes"],
    features: [
      "Real-time streaming data visualization with WebSocket connections",
      "Custom query builder supporting complex aggregations",
      "Automated anomaly detection using statistical models",
      "Multi-tenant architecture with data isolation",
      "Customizable dashboard templates with drag-and-drop",
    ],
    challenges: [
      "Designed a custom ingestion pipeline capable of handling 1M+ events/sec using Go and Kafka, with exactly-once processing guarantees.",
      "Implemented incremental materialized views in ClickHouse to achieve sub-100ms query response times on billion-row datasets.",
      "Built a WebSocket fan-out service that efficiently broadcasts real-time updates to thousands of concurrent dashboard sessions.",
    ],
    github: "https://github.com",
    demo: "https://example.com",
    image: "project-pulse",
    status: "active",
  },
  {
    id: "vaultguard",
    title: "VaultGuard",
    summary: "End-to-end encrypted secrets management platform for engineering teams.",
    description: "A zero-knowledge secrets management solution that enables engineering teams to securely store, share, and rotate API keys, tokens, and credentials across environments. Built with security-first architecture and developer-friendly CLI tooling.",
    techStack: ["Rust", "React", "PostgreSQL", "AWS KMS", "Docker", "gRPC"],
    features: [
      "Zero-knowledge encryption — secrets never leave the client unencrypted",
      "CLI tool for seamless integration into CI/CD pipelines",
      "Audit logging with tamper-evident records",
      "Automatic secret rotation with configurable policies",
      "Role-based access control with fine-grained permissions",
    ],
    challenges: [
      "Implemented client-side encryption using AES-256-GCM with key derivation from user passwords, ensuring the server never sees plaintext secrets.",
      "Built a Rust-based CLI that integrates with shell environments and CI/CD systems, supporting .env file generation and environment variable injection.",
      "Designed an audit system using append-only Merkle trees to provide cryptographic proof of log integrity.",
    ],
    github: "https://github.com",
    image: "project-vault",
    status: "active",
  },
  {
    id: "gridflow",
    title: "GridFlow",
    summary: "Distributed task orchestration engine for complex data pipeline workflows.",
    description: "An open-source workflow orchestration system that simplifies building, scheduling, and monitoring complex data pipelines. Designed as a modern alternative to legacy tools with better developer experience and observability.",
    techStack: ["Go", "Python", "React", "Redis", "PostgreSQL", "Terraform"],
    features: [
      "DAG-based workflow definition with YAML and Python SDK",
      "Distributed task execution with automatic retry and dead-letter queues",
      "Real-time pipeline monitoring with detailed execution traces",
      "Plugin system for custom operators and integrations",
      "Built-in support for backfills and incremental processing",
    ],
    challenges: [
      "Designed a scheduler that efficiently handles 10K+ concurrent DAGs using a priority-based work-stealing algorithm.",
      "Built a custom React-based DAG visualization that renders complex pipeline topologies with real-time status updates.",
      "Implemented graceful degradation patterns ensuring pipeline reliability even during partial infrastructure failures.",
    ],
    github: "https://github.com",
    demo: "https://example.com",
    image: "project-gridflow",
    status: "past",
  },
  {
    id: "spectra-ui",
    title: "Spectra UI",
    summary: "A design system and component library built for high-performance React applications.",
    description: "A comprehensive, accessible, and performant React component library used across multiple products. Focused on developer experience, consistent design language, and runtime performance with tree-shakable exports and minimal bundle impact.",
    techStack: ["TypeScript", "React", "Storybook", "Tailwind CSS", "Vitest", "Chromatic"],
    features: [
      "50+ accessible components following WAI-ARIA patterns",
      "Theming engine with CSS custom properties and dark mode support",
      "Comprehensive Storybook documentation with interactive examples",
      "Visual regression testing with Chromatic CI integration",
      "Tree-shakable exports with <5KB average component size",
    ],
    challenges: [
      "Engineered a theming system using CSS custom properties that supports runtime theme switching without CSS-in-JS overhead.",
      "Achieved consistent cross-browser accessibility by building a custom focus management system and screen reader testing pipeline.",
      "Optimized bundle size through careful dependency management, lazy loading patterns, and automated bundle analysis in CI.",
    ],
    github: "https://github.com",
    demo: "https://example.com",
    image: "project-spectra",
  },
];

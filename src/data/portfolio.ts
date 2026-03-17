import content from "@/data/content.json";

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

export const experiences: ExperienceEntry[] = content.portfolio.experiences;
export const skillCategories: SkillCategory[] = content.portfolio.skillCategories;
export const projects: Project[] = content.portfolio.projects as Project[];

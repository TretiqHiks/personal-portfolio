# Portfolio UI/UX Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve the Projects page with a hero card and working links, improve the About page with reordered sections and better interactions, and wire up the contact form to EmailJS for real email delivery.

**Architecture:** Three independent page-level changes plus a one-time dependency setup. No new routes, no shared state between pages, no API layer other than EmailJS's browser SDK. All copy remains in `content.json`.

**Tech Stack:** React 18, TypeScript, Tailwind CSS, Framer Motion, shadcn/ui, `@emailjs/browser` v4 (env vars via `import.meta.env.VITE_*`), Vite.

---

## File Map

| File | Change |
|------|--------|
| `package.json` | Add `@emailjs/browser` dependency |
| `.gitignore` | Add `.env` entry (currently missing — only `*.local` is listed) |
| `.env.example` | Create — documents the 3 required EmailJS keys |
| `.env` | Create locally (gitignored) — real credentials go here |
| `src/pages/Projects.tsx` | Hero card, structural link fix, image height, Past badge + opacity |
| `src/pages/About.tsx` | Section reorder, timeline click + chevron import, passion border |
| `src/pages/Contact.tsx` | Replace `setTimeout` with real `emailjs.send` call (v4 API) |
| `src/data/content.json` | Already updated — `errorTitle` / `errorDescription` toast keys confirmed present |

---

## Task 1: Dependency Setup

**Files:**
- Modify: `package.json`
- Modify: `.gitignore`
- Create: `.env.example`
- Create: `.env` (local only, gitignored)

- [ ] **Step 1.1: Install `@emailjs/browser`**

```bash
npm install @emailjs/browser
```

Expected: `package.json` now lists `"@emailjs/browser"` under `dependencies`. No errors.

- [ ] **Step 1.2: Add `.env` to `.gitignore`**

In `.gitignore`, add `.env` on its own line after the `*.local` entry:

```
*.local
.env
```

Do NOT replace the file — append only. The existing file has entries for logs, `node_modules`, `dist`, editor directories, etc.

- [ ] **Step 1.3: Create `.env.example`**

Create `.env.example` at the project root:

```
VITE_EMAILJS_SERVICE_ID=your_service_id_here
VITE_EMAILJS_TEMPLATE_ID=your_template_id_here
VITE_EMAILJS_PUBLIC_KEY=your_public_key_here
```

- [ ] **Step 1.4: Create `.env` with placeholder values**

Create `.env` at the project root (this file stays local):

```
VITE_EMAILJS_SERVICE_ID=
VITE_EMAILJS_TEMPLATE_ID=
VITE_EMAILJS_PUBLIC_KEY=
```

Leave the values empty — real credentials are filled in when setting up EmailJS (see Task 4 setup note).

- [ ] **Step 1.5: Verify `.env` is gitignored**

```bash
git check-ignore -v .env
```

Expected output: `.gitignore:13:.env    .env` (line number may differ). If no output is returned, the `.env` line was not saved correctly — re-check Step 1.2 before continuing.

- [ ] **Step 1.6: Verify build still passes**

```bash
npm run build
```

Expected: build completes with no TypeScript or module errors.

- [ ] **Step 1.7: Commit**

```bash
git add package.json package-lock.json .gitignore .env.example
git commit -m "chore: add emailjs dependency and env config"
```

Note: `.env` must NOT appear in `git status --short` at this point. If it does, stop and fix Step 1.2.

---

## Task 2: Projects Page — Hero Card, Structural Link Fix, Past Badge

**Files:**
- Modify: `src/pages/Projects.tsx`

### Context

The current `ProjectCard` wraps the entire card in a `<Link>`. GitHub and demo icons are non-interactive decorations (just `<Github>` and `<ArrowUpRight>` components with no `<a>` tag). The fix: remove the wrapping `<Link>`, make the card a plain `<div>`, add an explicit "View Details" `<Link>` inside, and make GitHub/demo icons real `<a>` tags placed as siblings — never nested inside `<Link>`.

The first active project gets a wide hero card (`HeroProjectCard`) with a `h-[320px]` image. Remaining active + all past projects use `ProjectCard` with `h-56` images. Past project cards get `opacity-80` and a "Past" badge using the existing `t.pastLabel` key.

Edge case: if there are no remaining active projects after the hero, the hero wrapper uses `mb-16` to maintain consistent spacing before the Past section heading.

Do NOT place a `key` prop inside component bodies — it belongs only at the call site.

### Full replacement for `src/pages/Projects.tsx`

- [ ] **Step 2.1: Replace `Projects.tsx` with the updated version**

```tsx
import Layout from "@/components/Layout";
import { motion } from "framer-motion";
import { projects } from "@/data/portfolio";
import { Link } from "react-router-dom";
import { ArrowUpRight, Github, ArrowRight } from "lucide-react";
import { getProjectImage } from "@/lib/projectImages";
import content from "@/data/content.json";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const t = content.projectsPage;

// Reusable external link buttons — never nested inside <Link>
const ProjectLinks = ({ project }: { project: typeof projects[0] }) => (
  <div className="flex gap-2">
    {project.github && (
      <a
        href={project.github}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Source code"
      >
        <Github className="w-4 h-4" />
      </a>
    )}
    {project.demo && (
      <a
        href={project.demo}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Live demo"
      >
        <ArrowUpRight className="w-4 h-4" />
      </a>
    )}
  </div>
);

// Hero card — full width, tall image, for the first active project
const HeroProjectCard = ({ project }: { project: typeof projects[0] }) => {
  const img = getProjectImage(project.image);
  return (
    <motion.div {...fadeUp} transition={{ duration: 0.4 }}>
      <div className="glass rounded-2xl overflow-hidden transition-all duration-300 hover:glow-primary hover:border-primary/20 group">
        {img && (
          <div className="w-full h-[320px] overflow-hidden">
            <img
              src={img}
              alt={project.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        )}
        <div className="p-6 md:p-8">
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
              {project.title}
            </h3>
            <ProjectLinks project={project} />
          </div>
          <p className="text-muted-foreground leading-relaxed mb-5">
            {project.summary}
          </p>
          <div className="flex flex-wrap gap-1.5 mb-5">
            {project.techStack.map((tech) => (
              <span
                key={tech}
                className="text-[11px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium"
              >
                {tech}
              </span>
            ))}
          </div>
          <Link
            to={`/projects/${project.id}`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            View Details <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

// Standard grid card — for remaining active projects and all past projects
const ProjectCard = ({
  project,
  i,
  isPast,
}: {
  project: typeof projects[0];
  i: number;
  isPast?: boolean;
}) => {
  const img = getProjectImage(project.image);
  return (
    <motion.div
      {...fadeUp}
      transition={{ duration: 0.4, delay: 0.1 * i }}
      className={isPast ? "opacity-80" : ""}
    >
      <div className="glass rounded-2xl overflow-hidden h-full transition-all duration-300 hover:glow-primary hover:border-primary/20 group flex flex-col">
        {img && (
          <div className="w-full h-56 overflow-hidden">
            <img
              src={img}
              alt={project.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        )}
        <div className="p-6 flex flex-col flex-1">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                {project.title}
              </h3>
              {isPast && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
                  {t.pastLabel}
                </span>
              )}
            </div>
            <ProjectLinks project={project} />
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1">
            {project.summary}
          </p>
          <div className="flex flex-wrap gap-1.5 mb-4">
            {project.techStack.map((tech) => (
              <span
                key={tech}
                className="text-[11px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium"
              >
                {tech}
              </span>
            ))}
          </div>
          <Link
            to={`/projects/${project.id}`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline mt-auto"
          >
            View Details <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

const Projects = () => {
  const activeProjects = projects.filter((p) => p.status === "active");
  const pastProjects = projects.filter((p) => p.status === "past");
  const [heroProject, ...remainingActive] = activeProjects;

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <motion.h1
          {...fadeUp}
          transition={{ duration: 0.5 }}
          className="text-3xl md:text-4xl font-bold text-gradient mb-12"
        >
          {t.title}
        </motion.h1>

        {/* Active Projects */}
        {activeProjects.length > 0 && (
          <>
            <motion.h2
              {...fadeUp}
              transition={{ duration: 0.4, delay: 0.05 }}
              className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2"
            >
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              {t.activeLabel}
            </motion.h2>

            {heroProject && (
              <div className={remainingActive.length > 0 ? "mb-6" : "mb-16"}>
                <HeroProjectCard project={heroProject} />
              </div>
            )}

            {remainingActive.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
                {remainingActive.map((project, i) => (
                  <ProjectCard key={project.id} project={project} i={i} />
                ))}
              </div>
            )}
          </>
        )}

        {/* Past Projects */}
        {pastProjects.length > 0 && (
          <>
            <motion.h2
              {...fadeUp}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2"
            >
              <span className="w-2 h-2 rounded-full bg-muted-foreground" />
              {t.pastLabel}
            </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pastProjects.map((project, i) => (
                <ProjectCard key={project.id} project={project} i={i} isPast />
              ))}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Projects;
```

- [ ] **Step 2.2: Verify build passes**

```bash
npm run build
```

Expected: no TypeScript errors, no missing imports.

- [ ] **Step 2.3: Spot-check in dev server**

```bash
npm run dev
```

Visually verify on `/projects`:
- First active project shows as a wide hero card with a tall (~320px) image
- Remaining active projects appear in 2-column grid with taller images (224px)
- Past project cards show at reduced opacity with a "Past" badge next to the title
- GitHub/demo icons are present but won't navigate (current project data has no `github`/`demo` URLs — expected)
- "View Details" link correctly navigates to the project detail page
- No wrapping `<Link>` errors in browser console

- [ ] **Step 2.4: Commit**

```bash
git add src/pages/Projects.tsx
git commit -m "feat: projects page hero card, real link structure, past badge"
```

---

## Task 3: About Page — Section Reorder, Timeline Click, Passion Borders

**Files:**
- Modify: `src/pages/About.tsx`

### Context

Three changes:
1. **Section reorder:** Hero/Portrait (currently second `<section>`) moves to first. Quick Facts (currently first) moves to second. The remaining order (Journey → Passions → Curiosities) is unchanged.
2. **Timeline click/tap:** Add `onClick` toggle to each milestone card. Add `ChevronDown` to the existing lucide-react import list (new icon not currently in the file). On desktop, existing `onMouseEnter`/`onMouseLeave` behavior is preserved. `onClick` works identically on both mobile and desktop: clicking toggles the card open/closed. On desktop, mouse leave still collapses an open card — this is intentional per spec (no lock mechanism).
3. **Passion borders:** Add `border-t-2 border-primary` to all 3 passion cards (class added to the existing `motion.div` className).

### Full replacement for `src/pages/About.tsx`

- [ ] **Step 3.1: Replace `About.tsx` with the updated version**

```tsx
import Layout from "@/components/Layout";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import bigPortrait from "@/assets/big_portrait.png";
import {
  Server,
  Cloud,
  Database,
  Brain,
  Gauge,
  MapPin,
  Code2,
  Heart,
  Layers,
  Coffee,
  Sparkles,
  Terminal,
  Rocket,
  Lightbulb,
  Zap,
  ChevronDown,
} from "lucide-react";
import content from "@/data/content.json";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
};

const iconMap = {
  Server,
  Cloud,
  Database,
  Brain,
  Gauge,
  MapPin,
  Code2,
  Heart,
  Layers,
  Coffee,
  Sparkles,
  Terminal,
  Rocket,
  Lightbulb,
  Zap,
};

const About = () => {
  const [activeMilestone, setActiveMilestone] = useState<number | null>(null);
  const t = content.about;
  const featuredPassions = t.passions.slice(0, 3);

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-16 sm:space-y-28">

        {/* 1. Hero / Portrait — moved to first */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 items-center">
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.6 }}
            className="space-y-5"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gradient leading-tight">
              {t.heroTitle}
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {t.heroParagraph1}
            </p>
            <p className="text-muted-foreground leading-relaxed">
              {t.heroParagraph2}
            </p>
          </motion.div>

          <motion.div
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="flex justify-center md:justify-end"
          >
            <div className="relative group">
              <div className="absolute -inset-1 rounded-2xl bg-primary/20 blur-xl opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
              <img
                src={bigPortrait}
                alt={t.portraitAlt}
                width={1200}
                height={1202}
                loading="lazy"
                decoding="async"
                className="relative w-64 h-80 object-cover rounded-2xl border border-border shadow-lg"
              />
            </div>
          </motion.div>
        </section>

        {/* 2. Quick Facts — moved to second */}
        <section>
          <motion.h2
            {...fadeUp}
            transition={{ duration: 0.5 }}
            className="text-2xl md:text-3xl font-bold text-gradient mb-8"
          >
            {t.quickFactsTitle}
          </motion.h2>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {t.quickFacts.map((f, i) => {
              const Icon = iconMap[f.icon as keyof typeof iconMap] ?? Sparkles;
              return (
                <motion.div
                  key={f.label}
                  {...fadeUp}
                  transition={{ duration: 0.4, delay: i * 0.06 }}
                  whileHover={{ scale: 1.04 }}
                  className="glass rounded-2xl p-4 flex items-center gap-3 cursor-default"
                >
                  <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-accent" />
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
                      {f.label}
                    </p>
                    <p className="text-sm font-semibold text-foreground">
                      {f.value}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* 3. Journey Timeline */}
        <section>
          <motion.h2
            {...fadeUp}
            transition={{ duration: 0.5 }}
            className="text-2xl md:text-3xl font-bold text-gradient mb-10"
          >
            {t.journeyTitle}
          </motion.h2>

          <div className="relative">
            <div className="absolute left-[19px] top-0 bottom-0 w-px bg-border md:left-1/2 md:-translate-x-px" />

            <div className="space-y-10">
              {t.journeyMilestones.map((m, i) => {
                const Icon = iconMap[m.icon as keyof typeof iconMap] ?? Sparkles;
                const isRight = i % 2 === 1;
                const isActive = activeMilestone === i;

                return (
                  <motion.div
                    key={m.year}
                    {...fadeUp}
                    transition={{ duration: 0.5, delay: i * 0.08 }}
                    className={`relative flex items-start gap-4 sm:gap-5 md:gap-0 ${
                      isRight ? "md:flex-row-reverse" : ""
                    }`}
                    onMouseEnter={() => setActiveMilestone(i)}
                    onMouseLeave={() => setActiveMilestone(null)}
                  >
                    <div className="relative z-10 flex-shrink-0 w-10 h-10 rounded-full glass border border-border flex items-center justify-center md:absolute md:left-1/2 md:-translate-x-1/2">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>

                    <div
                      className={`flex-1 md:w-[calc(50%-2.5rem)] ${
                        isRight ? "md:mr-auto md:pr-10" : "md:ml-auto md:pl-10"
                      }`}
                    >
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        onClick={() => setActiveMilestone(isActive ? null : i)}
                        className={`glass rounded-2xl p-5 cursor-pointer transition-all duration-300 ${
                          isActive ? "glow-primary border-primary/30" : ""
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-xs font-semibold text-accent tracking-wider uppercase">
                              {m.year}
                            </span>
                            <h3 className="text-base font-semibold text-foreground mt-1">
                              {m.title}
                            </h3>
                          </div>
                          <ChevronDown
                            className={`w-4 h-4 text-muted-foreground flex-shrink-0 mt-1 transition-transform duration-200 ${
                              isActive ? "rotate-180" : ""
                            }`}
                          />
                        </div>
                        <AnimatePresence>
                          {isActive && (
                            <motion.p
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.25 }}
                              className="text-sm text-muted-foreground mt-2 leading-relaxed overflow-hidden"
                            >
                              {m.detail}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 4. Passions */}
        <section>
          <motion.h2
            {...fadeUp}
            transition={{ duration: 0.5 }}
            className="text-2xl md:text-3xl font-bold text-gradient mb-10"
          >
            {t.passionsTitle}
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredPassions.map((p, i) => {
              const Icon = iconMap[p.icon as keyof typeof iconMap] ?? Sparkles;
              return (
                <motion.div
                  key={p.title}
                  {...fadeUp}
                  transition={{ duration: 0.45, delay: i * 0.07 }}
                  whileHover={{ y: -6, scale: 1.03 }}
                  className="glass rounded-2xl p-8 min-h-[220px] cursor-default group transition-all duration-300 hover:glow-primary hover:border-primary/20 border-t-2 border-primary"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground mb-2">
                    {p.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {p.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* 5. Curiosities */}
        <section>
          <motion.h2
            {...fadeUp}
            transition={{ duration: 0.5 }}
            className="text-2xl md:text-3xl font-bold text-gradient mb-8"
          >
            {t.curiositiesTitle}
          </motion.h2>

          <motion.div
            {...fadeUp}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-wrap gap-3"
          >
            {t.explorations.map((tag, i) => (
              <motion.span
                key={tag}
                initial={{ opacity: 0, scale: 0.85 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: i * 0.04 }}
                whileHover={{ scale: 1.1, y: -3 }}
                className="glass rounded-full px-4 py-2 text-sm font-medium text-foreground cursor-default transition-colors hover:border-primary/30 hover:text-primary"
              >
                {tag}
              </motion.span>
            ))}
          </motion.div>
        </section>

        <div className="pb-12" />
      </div>
    </Layout>
  );
};

export default About;
```

- [ ] **Step 3.2: Verify build passes**

```bash
npm run build
```

Expected: no TypeScript errors.

- [ ] **Step 3.3: Spot-check in dev server**

```bash
npm run dev
```

Visually verify on `/about`:
- Personal intro + portrait appear **first** (before Quick Facts)
- Quick Facts grid appears second
- Timeline milestone cards show a chevron (`⌄`) icon in the top-right
- Tapping/clicking a card opens the detail text and rotates the chevron; clicking again closes it
- On desktop, hovering also opens the detail; moving the mouse away collapses it — this is expected behavior (no lock)
- All 3 passion cards have a visible blue top border
- Section order: Hero → Quick Facts → Journey → Passions → Curiosities

- [ ] **Step 3.4: Commit**

```bash
git add src/pages/About.tsx
git commit -m "feat: about page section reorder, timeline click, passion borders"
```

---

## Task 4: Contact Form — EmailJS Integration

**Files:**
- Modify: `src/pages/Contact.tsx`

### EmailJS account setup (complete this before filling in `.env` and testing)

1. Go to https://www.emailjs.com and create a free account (200 emails/month free).
2. Add an **Email Service** (e.g. Gmail) — copy the **Service ID** (format: `service_xxxxxxx`).
3. Create an **Email Template** with these variable placeholders in the body: `{{from_name}}`, `{{from_email}}`, `{{message}}`. Set the **To Email** to your own address. Copy the **Template ID** (format: `template_xxxxxxx`).
4. Go to **Account → API Keys** — copy your **Public Key**.
5. Fill in `.env`:
   ```
   VITE_EMAILJS_SERVICE_ID=service_xxxxxxx
   VITE_EMAILJS_TEMPLATE_ID=template_xxxxxxx
   VITE_EMAILJS_PUBLIC_KEY=xxxxxxxxxxxxxxxxxxxx
   ```

### Context

Replace the fake `setTimeout` in `handleSubmit` with `emailjs.send()`. **Important:** `@emailjs/browser` v4 changed the API — the fourth argument is now an options object `{ publicKey: string }`, not a bare string. Passing a bare string will cause a TypeScript build error. The replacement code below uses the correct v4 signature.

Verify the error toast keys exist before writing this file:

```bash
grep -c "errorTitle" src/data/content.json
```

Expected: `1` (key is present). If `0`, stop — the key is missing from `content.json` and must be added manually under `contact.toasts` before continuing.

### Full replacement for `src/pages/Contact.tsx`

- [ ] **Step 4.1: Replace `Contact.tsx` with the updated version**

```tsx
import Layout from "@/components/Layout";
import { motion } from "framer-motion";
import { useState } from "react";
import { Mail, Linkedin, Github, Globe, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import emailjs from "@emailjs/browser";
import content from "@/data/content.json";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-40px" },
};

const iconMap = {
  Mail,
  Linkedin,
  Github,
  Globe,
};

const Contact = () => {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sending, setSending] = useState(false);
  const t = content.contact;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = form.name.trim();
    const trimmedEmail = form.email.trim();
    const trimmedMessage = form.message.trim();

    if (!trimmedName || !trimmedEmail || !trimmedMessage) {
      toast({
        title: t.toasts.missingFieldsTitle,
        description: t.toasts.missingFieldsDescription,
        variant: "destructive",
      });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      toast({
        title: t.toasts.invalidEmailTitle,
        description: t.toasts.invalidEmailDescription,
        variant: "destructive",
      });
      return;
    }

    setSending(true);
    try {
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        {
          from_name: trimmedName,
          from_email: trimmedEmail,
          message: trimmedMessage,
        },
        { publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY }
      );
      setForm({ name: "", email: "", message: "" });
      toast({
        title: t.toasts.successTitle,
        description: t.toasts.successDescription,
      });
    } catch {
      toast({
        title: t.toasts.errorTitle,
        description: t.toasts.errorDescription,
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-14 sm:space-y-20">
        <motion.section
          {...fadeUp}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gradient mb-4">
            {t.title}
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            {t.intro}
          </p>
        </motion.section>

        <section>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
            {t.methods.map((method, i) => {
              const Icon = iconMap[method.icon as keyof typeof iconMap] ?? Mail;
              return (
                <motion.a
                  key={method.label}
                  href={method.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  {...fadeUp}
                  transition={{ duration: 0.4, delay: i * 0.07 }}
                  whileHover={{ y: -6, scale: 1.03 }}
                  className="glass rounded-2xl p-5 flex flex-col items-center gap-3 text-center cursor-pointer group transition-all duration-300 hover:glow-primary hover:border-primary/20"
                >
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {method.label}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {method.value}
                    </p>
                  </div>
                </motion.a>
              );
            })}
          </div>
        </section>

        <motion.section {...fadeUp} transition={{ duration: 0.5, delay: 0.1 }}>
          <div className="glass rounded-2xl p-5 sm:p-8 md:p-10 max-w-2xl mx-auto">
            <h2 className="text-xl font-semibold text-foreground mb-6 text-center">
              {t.form.title}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  placeholder={t.form.namePlaceholder}
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  maxLength={100}
                  className="rounded-xl bg-background/50 border-border focus:border-primary/40 placeholder:text-muted-foreground/50"
                />
                <Input
                  type="email"
                  placeholder={t.form.emailPlaceholder}
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  maxLength={255}
                  className="rounded-xl bg-background/50 border-border focus:border-primary/40 placeholder:text-muted-foreground/50"
                />
              </div>
              <Textarea
                placeholder={t.form.messagePlaceholder}
                value={form.message}
                onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                maxLength={1000}
                rows={5}
                className="rounded-xl bg-background/50 border-border focus:border-primary/40 placeholder:text-muted-foreground/50 resize-none"
              />
              <div className="flex justify-center">
                <Button
                  type="submit"
                  disabled={sending}
                  className="rounded-full px-8 py-2.5 text-sm font-medium gap-2"
                >
                  {sending ? t.form.sending : t.form.send}
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </form>
          </div>
        </motion.section>

        <motion.section
          {...fadeUp}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="pb-8"
        >
          <div className="glass rounded-2xl p-6 max-w-xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-400" />
              </span>
              <span className="text-sm font-semibold text-foreground">
                {t.availability.title}
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t.availability.description}
            </p>
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {t.availability.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary font-medium flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </motion.section>
      </div>
    </Layout>
  );
};

export default Contact;
```

- [ ] **Step 4.2: Verify build passes**

```bash
npm run build
```

Expected: no TypeScript errors. The env vars will be empty strings if `.env` credentials are not yet filled in — the build still passes; the form will return an error toast when submitted without valid credentials.

- [ ] **Step 4.3: Spot-check in dev server**

```bash
npm run dev
```

Visually verify on `/contact`:
- Form submits, button shows "Sending..." and is disabled while waiting
- **Without real credentials:** submitting shows the error toast ("Something went wrong") — this confirms the error path works
- **With real credentials in `.env`:** submitting sends an actual email and shows the success toast, form clears
- No browser console errors about missing modules

- [ ] **Step 4.4: Final commit**

```bash
git add src/pages/Contact.tsx
git commit -m "feat: wire contact form to EmailJS for real email delivery"
```

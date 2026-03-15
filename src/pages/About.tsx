import Layout from "@/components/Layout";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import portrait from "@/assets/portrait.jpg";
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
} from "lucide-react";

/* ───────── animation helpers ───────── */
const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
};

/* ───────── data ───────── */
const journeyMilestones = [
  {
    year: "2014",
    title: "First Line of Code",
    detail:
      "Wrote my first Python script to automate a tedious homework task. Instantly hooked by the power of turning logic into action.",
    icon: Terminal,
  },
  {
    year: "2016",
    title: "Fell in Love with Systems",
    detail:
      "Built a multiplayer game server in Java during university. Discovered the magic of networking, concurrency, and distributed state.",
    icon: Rocket,
  },
  {
    year: "2017",
    title: "First Real Job",
    detail:
      "Joined CodeForge Inc. as a junior developer. Learned the discipline of production code, testing culture, and shipping under pressure.",
    icon: Code2,
  },
  {
    year: "2019",
    title: "The Backend Deep-Dive",
    detail:
      "Moved to Orbital Labs and went deep into APIs, data pipelines, and infrastructure-as-code. Started thinking in systems, not features.",
    icon: Layers,
  },
  {
    year: "2021",
    title: "Discovered Rust & Go",
    detail:
      "Picked up Go for microservices and Rust for performance-critical tools. These languages reshaped how I think about correctness and efficiency.",
    icon: Lightbulb,
  },
  {
    year: "2023",
    title: "Leading at Scale",
    detail:
      "Now architecting event-driven platforms processing millions of events/sec. Leading teams, mentoring engineers, and shaping technical vision.",
    icon: Zap,
  },
];

const passions = [
  {
    icon: Server,
    title: "Scalable Backends",
    description:
      "Designing systems that handle millions of requests without breaking a sweat.",
  },
  {
    icon: Cloud,
    title: "Cloud Architecture",
    description:
      "Building resilient, cost-effective infrastructure on AWS, GCP, and beyond.",
  },
  {
    icon: Database,
    title: "Data-Driven Systems",
    description:
      "Turning raw data into real-time insights through smart pipeline design.",
  },
  {
    icon: Brain,
    title: "AI & Automation",
    description:
      "Using LLMs and ML to augment engineering workflows and developer tooling.",
  },
  {
    icon: Gauge,
    title: "Performance",
    description:
      "Obsessing over latency, throughput, and efficiency at every layer of the stack.",
  },
];

const explorations = [
  "Multi-agent Systems",
  "WebAssembly",
  "Distributed Consensus",
  "AI Developer Tooling",
  "Edge Computing",
  "Rust for Systems",
  "Event Sourcing",
  "Platform Engineering",
  "LLM Orchestration",
  "Observability",
];

const quickFacts = [
  { label: "Experience", value: "7+ years", icon: Sparkles },
  { label: "Favorite Language", value: "Go & Rust", icon: Code2 },
  { label: "Passion", value: "Distributed Systems", icon: Heart },
  { label: "Stack", value: "Go · React · K8s · AWS", icon: Layers },
  { label: "Location", value: "San Francisco, CA", icon: MapPin },
  { label: "Fuel", value: "Espresso ☕", icon: Coffee },
];

/* ───────── component ───────── */
const About = () => {
  const [activeMilestone, setActiveMilestone] = useState<number | null>(null);

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-6 py-12 space-y-28">
        {/* ── 0. Quick Facts ── */}
        <section>
          <motion.h2
            {...fadeUp}
            transition={{ duration: 0.5 }}
            className="text-2xl md:text-3xl font-bold text-gradient mb-8"
          >
            Quick Facts
          </motion.h2>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {quickFacts.map((f, i) => {
              const Icon = f.icon;
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

        {/* ── 1. Hero Intro ── */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 items-center">
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.6 }}
            className="space-y-5"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gradient leading-tight">
              About Me
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              I'm a software engineer who builds systems at the intersection of
              scale and simplicity. With 7+ years across the full stack — from
              low-level Go and Rust services to polished React interfaces — I
              craft infrastructure that's reliable, fast, and invisible to the
              end user.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              I believe the best engineering feels effortless. My mission is to
              turn complex distributed problems into clean, observable, and
              maintainable systems — and to help teams ship with confidence.
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
                src={portrait}
                alt="Portrait"
                className="relative w-64 h-80 object-cover rounded-2xl border border-border shadow-lg"
              />
            </div>
          </motion.div>
        </section>

        {/* ── 2. Engineering Journey Timeline ── */}
        <section>
          <motion.h2
            {...fadeUp}
            transition={{ duration: 0.5 }}
            className="text-2xl md:text-3xl font-bold text-gradient mb-10"
          >
            Engineering Journey
          </motion.h2>

          <div className="relative">
            {/* vertical line */}
            <div className="absolute left-[19px] top-0 bottom-0 w-px bg-border md:left-1/2 md:-translate-x-px" />

            <div className="space-y-10">
              {journeyMilestones.map((m, i) => {
                const Icon = m.icon;
                const isRight = i % 2 === 1;
                const isActive = activeMilestone === i;

                return (
                  <motion.div
                    key={m.year}
                    {...fadeUp}
                    transition={{ duration: 0.5, delay: i * 0.08 }}
                    className={`relative flex items-start gap-5 md:gap-0 ${
                      isRight ? "md:flex-row-reverse" : ""
                    }`}
                    onMouseEnter={() => setActiveMilestone(i)}
                    onMouseLeave={() => setActiveMilestone(null)}
                  >
                    {/* dot */}
                    <div className="relative z-10 flex-shrink-0 w-10 h-10 rounded-full glass border border-border flex items-center justify-center md:absolute md:left-1/2 md:-translate-x-1/2">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>

                    {/* card */}
                    <div
                      className={`flex-1 md:w-[calc(50%-2.5rem)] ${
                        isRight ? "md:mr-auto md:pr-10" : "md:ml-auto md:pl-10"
                      }`}
                    >
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className={`glass rounded-2xl p-5 cursor-pointer transition-all duration-300 ${
                          isActive ? "glow-blue border-primary/30" : ""
                        }`}
                      >
                        <span className="text-xs font-semibold text-accent tracking-wider uppercase">
                          {m.year}
                        </span>
                        <h3 className="text-base font-semibold text-foreground mt-1">
                          {m.title}
                        </h3>
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

        {/* ── 3. What I Love Building ── */}
        <section>
          <motion.h2
            {...fadeUp}
            transition={{ duration: 0.5 }}
            className="text-2xl md:text-3xl font-bold text-gradient mb-10"
          >
            What I Love Building
          </motion.h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {passions.map((p, i) => {
              const Icon = p.icon;
              return (
                <motion.div
                  key={p.title}
                  {...fadeUp}
                  transition={{ duration: 0.45, delay: i * 0.07 }}
                  whileHover={{ y: -6, scale: 1.03 }}
                  className="glass rounded-2xl p-6 cursor-default group transition-all duration-300 hover:glow-blue hover:border-primary/20"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground mb-1">
                    {p.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {p.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* ── 4. Current Explorations ── */}
        <section>
          <motion.h2
            {...fadeUp}
            transition={{ duration: 0.5 }}
            className="text-2xl md:text-3xl font-bold text-gradient mb-8"
          >
            Current Curiosities
          </motion.h2>

          <motion.div
            {...fadeUp}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-wrap gap-3"
          >
            {explorations.map((tag, i) => (
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

        {/* spacer */}
        <div className="pb-12" />
      </div>
    </Layout>
  );
};

export default About;

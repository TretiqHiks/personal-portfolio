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

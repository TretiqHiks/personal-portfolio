import Layout from "@/components/Layout";
import { motion } from "framer-motion";
import { experiences, skillCategories } from "@/data/portfolio";
import { useState } from "react";
import content from "@/data/content.json";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const Experience = () => {
  const [highlightedSkills, setHighlightedSkills] = useState<string[]>([]);
  const t = content.experiencePage;

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

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Timeline */}
          <div className="lg:col-span-3 relative">
            {/* Vertical line */}
            <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border" />

            <div className="space-y-8">
              {experiences.map((exp, i) => {
                const isCurrent = i === 0;
                return (
                <motion.div
                  key={exp.id}
                  {...fadeUp}
                  transition={{ duration: 0.4, delay: 0.1 * i }}
                  className="relative pl-10 group cursor-default"
                  onMouseEnter={() => setHighlightedSkills(exp.skills)}
                  onMouseLeave={() => setHighlightedSkills([])}
                >
                  {/* Dot */}
                  <div className={`absolute top-1 rounded-full border-2 border-primary bg-background transition-all duration-200 group-hover:bg-primary group-hover:scale-150 ${
                    isCurrent ? "left-[-2px] w-[19px] h-[19px]" : "left-0 w-[15px] h-[15px]"
                  }`} />

                  <div className="glass rounded-2xl p-5 transition-all duration-200 group-hover:glow-primary">
                    <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 mb-2">
                      <h3 className="text-base font-semibold text-foreground">
                        {exp.role}
                      </h3>
                      <span className="text-xs font-medium text-muted-foreground">
                        {exp.period}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-primary mb-2">
                      {exp.company}
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {exp.description}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {exp.skills.map((skill) => (
                        <span
                          key={skill}
                          className="text-[11px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
                );
              })}
            </div>
          </div>

          {/* Skill Matrix */}
          <div className="lg:col-span-2">
            <motion.div
              {...fadeUp}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="sticky top-8"
            >
              <h2 className="text-lg font-semibold text-foreground mb-6">
                {t.skillMatrixTitle}
              </h2>
              <div className="space-y-5">
                {skillCategories.map((category) => (
                  <div key={category.name}>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                      {category.name}
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {category.skills.map((skill) => {
                        const isHighlighted = highlightedSkills.includes(skill);
                        return (
                          <span
                            key={skill}
                            className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all duration-200 ${
                              isHighlighted
                                ? "bg-primary text-primary-foreground glow-primary scale-105"
                                : highlightedSkills.length > 0
                                ? "glass text-muted-foreground/50"
                                : "glass text-secondary-foreground hover:text-foreground hover:border-primary/30"
                            }`}
                          >
                            {skill}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Experience;

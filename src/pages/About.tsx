import Layout from "@/components/Layout";
import { motion } from "framer-motion";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const sections = [
  {
    title: "Who I Am",
    content:
      "I'm a software engineer with 7+ years of experience building systems at scale. I've worked across the stack — from low-level networking code in Go and Rust to polished React interfaces — but my sweet spot is backend architecture and distributed systems. I'm driven by the belief that great engineering is invisible: reliable, fast, and delightful to use.",
  },
  {
    title: "Engineering Philosophy",
    content:
      "I approach software like an architect approaches buildings — with intention. Every technical decision should serve the user, the team, and the future maintainer. I value simplicity over cleverness, observability over assumptions, and shipping over perfecting. I believe the best engineers are great communicators who can translate complexity into clarity.",
  },
  {
    title: "Problems I Love",
    content:
      "I gravitate toward problems that sit at the intersection of scale and user experience. How do you process a million events per second while keeping the dashboard responsive? How do you design an API that's powerful enough for experts yet intuitive for beginners? These are the kinds of challenges that keep me energized.",
  },
  {
    title: "What I'm Exploring",
    content:
      "Right now I'm deep into WebAssembly for edge computing, experimenting with AI-assisted developer tooling, and building with Rust for performance-critical systems. I'm also interested in how LLMs can augment — not replace — engineering workflows, and I contribute to open-source projects that align with my values.",
  },
];

const About = () => {
  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-6 py-16">
        <motion.h1
          {...fadeUp}
          transition={{ duration: 0.5 }}
          className="text-3xl md:text-4xl font-bold text-gradient mb-12"
        >
          About Me
        </motion.h1>

        <div className="space-y-10">
          {sections.map((section, i) => (
            <motion.div
              key={section.title}
              {...fadeUp}
              transition={{ duration: 0.5, delay: 0.1 * (i + 1) }}
              className="glass rounded-2xl p-6"
            >
              <h2 className="text-lg font-semibold text-foreground mb-3">
                {section.title}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {section.content}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default About;

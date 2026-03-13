import Layout from "@/components/Layout";
import { motion } from "framer-motion";
import { projects } from "@/data/portfolio";
import { Link } from "react-router-dom";
import { ArrowUpRight, Github } from "lucide-react";
import { getProjectImage } from "@/lib/projectImages";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const Projects = () => {
  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-6 py-16">
        <motion.h1
          {...fadeUp}
          transition={{ duration: 0.5 }}
          className="text-3xl md:text-4xl font-bold text-gradient mb-12"
        >
          Projects
        </motion.h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project, i) => {
            const img = getProjectImage(project.image);
            return (
              <motion.div
                key={project.id}
                {...fadeUp}
                transition={{ duration: 0.4, delay: 0.1 * i }}
              >
                <Link
                  to={`/projects/${project.id}`}
                  className="block glass rounded-2xl overflow-hidden h-full transition-all duration-300 hover:glow-blue hover:border-primary/20 group"
                >
                  {img && (
                    <div className="w-full h-40 overflow-hidden">
                      <img
                        src={img}
                        alt={project.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                        {project.title}
                      </h3>
                      <div className="flex gap-2">
                        {project.github && (
                          <Github className="w-4 h-4 text-muted-foreground" />
                        )}
                        {project.demo && (
                          <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                      {project.summary}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {project.techStack.map((tech) => (
                        <span
                          key={tech}
                          className="text-[11px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
};

export default Projects;

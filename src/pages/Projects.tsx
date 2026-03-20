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

import Layout from "@/components/Layout";
import { motion } from "framer-motion";
import { useParams, Link } from "react-router-dom";
import { projects } from "@/data/portfolio";
import { ArrowLeft, ArrowUpRight, Github, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getProjectImage } from "@/lib/projectImages";
import content from "@/data/content.json";
import { ArchitectureDiagram } from "@/components/ArchitectureDiagram";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const ProjectDetail = () => {
  const { id } = useParams();
  const project = projects.find((p) => p.id === id);
  const t = content.projectDetailPage;

  if (!project) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">{t.notFoundTitle}</h1>
            <Button asChild variant="outline" className="rounded-full">
              <Link to="/projects">
                <ArrowLeft className="w-4 h-4 mr-2" /> {t.backToProjects}
              </Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const img = getProjectImage(project.image);

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-6 py-16">
        {/* Back */}
        <motion.div {...fadeUp} transition={{ duration: 0.4 }}>
          <Link
            to="/projects"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" /> {t.backToProjects}
          </Link>
        </motion.div>

        {/* Title */}
        <motion.h1
          {...fadeUp}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="text-3xl md:text-4xl font-bold text-gradient mb-4"
        >
          {project.title}
        </motion.h1>

        {/* Links */}
        <motion.div
          {...fadeUp}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex gap-3 mb-8"
        >
          {project.github && (
            <a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Github className="w-4 h-4" /> {t.sourceCode}
            </a>
          )}
          {project.demo && (
            <a
              href={project.demo}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowUpRight className="w-4 h-4" /> {t.liveDemo}
            </a>
          )}
          {project.pypi && (
            <a
              href={project.pypi}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Package className="w-4 h-4" /> PyPI
            </a>
          )}
        </motion.div>

        {/* Project Image */}
        {img && (
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.4, delay: 0.12 }}
            className="mb-10 rounded-2xl overflow-hidden glass"
          >
            <img
              src={img}
              alt={project.title}
              className="w-full h-auto object-cover"
            />
          </motion.div>
        )}

        {/* Tech Stack */}
        <motion.div
          {...fadeUp}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="flex flex-wrap gap-2 mb-10"
        >
          {project.techStack.map((tech) => (
            <span
              key={tech}
              className="text-xs px-3 py-1 rounded-lg glass text-primary font-medium"
            >
              {tech}
            </span>
          ))}
        </motion.div>

        {/* Description */}
        <motion.div
          {...fadeUp}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mb-10"
        >
          <h2 className="text-lg font-semibold text-foreground mb-3">{t.overviewTitle}</h2>
          <p className="text-muted-foreground leading-relaxed">{project.description}</p>
        </motion.div>

        {/* Visual Architecture Diagram */}
        {project.architectureDiagram && (
          <ArchitectureDiagram
            modules={project.architectureDiagram.modules}
            internalSteps={project.architectureDiagram.internalSteps}
          />
        )}

        {/* Text Architecture Diagram */}
        {project.diagram && (
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.4, delay: 0.22 }}
            className="glass rounded-2xl p-6 mb-10"
          >
            <h2 className="text-lg font-semibold text-foreground mb-4">Architecture Overview</h2>
            <pre className="text-xs text-muted-foreground font-mono leading-relaxed whitespace-pre overflow-x-auto">
              {project.diagram}
            </pre>
          </motion.div>
        )}

        {/* Features */}
        <motion.div
          {...fadeUp}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="glass rounded-2xl p-6 mb-6"
        >
          <h2 className="text-lg font-semibold text-foreground mb-4">{t.featuresTitle}</h2>
          <ul className="space-y-2">
            {project.features.map((feature, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Challenges */}
        <motion.div
          {...fadeUp}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="glass rounded-2xl p-6"
        >
          <h2 className="text-lg font-semibold text-foreground mb-4">
            {t.highlightsTitle}
          </h2>
          <div className="space-y-4">
            {project.challenges.map((challenge, i) => (
              <p key={i} className="text-sm text-muted-foreground leading-relaxed border-l-2 border-primary/30 pl-4">
                {challenge}
              </p>
            ))}
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default ProjectDetail;

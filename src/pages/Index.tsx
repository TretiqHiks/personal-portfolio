import Layout from "@/components/Layout";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Briefcase } from "lucide-react";
import smallPortrait from "@/assets/small_portrait.png";
import content from "@/data/content.json";

const Index = () => {
  const t = content.home;

  return (
    <Layout noScroll>
      <div
        className="flex items-center justify-center px-4"
        style={{ height: "calc(100vh - 120px)" }}
      >
        <div className="flex flex-col items-center text-center px-4 max-w-3xl mx-auto gap-4 sm:gap-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-28 h-28 rounded-full glass glow-primary overflow-hidden"
          >
            <img
              src={smallPortrait}
              alt={t.portraitAlt}
              width={646}
              height={650}
              decoding="async"
              className="w-full h-full object-cover object-[center_15%] scale-150"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gradient mb-2">
              {t.name}
            </h1>
            <p className="text-lg text-muted-foreground font-medium">{t.title}</p>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-muted-foreground leading-relaxed max-w-xl"
          >
            {t.bio}
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-sm italic text-muted-foreground/70 border-l-2 border-primary/30 pl-4"
          >
            "{t.quote}"
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-3 mt-2 w-full sm:w-auto"
          >
            <Button asChild size="lg" className="rounded-full gap-2 glow-primary">
              <Link to="/projects">
                {t.ctaPrimary} <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full gap-2">
              <Link to="/experience">
                <Briefcase className="w-4 h-4" /> {t.ctaSecondary}
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default Index;

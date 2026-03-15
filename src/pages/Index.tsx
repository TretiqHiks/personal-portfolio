import Layout from "@/components/Layout";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Briefcase } from "lucide-react";

const Index = () => {
  return (
    <Layout noScroll>
      <div className="flex items-center justify-center px-4" style={{ height: "calc(100vh - 120px)" }}>
        <div className="flex flex-col items-center text-center px-4 max-w-3xl mx-auto gap-4 sm:gap-6">
          {/* Avatar */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-28 h-28 rounded-full glass glow-blue flex items-center justify-center text-3xl font-bold text-primary"
          >
            AK
          </motion.div>

          {/* Name & Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gradient mb-2">
              Alex Kowalski
            </h1>
            <p className="text-lg text-muted-foreground font-medium">
              Senior Software Engineer
            </p>
          </motion.div>

          {/* Bio */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-muted-foreground leading-relaxed max-w-xl"
          >
            I build scalable distributed systems and craft elegant developer tools.
            Passionate about performance, clean architecture, and shipping products that matter.
          </motion.p>

          {/* Quote */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-sm italic text-muted-foreground/70 border-l-2 border-primary/30 pl-4"
          >
            "The best code is the code that doesn't need to exist — the second best is code that's a joy to read."
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-3 mt-2 w-full sm:w-auto"
          >
            <Button asChild size="lg" className="rounded-full gap-2 glow-blue">
              <Link to="/projects">
                View Projects <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full gap-2">
              <Link to="/experience">
                <Briefcase className="w-4 h-4" /> Experience
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
